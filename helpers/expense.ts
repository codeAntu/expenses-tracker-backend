import db from "@/db";
import { transactionsTable } from "@/db/schema";
import { expenseCategories } from "@/db/schema/expenseCategories";
import { TRANSACTION_TYPES } from "@/utils/types/types";
import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { deductAmountFromAccount } from "./account";

const MAX_AMOUNT = 1_000_000;

export const createExpenseValidator = z.object({
  amount: z
    .number()
    .min(0.01, "Amount must be greater than 0")
    .max(MAX_AMOUNT, "Amount is too large"),
  description: z.string().max(255, "Description is too long").optional(),
  referenceId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  accountId: z.string().uuid().optional(),
});

export const createExpenseCategoryValidator = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(255, "Description is too long").optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  accountId: z.string().uuid().optional(),
});


export type CreateExpense = z.infer<typeof createExpenseValidator>;

export async function getAllAExpenses(userId: string) {
  try {
    const expenses = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.userId, userId),
          eq(transactionsTable.transactionType, TRANSACTION_TYPES.EXPENSE)
        )
      )
      .orderBy(desc(transactionsTable.createdAt));

    return expenses;
  } catch (error) {
    throw new Error("Failed to retrieve expenses: " + error);
  }
}

export async function getExpenses(userId: string) {
  try {
    const expenses = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.userId, userId),
          eq(transactionsTable.transactionType, TRANSACTION_TYPES.EXPENSE),
          isNull(transactionsTable.referenceId)
        )
      );

    return expenses;
  } catch (error) {
    throw new Error("Failed to retrieve expenses: " + error);
  }
}

export async function getExpenseCategories(userId: string) {
  try {
    const categories = await db
      .select()
      .from(expenseCategories)
      .where(eq(expenseCategories.userId, userId))
      .orderBy(desc(expenseCategories.createdAt));

    return categories;
  } catch (error) {
    throw new Error("Failed to retrieve expense categories: " + error);
  }
}

export async function getCategoriesExpenses(userId: string) {
  try {
    const groupedExpenses = await db
      .select({
        categoryId: transactionsTable.referenceId,
      })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.userId, userId),
          eq(transactionsTable.transactionType, TRANSACTION_TYPES.EXPENSE)
        )
      )
      .groupBy(transactionsTable.referenceId)
      .orderBy(desc(transactionsTable.createdAt));
    return groupedExpenses;
  } catch (error) {
    throw new Error("Failed to retrieve grouped expenses: " + error);
  }
}

export async function getCategoriesExpensesById(
  userId: string,
  categoryId: string
) {
  try {
    const categoryExpenses = await db
      .select()
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.userId, userId),
          eq(transactionsTable.transactionType, TRANSACTION_TYPES.EXPENSE),
          eq(transactionsTable.referenceId, categoryId)
        )
      )
      .orderBy(desc(transactionsTable.createdAt));
    return categoryExpenses;
  } catch (error) {
    throw new Error("Failed to retrieve category expenses: " + error);
  }
}

export async function createExpense(
  userId: string,
  expenseData: CreateExpense
) {
  try {
    const { amount, description, referenceId, categoryId, accountId } =
      expenseData;

    if (accountId) {
      await deductAmountFromAccount(userId, accountId, amount);
    }

    const newExpense = await db
      .insert(transactionsTable)
      .values({
        amount: amount.toString(),
        description: description || "",
        transactionType: TRANSACTION_TYPES.EXPENSE,
        userId: userId,
        referenceId: referenceId ?? categoryId ?? null,
        accountId: accountId ?? null,
      })
      .returning();

    if (!newExpense.length) {
      throw new Error("Failed to create expense");
    }

    return newExpense[0];
  } catch (error) {
    throw new Error("Failed to create expense: " + error);
  }
}

export async function deleteExpense(userId: string, expenseId: string) {
  try {
    const deletedExpense = await db
      .delete(transactionsTable)
      .where(
        and(
          eq(transactionsTable.id, expenseId),
          eq(transactionsTable.userId, userId)
        )
      )
      .returning();

    if (!deletedExpense.length) {
      throw new Error("Expense not found or access denied");
    }

    return deletedExpense[0];
  } catch (error) {
    throw new Error("Failed to delete expense: " + error);
  }
}

export async function createExpenseCategory(
  userId: string,
  categoryData: z.infer<typeof createExpenseCategoryValidator>
) {
  try {
    const { name, description, icon, color, accountId } = categoryData;

    const newCategory = {
      name,
      description: description || "",
      icon: icon || undefined,
      color: color || undefined,
      userId,
      accountId: accountId || null,
    };

    const result = await db
      .insert(expenseCategories)
      .values(newCategory)
      .returning();

    if (!result.length) {
      throw new Error("Failed to create expense category");
    }

    return result[0];
  } catch (error) {
    throw new Error("Failed to create expense category: " + error);
  }
}

export async function deleteExpenseCategory(
  userId: string,
  categoryId: string
) {
  try {
    const deletedCategory = await db
      .delete(expenseCategories)
      .where(
        and(
          eq(expenseCategories.id, categoryId),
          eq(expenseCategories.userId, userId)
        )
      )
      .returning();

    if (!deletedCategory.length) {
      throw new Error("Expense category not found or access denied");
    }

    return deletedCategory[0];
  } catch (error) {
    throw new Error("Failed to delete expense category: " + error);
  }
}

export async function addExpenseToCategory(
  userId: string,
  categoryId: string,
  expenseData: CreateExpense
) {
  try {
    const { amount, description, accountId } = expenseData;

    if (accountId) {
      await deductAmountFromAccount(userId, accountId, amount);
    }

    const newExpense = await db
      .insert(transactionsTable)
      .values({
        amount: amount.toString(),
        description: description || "",
        transactionType: TRANSACTION_TYPES.EXPENSE,
        userId: userId,
        referenceId: categoryId,
        accountId: accountId || null,
      })
      .returning();

    if (!newExpense.length) {
      throw new Error("Failed to add expense to category");
    }

    return newExpense[0];
  } catch (error) {
    throw new Error("Failed to add expense to category: " + error);
  }
}


