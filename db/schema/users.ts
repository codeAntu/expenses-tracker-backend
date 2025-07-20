import { index, pgTable, uuid } from "drizzle-orm/pg-core";
import { Email, Id, Name, Picture, createdAt, updatedAt } from "./index";

export const users = pgTable(
  "users",
  {
    id: Id,
    name: Name,
    email: Email,
    picture: Picture,
    createdAt: createdAt,
    updatedAt: updatedAt,
  },
  (user) => {
    return {
      idx: index("custom_name").on(user.id),
      emailIdx: index("email_index").on(user.email),
    };
  }
);

// Function to reference users table
export function userRef() {
  return uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" });
}
