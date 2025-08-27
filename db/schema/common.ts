import { numeric, pgEnum, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "deposit",
  "withdrawal",
  "expense",
  "goal",
  "transfer",
  "send",
  "receive",
]);

export const Id = uuid("id").primaryKey().defaultRandom();
export const Name = varchar("title", { length: 255 }).notNull();
export const Description = varchar("description", { length: 255 });
export const Email = varchar("email", { length: 255 }).notNull().unique();
export const UserId = uuid("user_id").notNull();
export const Picture = varchar("profile_picture", { length: 255 })
  .notNull()
  .default("");

export const Icon = varchar("icon", { length: 255 }).notNull().default("");
export const Color = varchar("color", { length: 7 })
  .notNull()
  .default("#000000");

export const createdAt = timestamp("created_at").notNull().defaultNow();
export const updatedAt = timestamp("updated_at").notNull().defaultNow();

export function amount(
  columnName: string,
  options?: { precision?: number; scale?: number }
) {
  return numeric(columnName, {
    precision: options?.precision ?? 10,
    scale: options?.scale ?? 2,
  })
    .notNull()
    .default("0");
}
