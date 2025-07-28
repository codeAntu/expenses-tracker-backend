import {
  createAccount,
  createAccountValidator,
  deleteAccount,
  depositToAccount,
  getAccountById,
  getAllAccounts,
  updateAccount,
  withdrawDepositValidator,
  withdrawFromAccount,
} from "@/helpers/account";
import { getUser } from "@/utils/context";
import { Responses } from "@/utils/responses";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

const accountRouter = new Hono()
  .get("/", async (c) => {
    const user = getUser(c);

    const accounts = await getAllAccounts(user.id);

    if (!accounts) {
      return c.json(Responses.notFound("No accounts found for this user"));
    }

    return c.json(
      Responses.success("Accounts retrieved successfully", accounts),
      200
    );
  })
  .post("/", zValidator("json", createAccountValidator), async (c) => {
    const user = getUser(c);
    const validated = c.req.valid("json");

    try {
      const account = await createAccount(user.id, {
        title: validated.title,
        description: validated.description,
        icon: validated.icon || "",
        color: validated.color || "",
      });

      return c.json(
        Responses.success("Account created successfully", account),
        201
      );
    } catch (error) {
      return c.json(Responses.error("Failed to create account", error), 500);
    }
  })
  .get("/:id", async (c) => {
    const user = getUser(c);
    const accountId = c.req.param("id");

    try {
      const account = await getAccountById(user.id, accountId);
      if (!account) {
        return c.json(Responses.notFound("Account not found"), 404);
      }

      return c.json(
        Responses.success("Account retrieved successfully", account),
        200
      );
    } catch (error) {
      return c.json(Responses.error("Failed to retrieve account", error), 500);
    }
  })
  .put("/:id", zValidator("json", createAccountValidator), async (c) => {
    const user = getUser(c);
    const validated = c.req.valid("json");
    const accountId = c.req.param("id");

    try {
      const updatedAccount = await updateAccount(user.id, accountId, {
        title: validated.title,
        description: validated.description,
        icon: validated.icon || "",
        color: validated.color || "",
      });

      return c.json(
        Responses.success("Account updated successfully", {
          account: updatedAccount,
        }),
        200
      );
    } catch (error) {
      return c.json(Responses.error("Failed to update account", error), 500);
    }
  })
  .delete("/:id", async (c) => {
    const user = getUser(c);
    const accountId = c.req.param("id");
    try {
      const result = await deleteAccount(user.id, accountId);

      return c.json(
        Responses.success("Account deleted successfully", {
          account: result,
        }),
        200
      );
    } catch (error) {
      return c.json(Responses.error("Failed to delete account", error), 500);
    }
  })
  .post(
    "/:id/deposit",
    zValidator("json", withdrawDepositValidator),
    async (c) => {
      const user = getUser(c);

      const accountId = c.req.param("id");
      const { amount, description } = c.req.valid("json");

      try {
        const result = await depositToAccount(
          user.id,
          accountId,
          amount,
          description
        );

        return c.json(
          Responses.success("Deposit successful", {
            accountId,
            amount,
            account: result,
          }),
          200
        );
      } catch (error) {
        return c.json(Responses.error("Failed to deposit", error), 500);
      }
    }
  )
  .post(
    "/:id/withdraw",
    zValidator("json", withdrawDepositValidator),
    async (c) => {
      const user = getUser(c);

      const accountId = c.req.param("id");
      const { amount, description } = c.req.valid("json");

      try {
        const result = await withdrawFromAccount(
          user.id,
          accountId,
          -amount,
          description
        );

        return c.json(
          Responses.success("Withdrawal successful", {
            accountId,
            amount,
            account: result,
          }),
          200
        );
      } catch (error) {
        return c.json(Responses.error("Failed to withdraw", error), 500);
      }
    }
  );

export default accountRouter;
