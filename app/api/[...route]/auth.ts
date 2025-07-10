import db from "@/db";
import { users } from "@/db/schema";
import admin, { auth } from "@/firebase";
import { findUserByEmail } from "@/lib/services/userService";
import { ErrorResponses, SuccessResponses } from "@/utils/responses";
import {
  authValidator,
  loginValidator,
  otpValidator,
  signUpValidator,
} from "@/zod/auth";
import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

function createToken(user: { id: string; email: string; name: string }) {
  return admin
    .auth()
    .createCustomToken(user.id, { email: user.email, name: user.name });
}

const authRoute = new Hono()
  .post("/firebase", zValidator("form", authValidator), async (c) => {
    const data = await c.req.formData();
    const idToken = data.get("idToken");

    // verifyIdToken from Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(idToken as string);

    console.log(decodedToken);

    if (!decodedToken) return c.json(ErrorResponses.unauthorized(), 401);
    if (!decodedToken.email_verified)
      return c.json(ErrorResponses.unauthorized("Email not verified"), 401);
    if (!decodedToken.email)
      return c.json(ErrorResponses.notFound("Email"), 401);

    let existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, decodedToken.email))
      .limit(1);

    let user = existingUser[0];

    // If user does not exist, create a new user
    if (!user) {
      const newUser = await db
        .insert(users)
        .values({
          name: decodedToken.name,
          email: decodedToken.email,
          picture: decodedToken.picture?.toString() || "",
          isVerified: 1,
          otp: "",
          otpExpiresAt: new Date(),
          password: "",
          totalAmount: "0",
        })
        .returning();
      user = newUser[0];
    }

    const userToken = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const token = await createToken(userToken);

    return c.json(
      {
        message: "Successfully logged in",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          totalAmount: user.totalAmount,
          picture: decodedToken.picture?.toString() || "",
          token,
        },
      },
      200
    );
  })
  .post("/login", zValidator("form", loginValidator), async (c) => {
    const data = await c.req.json();
    const { email, password } = data;

    const user = await findUserByEmail(email);

    if (!user) {
      return c.json(ErrorResponses.notFound("User"));
    }

    if (!user.isVerified) {
      return c.json(ErrorResponses.unauthorized("User not verified"));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return c.json(ErrorResponses.unauthorized("Invalid password"));
    }

    const userToken = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const token = await createToken(userToken);

    return c.json(
      SuccessResponses.success("Successfully logged in", {
        id: user.id,
        name: user.name,
        email: user.email,
        totalAmount: user.totalAmount,
        picture: user.picture || "",
        token,
      })
    );
  })
  .post("/signup", zValidator("form", signUpValidator), async (c) => {
    const { name, email, password } = await c.req.json();

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return c.json(ErrorResponses.alreadyExists("User"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        otp,
        otpExpiresAt,
        totalAmount: "0",
      })
      .returning();

    const user = newUser[0];
    if (!user) {
      return c.json(ErrorResponses.serverError("User creation failed"));
    }

    // Send OTP to user's email (implementation not shown)
    // await sendOtpEmail(user.email, otp);
    console.log(`OTP for ${user.email}: ${otp}`);

    return c.json(
      SuccessResponses.success(
        "User created successfully. Please verify your email.",
        {
          id: user.id,
          name: user.name,
          email: user.email,
          totalAmount: user.totalAmount,
          picture: user.picture || "",
        }
      )
    );
  })
  .post("/verify", zValidator("form", otpValidator), async (c) => {
    const data = await c.req.json();
    const { email, otp } = data;
    const user = await findUserByEmail(email);
    if (!user) {
      return c.json(ErrorResponses.notFound("User"));
    }
    if (user.otp !== otp) {
      return c.json(ErrorResponses.unauthorized("Invalid OTP"));
    }
    if (new Date() > user.otpExpiresAt) {
      return c.json(ErrorResponses.unauthorized("OTP expired"));
    }
    await db
      .update(users)
      .set({ isVerified: 1, otp: "", otpExpiresAt: new Date() })
      .where(eq(users.id, user.id));

    const userToken = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    const token = await createToken(userToken);
    return c.json(
      SuccessResponses.success("User verified successfully", {
        id: user.id,
        name: user.name,
        email: user.email,
        totalAmount: user.totalAmount,
        picture: user.picture || "",
        token,
      })
    );
  });

export default authRoute;
