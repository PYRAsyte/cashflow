import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { BalanceSummary } from "@/components/dashboard/balance-summary";
import { BudgetOverview } from "@/components/dashboard/budget-overview";
import { MonthlyTrends } from "@/components/dashboard/monthly-trends";
import { ExpenseBreakdown } from "@/components/dashboard/expense-breakdown";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { TransactionForm } from "@/components/transactions/transaction-form";

export default function Dashboard() {
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState(false);

  return (
    <AppLayout 
      title="Dashboard" 
      showActionButton={true}
      onActionButtonClick={() => setIsTransactionFormOpen(true)}
    >
      {/* Balance Summary Cards */}
      <BalanceSummary />

      {/* Budget Overview */}
      <BudgetOverview />

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MonthlyTrends />
        <ExpenseBreakdown />
      </div>

      {/* Recent Transactions */}
      <RecentTransactions />

      {/* Transaction Form Dialog */}
      <TransactionForm 
        isOpen={isTransactionFormOpen} 
        onClose={() => setIsTransactionFormOpen(false)} 
      />
    </AppLayout>
  );
}
