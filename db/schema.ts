import { index, pgEnum } from "drizzle-orm/pg-core";
import {
  integer,
  numeric,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense"]);

export const usersTable = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    totalAmount: numeric("total_amount", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("0"),
  },
  (user) => {
    return {
      idx: index("custom_name").on(user.id),
      emailIdx: index("email_index").on(user.email),
    };
  }
);

// export const TransactionTable = pgTable("transaction", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   amount: integer().notNull(),
//   description: varchar({ length: 255 }).notNull(),
//   // transactionType: transactionTypeEnum().notNull(),
//   userId: uuid("user_id")
//     .notNull()
//     .references(() => usersTable.id),
// });
