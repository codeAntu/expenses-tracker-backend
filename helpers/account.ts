import db from "@/db";
import { Accounts, transactionsTable } from "@/db/schema";
import { TRANSACTION_TYPES } from "@/utils/types/types";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

const ICON = "";
const COLOR = "";
const DESCRIPTION = "";
const MAX_BALANCE = 1_000_000;

export const createAccountValidator = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().max(255, "Description is too long"),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const withdrawDepositValidator = z.object({
  amount: z
    .number()
    .min(0.01, "Amount must be greater than 0")
    .max(1_000_000, "Amount is too large"),
  description: z.string().max(255, "Description is too long").optional(),
});

type CreateAccount = z.infer<typeof createAccountValidator>;

export async function createAccount(userId: string, data: CreateAccount) {
  try {
    const { name, description, icon, color } = data;
    const result = await db
      .insert(Accounts)
      .values({
        userId,
        name,
        description,
        icon: icon || ICON,
        color: color || COLOR,
      })
      .returning();
    return result[0];
  } catch (error) {
    throw error;
  }
}

export async function updateAccount(
  userId: string,
  accountId: string,
  data: Partial<CreateAccount>
) {
  try {
    if (!userId) throw new Error("User ID is required for account update");
    const result = await db
      .update(Accounts)
      .set(data)
      .where(and(eq(Accounts.id, accountId), eq(Accounts.userId, userId)))
      .returning();
    if (!result.length) throw new Error("Account not found or access denied");
    return result[0];
  } catch (error) {
    throw error;
  }
}

export async function deleteAccount(userId: string, accountId: string) {
  try {
    const result = await db
      .delete(Accounts)
      .where(and(eq(Accounts.id, accountId), eq(Accounts.userId, userId)))
      .returning();
    if (!result.length) throw new Error("Account not found or access denied");
    return result[0];
  } catch (error) {
    throw error;
  }
}

export async function getAllAccounts(userId: string) {
  return await db
    .select()
    .from(Accounts)
    .where(eq(Accounts.userId, userId))
    .orderBy(desc(Accounts.createdAt));
}

export async function DepositToAccount(
  userId: string,
  accountId: string,
  amount: number,
  description?: string
) {
  try {
    const account = await db
      .select()
      .from(Accounts)
      .where(and(eq(Accounts.id, accountId), eq(Accounts.userId, userId)));
    if (!account.length) throw new Error("Account not found or access denied");
    const currentBalance = account[0].balance;
    const newBalance = (parseFloat(currentBalance) + amount).toFixed(2);

    if (parseFloat(newBalance) > MAX_BALANCE)
      throw new Error("New balance exceeds maximum limit of 1,000,000");

    await db.insert(transactionsTable).values({
      amount: amount.toString(),
      description: description || DESCRIPTION,
      transactionType: TRANSACTION_TYPES.DEPOSIT,
      userId: userId,
      accountId: accountId,
    });
    const updatedAccount = await db
      .update(Accounts)
      .set({
        balance: newBalance,
        updatedAt: new Date(),
      })
      .where(and(eq(Accounts.id, accountId), eq(Accounts.userId, userId)))
      .returning();
    if (!updatedAccount.length)
      throw new Error("Failed to update account balance");
    return updatedAccount[0];
  } catch (error) {
    throw error;
  }
}

export async function WithdrawFromAccount(
  userId: string,
  accountId: string,
  amount: number,
  description?: string
) {
  try {
    const account = await db
      .select()
      .from(Accounts)
      .where(and(eq(Accounts.id, accountId), eq(Accounts.userId, userId)));
    if (!account.length) throw new Error("Account not found or access denied");
    const currentBalance = parseFloat(account[0].balance);
    if (currentBalance < amount) throw new Error("Insufficient funds");
    const newBalance = (currentBalance - amount).toFixed(2);
    
    await db.insert(transactionsTable).values({
      amount: amount.toString(),
      description: description || DESCRIPTION,
      transactionType: TRANSACTION_TYPES.WITHDRAWAL,
      userId: userId,
      accountId: accountId,
    });
    const updatedAccount = await db
      .update(Accounts)
      .set({
        balance: newBalance,
        updatedAt: new Date(),
      })
      .where(and(eq(Accounts.id, accountId), eq(Accounts.userId, userId)))
      .returning();
    if (!updatedAccount.length)
      throw new Error("Failed to update account balance");
    return updatedAccount[0];
  } catch (error) {
    throw error;
  }
}
