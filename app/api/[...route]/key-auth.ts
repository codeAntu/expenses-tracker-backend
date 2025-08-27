import { connectRedis, redis } from "@/config/redis";
import db from "@/db";
import key from "@/db/schema/key";
import { Responses } from "@/utils/responses";
import { zValidator } from "@hono/zod-validator";
import { constants, createVerify, randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET!;

const keyAuthValidator = z.object({
  email: z.string().email("Invalid email format"),
  publicKey: z.string().min(1, "Public key is required"),
});

await connectRedis();

const KeyAuth = new Hono()
  .post("/register", zValidator("json", keyAuthValidator), async (c) => {
    try {
      const { email, publicKey } = c.req.valid("json");

      const existingUser = await db
        .select()
        .from(key)
        .where(eq(key.email, email));

      if (existingUser.length > 0) {
        const updatedKey = await db
          .update(key)
          .set({
            publicKey,
            updatedAt: new Date(),
          })
          .where(eq(key.email, email))
          .returning({
            id: key.id,
            email: key.email,
          });

        return c.json(
          Responses.success("Key updated successfully", updatedKey[0]),
          200
        );
      }

      const newKey = await db
        .insert(key)
        .values({
          email,
          publicKey,
        })
        .returning({
          id: key.id,
          email: key.email,
        });

      return c.json(
        Responses.success("Key registered successfully", newKey[0]),
        201
      );
    } catch (error) {
      return c.json(Responses.error("Failed to register key", error), 500);
    }
  })
  .post(
    "/challenge",
    zValidator("json", z.object({ email: z.string().email() })),
    async (c) => {
      try {
        const { email } = await c.req.valid("json");

        const user = await db
          .select()
          .from(key)
          .where(eq(key.email, email))
          .limit(1);

        if (user.length === 0) {
          return c.json(Responses.notFound("User not found"), 404);
        }

        const challenge = randomBytes(32).toString("hex");

        const challengeKey = `challenge:${email}`;
        await redis.setEx(challengeKey, 300, challenge); 

        return c.json(
          Responses.success("Challenge generated", {
            challenge: challenge,
            expiresIn: 300, // seconds
          }),
          200
        );
      } catch (error) {
        return c.json(
          Responses.error("Failed to generate challenge", error),
          500
        );
      }
    }
  )
  .post(
    "/verify",
    zValidator(
      "json",
      z.object({
        email: z.string().email(),
        signature: z.string().min(1, "Signature is required"),
      })
    ),
    async (c) => {
      try {
        const { email, signature } = c.req.valid("json");

        const user = await db
          .select()
          .from(key)
          .where(eq(key.email, email))
          .limit(1);

        if (user.length === 0) {
          return c.json(Responses.notFound("User not found"), 404);
        }

        const challengeKey = `challenge:${email}`;
        const challenge = await redis.get(challengeKey);

        if (!challenge) {
          return c.json(
            Responses.notFound("Challenge not found or expired"),
            404
          );
        }

        // Verify the signature using RSA-PSS
        const publicKeyPem = user[0].publicKey;

        try {
          const verifier = createVerify("sha256");
          verifier.update(challenge, "utf8");
          verifier.end();

          const isValid = verifier.verify(
            {
              key: publicKeyPem,
              padding: constants.RSA_PKCS1_PSS_PADDING,
              saltLength: constants.RSA_PSS_SALTLEN_DIGEST,
            },
            signature,
            "base64"
          );

          if (!isValid) {
            return c.json(Responses.unauthorized("Invalid signature"), 401);
          }
        } catch (verifyError) {
          return c.json(
            Responses.unauthorized("Signature verification failed"),
            401
          );
        }

        await redis.del(challengeKey);

        const tokenData = { email: user[0].email, id: user[0].id };
        const token = await jwt.sign(tokenData, JWT_SECRET, {
          expiresIn: "5y",
        });

        return c.json(Responses.success("Signature verified", { token }), 200);
      } catch (error) {
        return c.json(
          Responses.error("Failed to verify signature", error),
          500
        );
      }
    }
  )
  .get("/protected", async (c) => {
    try {
      const authHeader = c.req.header("Authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return c.json(Responses.unauthorized("Missing or invalid token"), 401);
      }

      const token = authHeader.substring(7);

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
          email: string;
          id: string;
        };

        // Get user data from database
        const user = await db
          .select()
          .from(key)
          .where(eq(key.id, decoded.id))
          .limit(1);

        if (user.length === 0) {
          return c.json(Responses.notFound("User not found"), 404);
        }

        const userData = {
          id: user[0].id,
          email: user[0].email,
          publicKey: user[0].publicKey,
          createdAt: user[0].createdAt,
          updatedAt: user[0].updatedAt,
        };

        return c.json(Responses.success("Token is valid", userData), 200);
      } catch (err) {
        return c.json(Responses.unauthorized("Invalid or expired token"), 401);
      }
    } catch (error) {
      return c.json(Responses.error("Failed to verify token", error), 500);
    }
  });

export default KeyAuth;
