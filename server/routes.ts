import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertCategorySchema, 
  insertTransactionSchema, 
  insertBudgetSchema,
  Category,
  Transaction,
  Budget
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Check authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Categories endpoints
  app.get("/api/categories", requireAuth, async (req, res) => {
    const categories = await storage.getCategoriesByUserId(req.user!.id);
    res.json(categories);
  });

  app.post("/api/categories", requireAuth, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategoryById(categoryId);
      
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      if (category.userId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const updatedCategory = await storage.updateCategory(categoryId, req.body);
      res.json(updatedCategory);
    } catch (error) {
      res.status(500).json({ error: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", requireAuth, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const category = await storage.getCategoryById(categoryId);
      
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      
      if (category.userId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await storage.deleteCategory(categoryId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  // Transactions endpoints
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate, categoryId, type } = req.query;
      const filters: any = { userId: req.user!.id };
      
      if (startDate && typeof startDate === 'string') {
        filters.startDate = new Date(startDate);
      }
      
      if (endDate && typeof endDate === 'string') {
        filters.endDate = new Date(endDate);
      }
      
      if (categoryId && typeof categoryId === 'string') {
        filters.categoryId = parseInt(categoryId);
      }
      
      if (type && (type === 'income' || type === 'expense')) {
        filters.type = type;
      }
      
      const transactions = await storage.getTransactionsByFilters(filters);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", requireAuth, async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId: req.user!.id,
        date: req.body.date ? new Date(req.body.date) : new Date()
      });
      
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create transaction" });
    }
  });

  app.put("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await storage.getTransactionById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      if (transaction.userId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const updatedTransaction = await storage.updateTransaction(
        transactionId, 
        {
          ...req.body,
          date: req.body.date ? new Date(req.body.date) : transaction.date
        }
      );
      res.json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ error: "Failed to update transaction" });
    }
  });

  app.delete("/api/transactions/:id", requireAuth, async (req, res) => {
    try {
      const transactionId = parseInt(req.params.id);
      const transaction = await storage.getTransactionById(transactionId);
      
      if (!transaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      
      if (transaction.userId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await storage.deleteTransaction(transactionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete transaction" });
    }
  });

  // Budget endpoints
  app.get("/api/budgets", requireAuth, async (req, res) => {
    try {
      const { month, year } = req.query;
      const filters: any = { userId: req.user!.id };
      
      if (month && typeof month === 'string') {
        filters.month = parseInt(month);
      }
      
      if (year && typeof year === 'string') {
        filters.year = parseInt(year);
      }
      
      const budgets = await storage.getBudgetsByFilters(filters);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch budgets" });
    }
  });

  app.post("/api/budgets", requireAuth, async (req, res) => {
    try {
      const budgetData = insertBudgetSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      // Check if budget already exists for this category/month/year
      const existingBudget = await storage.getBudgetByCategoryMonthYear(
        budgetData.categoryId,
        budgetData.month,
        budgetData.year,
        req.user!.id
      );
      
      if (existingBudget) {
        return res.status(400).json({ error: "Budget already exists for this category in the selected month" });
      }
      
      const budget = await storage.createBudget(budgetData);
      res.status(201).json(budget);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create budget" });
    }
  });

  app.put("/api/budgets/:id", requireAuth, async (req, res) => {
    try {
      const budgetId = parseInt(req.params.id);
      const budget = await storage.getBudgetById(budgetId);
      
      if (!budget) {
        return res.status(404).json({ error: "Budget not found" });
      }
      
      if (budget.userId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      const updatedBudget = await storage.updateBudget(budgetId, req.body);
      res.json(updatedBudget);
    } catch (error) {
      res.status(500).json({ error: "Failed to update budget" });
    }
  });

  app.delete("/api/budgets/:id", requireAuth, async (req, res) => {
    try {
      const budgetId = parseInt(req.params.id);
      const budget = await storage.getBudgetById(budgetId);
      
      if (!budget) {
        return res.status(404).json({ error: "Budget not found" });
      }
      
      if (budget.userId !== req.user!.id) {
        return res.status(403).json({ error: "Not authorized" });
      }

      await storage.deleteBudget(budgetId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete budget" });
    }
  });

  // Dashboard summary
  app.get("/api/dashboard/summary", requireAuth, async (req, res) => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1; // 1-based (January is 1)
      const currentYear = currentDate.getFullYear();
      
      // Get transactions for current and previous month
      const currentMonthTransactions = await storage.getTransactionsByFilters({
        userId: req.user!.id,
        month: currentMonth,
        year: currentYear
      });
      
      const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      
      const prevMonthTransactions = await storage.getTransactionsByFilters({
        userId: req.user!.id,
        month: prevMonth,
        year: prevYear
      });
      
      // Calculate totals
      const currentMonthIncome = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
        
      const currentMonthExpenses = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
        
      const prevMonthIncome = prevMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
        
      const prevMonthExpenses = prevMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      // Get budgets for current month
      const budgets = await storage.getBudgetsByFilters({
        userId: req.user!.id,
        month: currentMonth,
        year: currentYear
      });
      
      // Get recent transactions
      const recentTransactions = await storage.getRecentTransactions(req.user!.id, 5);
      
      // Calculate budget progress
      const budgetProgress = await Promise.all(
        budgets.map(async (budget) => {
          const spent = currentMonthTransactions
            .filter(t => t.type === 'expense' && t.categoryId === budget.categoryId)
            .reduce((sum, t) => sum + Number(t.amount), 0);
            
          const category = await storage.getCategoryById(budget.categoryId);
          
          return {
            budget,
            spent,
            category,
            percentage: Math.round((spent / Number(budget.amount)) * 100)
          };
        })
      );
      
      // Return summary data
      res.json({
        currentBalance: currentMonthIncome - currentMonthExpenses,
        income: {
          amount: currentMonthIncome,
          changePercentage: prevMonthIncome > 0 
            ? Math.round(((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100) 
            : 0
        },
        expenses: {
          amount: currentMonthExpenses,
          changePercentage: prevMonthExpenses > 0 
            ? Math.round(((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100) 
            : 0
        },
        budgetProgress,
        recentTransactions
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard summary" });
    }
  });

  // Monthly trends data
  app.get("/api/dashboard/monthly-trends", requireAuth, async (req, res) => {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      
      // Get data for last 6 months
      const monthsData = [];
      
      for (let i = 0; i < 6; i++) {
        const month = currentDate.getMonth() + 1 - i;
        const year = month <= 0 ? currentYear - 1 : currentYear;
        const adjustedMonth = month <= 0 ? month + 12 : month;
        
        const transactions = await storage.getTransactionsByFilters({
          userId: req.user!.id,
          month: adjustedMonth,
          year
        });
        
        const income = transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);
          
        const expenses = transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);
          
        monthsData.unshift({
          month: adjustedMonth,
          year,
          income,
          expenses
        });
      }
      
      res.json(monthsData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch monthly trends" });
    }
  });

  // Expense breakdown by category
  app.get("/api/dashboard/expense-breakdown", requireAuth, async (req, res) => {
    try {
      const { period } = req.query;
      const currentDate = new Date();
      
      let startDate: Date;
      if (period === 'year') {
        startDate = new Date(currentDate.getFullYear(), 0, 1);
      } else if (period === '90days') {
        startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - 90);
      } else {
        // Default to 30 days
        startDate = new Date(currentDate);
        startDate.setDate(startDate.getDate() - 30);
      }
      
      const transactions = await storage.getTransactionsByFilters({
        userId: req.user!.id,
        startDate,
        endDate: currentDate,
        type: 'expense'
      });
      
      const categories = await storage.getCategoriesByUserId(req.user!.id);
      
      // Group expenses by category
      const expensesByCategory: Record<number, number> = {};
      
      transactions.forEach(transaction => {
        if (transaction.categoryId) {
          expensesByCategory[transaction.categoryId] = 
            (expensesByCategory[transaction.categoryId] || 0) + Number(transaction.amount);
        }
      });
      
      // Calculate total
      const total = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
      
      // Format the result
      const result = categories.map(category => {
        const amount = expensesByCategory[category.id] || 0;
        return {
          category,
          amount,
          percentage: total > 0 ? Math.round((amount / total) * 100) : 0
        };
      }).filter(item => item.amount > 0)
        .sort((a, b) => b.amount - a.amount);
      
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense breakdown" });
    }
  });

  // CSV export endpoint
  app.get("/api/export/transactions", requireAuth, async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      
      const filters: any = { userId: req.user!.id };
      
      if (startDate && typeof startDate === 'string') {
        filters.startDate = new Date(startDate);
      }
      
      if (endDate && typeof endDate === 'string') {
        filters.endDate = new Date(endDate);
      }
      
      const transactions = await storage.getTransactionsByFilters(filters);
      
      // Get categories to include names
      const categories = await storage.getCategoriesByUserId(req.user!.id);
      const categoryMap = new Map(categories.map(c => [c.id, c.name]));
      
      // Create CSV content
      let csv = "Date,Type,Category,Description,Amount\n";
      
      transactions.forEach(transaction => {
        const date = new Date(transaction.date).toLocaleDateString();
        const type = transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1);
        const category = transaction.categoryId ? categoryMap.get(transaction.categoryId) : 'Uncategorized';
        const description = transaction.description ? `"${transaction.description.replace(/"/g, '""')}"` : '';
        const amount = Number(transaction.amount).toFixed(2);
        
        csv += `${date},${type},${category},${description},${amount}\n`;
      });
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
      res.send(csv);
    } catch (error) {
      res.status(500).json({ error: "Failed to export transactions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
