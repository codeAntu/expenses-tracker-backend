import {
  createAccount,
  createAccountValidator,
  deleteAccount,
  depositToAccount,
  getAllAccounts,
  updateAccount,
  withdrawDepositValidator,
  withdrawFromAccount,
} from "@/helpers/account";
import { isLoggedIn } from "@/middleware/checkLogin";
import { getUser } from "@/utils/context";
import { Responses } from "@/utils/responses";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

const accountRouter = new Hono();

accountRouter.use("*", isLoggedIn);

accountRouter.get("/", async (c) => {
  const user = getUser(c);

  const accounts = getAllAccounts(user.id);

  if (!accounts) {
    return c.json(Responses.notFound("No accounts found for this user"));
  }

  return c.json(
    Responses.success("Accounts retrieved successfully", accounts),
    200
  );
});

// createAccount
accountRouter.post(
  "/",
  zValidator("json", createAccountValidator),
  async (c) => {
    const user = getUser(c);
    const data = await c.req.json();

    try {
      const account = await createAccount(user.id, {
        name: data.name,
        description: data.description,
        icon: data.icon || "",
        color: data.color || "",
      });

      return c.json(
        Responses.success("Account created successfully", account),
        201
      );
    } catch (error) {
      return c.json(Responses.error("Failed to create account", error), 500);
    }
  }
);

// updateAccount
accountRouter.put(
  "/:id",
  zValidator("json", createAccountValidator),
  async (c) => {
    const user = getUser(c);
    const data = await c.req.json();
    const accountId = c.req.param("id");

    try {
      const updatedAccount = await updateAccount(user.id, accountId, {
        name: data.name,
        description: data.description,
        icon: data.icon || "",
        color: data.color || "",
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
  }
);

// deleteAccount
accountRouter.delete("/:id", async (c) => {
  const user = getUser(c);
  const accountId = c.req.param("id");

  try {
    const result = await deleteAccount(accountId, user.id);

    return c.json(
      Responses.success("Account deleted successfully", {
        account: result,
      }),
      200
    );
  } catch (error) {
    return c.json(Responses.error("Failed to delete account", error), 500);
  }
});

// deposit
accountRouter.post(
  "/:id/deposit",
  zValidator("json", withdrawDepositValidator),
  async (c) => {
    const user = getUser(c);

    const accountId = c.req.param("id");
    const { amount, description } = await c.req.json();

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
);

accountRouter.post(
  "/:id/withdraw",
  zValidator("json", withdrawDepositValidator),
  async (c) => {
    const user = getUser(c);

    const accountId = c.req.param("id");
    const { amount, description } = await c.req.json();

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
