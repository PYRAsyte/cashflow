import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { TransactionList } from "@/components/transactions/transaction-list";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionFilter } from "@/components/transactions/transaction-filter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Transactions() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<any>(null);
  const [filters, setFilters] = useState({
    startDate: undefined,
    endDate: undefined,
    categoryId: undefined,
    type: undefined,
  });

  // Query params for filtered transactions
  const queryParams = new URLSearchParams();
  if (filters.startDate) queryParams.append('startDate', filters.startDate.toISOString());
  if (filters.endDate) queryParams.append('endDate', filters.endDate.toISOString());
  if (filters.categoryId) queryParams.append('categoryId', filters.categoryId.toString());
  if (filters.type) queryParams.append('type', filters.type);

  const queryKey = ["/api/transactions", queryParams.toString()];

  // Fetch transactions with filters
  const { data: transactions, isLoading, error } = useQuery({
    queryKey,
  });

  const handleOpenForm = (transaction?: any) => {
    setTransactionToEdit(transaction || null);
    setIsFormOpen(true);
  };

  return (
    <AppLayout 
      title="Transactions" 
      showActionButton={true}
      onActionButtonClick={() => handleOpenForm()}
    >
      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-semibold">Transaction History</h3>
          <div className="flex items-center gap-2">
            <TransactionFilter 
              onFilterChange={setFilters} 
              currentFilters={filters}
            />
            <Button 
              onClick={() => handleOpenForm()} 
              className="hidden md:flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Transaction</span>
            </Button>
          </div>
        </div>

        <TransactionList 
          transactions={transactions} 
          isLoading={isLoading} 
          error={error}
          onEditTransaction={handleOpenForm}
        />
      </div>

      <TransactionForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        transactionToEdit={transactionToEdit}
      />
    </AppLayout>
  );
}
