import { relations } from "drizzle-orm";
import { Accounts } from "./accounts";
import { expenseCategories } from "./expenseCategories";
import { goals } from "./goals";
import { payees } from "./payees";
import { transactionsTable } from "./transaction";
import { transfers } from "./transfers";
import { users } from "./users";

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(Accounts),
  transactions: many(transactionsTable),
  expenseCategories: many(expenseCategories),
  goals: many(goals),
  transfers: many(transfers),
  payees: many(payees),
}));

export const accountRelations = relations(Accounts, ({ one, many }) => ({
  user: one(users, {
    fields: [Accounts.userId],
    references: [users.id],
  }),
  transactions: many(transactionsTable),
  transfersFrom: many(transfers, { relationName: "fromAccount" }),
  transfersTo: many(transfers, { relationName: "toAccount" }),
  payees: many(payees),
  goals: many(goals),
}));

export const transactionRelations = relations(transactionsTable, ({ one }) => ({
  user: one(users, {
    fields: [transactionsTable.userId],
    references: [users.id],
  }),
  account: one(Accounts, {
    fields: [transactionsTable.accountId],
    references: [Accounts.id],
  }),
}));

export const expenseCategoryRelations = relations(
  expenseCategories,
  ({ one }) => ({
    user: one(users, {
      fields: [expenseCategories.userId],
      references: [users.id],
    }),
  })
);

export const goalRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
  account: one(Accounts, {
    fields: [goals.accountId],
    references: [Accounts.id],
  }),
}));

export const transferRelations = relations(transfers, ({ one }) => ({
  user: one(users, {
    fields: [transfers.userId],
    references: [users.id],
  }),
  fromAccount: one(Accounts, {
    fields: [transfers.fromAccountId],
    references: [Accounts.id],
  }),
  toAccount: one(Accounts, {
    fields: [transfers.toAccountId],
    references: [Accounts.id],
  }),
}));

export const payeeRelations = relations(payees, ({ one }) => ({
  user: one(users, {
    fields: [payees.userId],
    references: [users.id],
  }),
  account: one(Accounts, {
    fields: [payees.accountId],
    references: [Accounts.id],
  }),
}));
