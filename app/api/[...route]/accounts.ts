import { Hono } from "hono";
import { isLoggedIn } from "@/middleware/checkLogin";
import { getUser } from "@/utils/context";
import { getAllAccounts } from "@/helpers/account";
import { Responses } from "@/utils/responses";

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


