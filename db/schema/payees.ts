import { pgTable } from "drizzle-orm/pg-core";
import { accountRef } from "./accounts";
import { Description, Id, Name, createdAt, updatedAt } from "./index";
import { userRef } from "./users";

export const payees = pgTable("payees", {
  id: Id,
  name: Name,
  description: Description,
  userId: userRef(),
  accountId: accountRef(),
  createdAt: createdAt,
  updatedAt: updatedAt,
});
