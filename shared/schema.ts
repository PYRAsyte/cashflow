import { pgTable, text, serial, integer, boolean, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense"]);

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  userId: true,
  icon: true,
  color: true,
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  amount: numeric("amount").notNull(),
  type: transactionTypeEnum("type").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  description: text("description"),
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").references(() => categories.id),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  amount: true,
  type: true,
  date: true,
  description: true,
  userId: true,
  categoryId: true,
});

export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  amount: numeric("amount").notNull(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
});

export const insertBudgetSchema = createInsertSchema(budgets).pick({
  amount: true,
  month: true,
  year: true,
  userId: true,
  categoryId: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginCredentials = z.infer<typeof loginSchema>;

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  budgets: many(budgets),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [budgets.categoryId],
    references: [categories.id],
  }),
}));
