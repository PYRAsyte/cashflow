import { 
  User, InsertUser, 
  Category, InsertCategory,
  Transaction, InsertTransaction,
  Budget, InsertBudget,
  users, categories, transactions, budgets
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { db, pool } from "./db";
import { eq, and, desc, gte, lte, inArray } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

// Modified storage interface with all the required methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoriesByUserId(userId: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, data: Partial<Category>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
  
  // Transaction methods
  getTransactionById(id: number): Promise<Transaction | undefined>;
  getTransactionsByFilters(filters: any): Promise<Transaction[]>;
  getRecentTransactions(userId: number, limit: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;
  
  // Budget methods
  getBudgetById(id: number): Promise<Budget | undefined>;
  getBudgetsByFilters(filters: any): Promise<Budget[]>;
  getBudgetByCategoryMonthYear(categoryId: number, month: number, year: number, userId: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget): Promise<Budget>;
  updateBudget(id: number, data: Partial<Budget>): Promise<Budget>;
  deleteBudget(id: number): Promise<void>;

  // Session store
  sessionStore: any; // Using any for session store type to avoid type issues
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private transactions: Map<number, Transaction>;
  private budgets: Map<number, Budget>;
  
  sessionStore: any;
  
  private userId = 1;
  private categoryId = 1;
  private transactionId = 1;
  private budgetId = 1;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.transactions = new Map();
    this.budgets = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours in milliseconds
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoriesByUserId(userId: number): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(
      (category) => category.userId === userId
    );
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    const category = this.categories.get(id);
    if (!category) {
      throw new Error("Category not found");
    }
    
    const updatedCategory = { ...category, ...data };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    this.categories.delete(id);
    
    // Remove category from transactions
    for (const [txId, transaction] of this.transactions.entries()) {
      if (transaction.categoryId === id) {
        this.transactions.set(txId, { ...transaction, categoryId: null as any });
      }
    }
    
    // Delete associated budgets
    for (const [budgetId, budget] of this.budgets.entries()) {
      if (budget.categoryId === id) {
        this.budgets.delete(budgetId);
      }
    }
  }

  // Transaction methods
  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByFilters(filters: any): Promise<Transaction[]> {
    let transactions = Array.from(this.transactions.values());
    
    // Filter by userId
    if (filters.userId) {
      transactions = transactions.filter(t => t.userId === filters.userId);
    }
    
    // Filter by date range
    if (filters.startDate) {
      transactions = transactions.filter(t => new Date(t.date) >= new Date(filters.startDate));
    }
    
    if (filters.endDate) {
      transactions = transactions.filter(t => new Date(t.date) <= new Date(filters.endDate));
    }
    
    // Filter by month and year
    if (filters.month && filters.year) {
      transactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() + 1 === filters.month && date.getFullYear() === filters.year;
      });
    } else if (filters.month) {
      transactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getMonth() + 1 === filters.month;
      });
    } else if (filters.year) {
      transactions = transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === filters.year;
      });
    }
    
    // Filter by category
    if (filters.categoryId) {
      transactions = transactions.filter(t => t.categoryId === filters.categoryId);
    }
    
    // Filter by type
    if (filters.type) {
      transactions = transactions.filter(t => t.type === filters.type);
    }
    
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getRecentTransactions(userId: number, limit: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const transaction: Transaction = { ...insertTransaction, id };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    
    const updatedTransaction = { ...transaction, ...data };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<void> {
    this.transactions.delete(id);
  }

  // Budget methods
  async getBudgetById(id: number): Promise<Budget | undefined> {
    return this.budgets.get(id);
  }

  async getBudgetsByFilters(filters: any): Promise<Budget[]> {
    let budgets = Array.from(this.budgets.values());
    
    // Filter by userId
    if (filters.userId) {
      budgets = budgets.filter(b => b.userId === filters.userId);
    }
    
    // Filter by month
    if (filters.month) {
      budgets = budgets.filter(b => b.month === filters.month);
    }
    
    // Filter by year
    if (filters.year) {
      budgets = budgets.filter(b => b.year === filters.year);
    }
    
    // Filter by category
    if (filters.categoryId) {
      budgets = budgets.filter(b => b.categoryId === filters.categoryId);
    }
    
    return budgets;
  }

  async getBudgetByCategoryMonthYear(categoryId: number, month: number, year: number, userId: number): Promise<Budget | undefined> {
    return Array.from(this.budgets.values()).find(
      b => b.categoryId === categoryId && b.month === month && b.year === year && b.userId === userId
    );
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const id = this.budgetId++;
    const budget: Budget = { ...insertBudget, id };
    this.budgets.set(id, budget);
    return budget;
  }

  async updateBudget(id: number, data: Partial<Budget>): Promise<Budget> {
    const budget = this.budgets.get(id);
    if (!budget) {
      throw new Error("Budget not found");
    }
    
    const updatedBudget = { ...budget, ...data };
    this.budgets.set(id, updatedBudget);
    return updatedBudget;
  }

  async deleteBudget(id: number): Promise<void> {
    this.budgets.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Category methods
  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoriesByUserId(userId: number): Promise<Category[]> {
    return db.select().from(categories).where(eq(categories.userId, userId));
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(data)
      .where(eq(categories.id, id))
      .returning();
    
    if (!updatedCategory) {
      throw new Error("Category not found");
    }
    
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<void> {
    // Update transactions to remove category reference
    await db
      .update(transactions)
      .set({ categoryId: null })
      .where(eq(transactions.categoryId, id));
    
    // Delete associated budgets
    await db
      .delete(budgets)
      .where(eq(budgets.categoryId, id));
    
    // Delete the category
    await db
      .delete(categories)
      .where(eq(categories.id, id));
  }

  // Transaction methods
  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const [result] = await db
      .select({
        ...transactions,
        category: {
          id: categories.id,
          name: categories.name,
          icon: categories.icon,
          color: categories.color
        }
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.id, id));
    
    if (!result) return undefined;
    
    // Transform to add proper category object
    return {
      ...result,
      category: result.category.id ? result.category : undefined
    };
  }

  async getTransactionsByFilters(filters: any): Promise<Transaction[]> {
    // Initialize query with category join
    let baseQuery = db.select({
      ...transactions,
      category: {
        id: categories.id,
        name: categories.name,
        icon: categories.icon,
        color: categories.color
      }
    })
    .from(transactions)
    .leftJoin(categories, eq(transactions.categoryId, categories.id));
    
    // Add filters
    const conditions = [];
    
    if (filters.userId) {
      conditions.push(eq(transactions.userId, filters.userId));
    }
    
    if (filters.startDate) {
      conditions.push(gte(transactions.date, new Date(filters.startDate)));
    }
    
    if (filters.endDate) {
      conditions.push(lte(transactions.date, new Date(filters.endDate)));
    }
    
    // Month and year filtering will have to be done in post-processing for PostgreSQL
    // because there's no direct month/year extraction in Drizzle's query builder
    
    if (filters.categoryId) {
      conditions.push(eq(transactions.categoryId, filters.categoryId));
    }
    
    if (filters.type) {
      conditions.push(eq(transactions.type, filters.type));
    }
    
    if (conditions.length > 0) {
      baseQuery = baseQuery.where(and(...conditions));
    }
    
    // Add ordering
    baseQuery = baseQuery.orderBy(desc(transactions.date));
    
    // Execute query
    let queryResult = await baseQuery;
    
    // Transform the result to match the Transaction type with proper category
    let result = queryResult.map(item => ({
      ...item,
      category: item.category.id ? item.category : undefined
    }));
    
    // Post-process for month/year filtering
    if (filters.month || filters.year) {
      result = result.filter(t => {
        const date = new Date(t.date);
        let matches = true;
        
        if (filters.month) {
          matches = matches && (date.getMonth() + 1 === filters.month);
        }
        
        if (filters.year) {
          matches = matches && (date.getFullYear() === filters.year);
        }
        
        return matches;
      });
    }
    
    return result;
  }

  async getRecentTransactions(userId: number, limit: number): Promise<Transaction[]> {
    // Get transactions with their related categories
    const result = await db
      .select({
        ...transactions,
        category: {
          id: categories.id,
          name: categories.name,
          icon: categories.icon,
          color: categories.color
        }
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date))
      .limit(limit);
    
    // Transform the result to match the Transaction type
    return result.map(item => ({
      ...item,
      category: item.category.id ? item.category : undefined
    }));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    
    return transaction;
  }

  async updateTransaction(id: number, data: Partial<Transaction>): Promise<Transaction> {
    const [updatedTransaction] = await db
      .update(transactions)
      .set(data)
      .where(eq(transactions.id, id))
      .returning();
    
    if (!updatedTransaction) {
      throw new Error("Transaction not found");
    }
    
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<void> {
    await db
      .delete(transactions)
      .where(eq(transactions.id, id));
  }

  // Budget methods
  async getBudgetById(id: number): Promise<Budget | undefined> {
    const [budget] = await db
      .select()
      .from(budgets)
      .where(eq(budgets.id, id));
    
    return budget;
  }

  async getBudgetsByFilters(filters: any): Promise<Budget[]> {
    let query = db.select().from(budgets);
    
    // Add filters
    const conditions = [];
    
    if (filters.userId) {
      conditions.push(eq(budgets.userId, filters.userId));
    }
    
    if (filters.month) {
      conditions.push(eq(budgets.month, filters.month));
    }
    
    if (filters.year) {
      conditions.push(eq(budgets.year, filters.year));
    }
    
    if (filters.categoryId) {
      conditions.push(eq(budgets.categoryId, filters.categoryId));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return query;
  }

  async getBudgetByCategoryMonthYear(categoryId: number, month: number, year: number, userId: number): Promise<Budget | undefined> {
    const [budget] = await db
      .select()
      .from(budgets)
      .where(
        and(
          eq(budgets.categoryId, categoryId),
          eq(budgets.month, month),
          eq(budgets.year, year),
          eq(budgets.userId, userId)
        )
      );
    
    return budget;
  }

  async createBudget(insertBudget: InsertBudget): Promise<Budget> {
    const [budget] = await db
      .insert(budgets)
      .values(insertBudget)
      .returning();
    
    return budget;
  }

  async updateBudget(id: number, data: Partial<Budget>): Promise<Budget> {
    const [updatedBudget] = await db
      .update(budgets)
      .set(data)
      .where(eq(budgets.id, id))
      .returning();
    
    if (!updatedBudget) {
      throw new Error("Budget not found");
    }
    
    return updatedBudget;
  }

  async deleteBudget(id: number): Promise<void> {
    await db
      .delete(budgets)
      .where(eq(budgets.id, id));
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
