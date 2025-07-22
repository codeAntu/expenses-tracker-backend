export const TRANSACTION_TYPES = {
  DEPOSIT: "deposit",
  WITHDRAWAL: "withdrawal",
  EXPENSE: "expense",
  GOAL: "goal",
  TRANSFER: "transfer",
  SEND: "send",
  RECEIVE: "receive",
} as const;

export type TransactionType =
  (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];
