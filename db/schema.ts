import { relations } from "drizzle-orm";
import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    isVerified: integer("is_verified"),
    picture: varchar("profile_picture", {
      length: 255,
    })
      .notNull()
      .default(""),
    totalAmount: numeric("total_amount", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("0"),
    otp: varchar("otp", { length: 6 }).notNull().default(""),
    otpExpiresAt: timestamp("otp_expires_at").notNull().defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (user) => {
    return {
      idx: index("custom_name").on(user.id),
      emailIdx: index("email_index").on(user.email),
    };
  }
);

export const transactions = pgTable("transaction", {
  id: uuid("id").primaryKey().defaultRandom(),
  amount: integer("amount").notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  transactionType: transactionTypeEnum("transaction_type").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const transactionTags = pgTable(
  "transaction_tags",
  {
    transactionId: uuid("transaction_id")
      .notNull()
      .references(() => transactions.id),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (table) => {
    return {
      pk: index("transaction_tags_pk").on(table.transactionId, table.tagId),
    };
  }
);

// relations

export const userRelations = relations(users, ({ one, many }) => {
  return {
    transactions: many(transactions),
  };
});

export const transactionRelations = relations(transactions, ({ one, many }) => {
  return {
    user: one(users, {
      fields: [transactions.userId],
      references: [users.id],
    }),
  };
});
