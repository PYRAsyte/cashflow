import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Home, 
  CreditCard, 
  ShoppingBag, 
  Utensils, 
  Car,
  Loader2,
  Search,
  Edit,
  Trash2,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Transaction {
  id: number;
  amount: string | number;
  type: 'income' | 'expense';
  date: string;
  description: string | null;
  categoryId: number | null;
  category?: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
}

interface TransactionListProps {
  transactions?: Transaction[];
  isLoading: boolean;
  error: Error | null;
  onEditTransaction: (transaction: Transaction) => void;
}

const iconMap: Record<string, any> = {
  home: Home,
  "credit-card": CreditCard,
  "shopping-bag": ShoppingBag,
  utensils: Utensils,
  car: Car,
};

export function TransactionList({ 
  transactions, 
  isLoading, 
  error,
  onEditTransaction
}: TransactionListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      toast({
        title: "Transaction deleted",
        description: "Transaction has been deleted successfully",
      });
      setTransactionToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  // Handle search filter
  const filteredTransactions = transactions?.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.description?.toLowerCase().includes(searchLower) ||
      transaction.category?.name.toLowerCase().includes(searchLower) ||
      String(transaction.amount).includes(searchTerm)
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ', ' + 
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-slate-400">Loading transactions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load transactions</h3>
        <p className="text-slate-400 mb-4">{error.message}</p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/transactions"] })}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input 
            type="text" 
            className="bg-white/5 border-slate-700 w-full py-2 pl-10 pr-4 rounded-lg"
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {!filteredTransactions?.length ? (
        <div className="text-center py-12">
          <div className="bg-white/5 rounded-full p-4 inline-flex mb-4">
            <AlertCircle className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No transactions found</h3>
          <p className="text-slate-400 mb-6">
            {transactions?.length ? 'Try adjusting your search or filters.' : 'Add a transaction to get started.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => {
            const amount = typeof transaction.amount === 'string' 
              ? parseFloat(transaction.amount) 
              : transaction.amount;
            
            const categoryName = transaction.category?.name || 'Uncategorized';
            const Icon = transaction.category?.icon 
              ? (iconMap[transaction.category.icon] || Home)
              : Home;
              
            const iconColor = transaction.category?.color || '#6366F1';
            const bgColor = `${iconColor}20`;
            
            return (
              <div 
                key={transaction.id} 
                className="glass transaction-item p-4 rounded-lg flex items-center justify-between group"
              >
                <div className="flex items-center">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center mr-4"
                    style={{ backgroundColor: bgColor, color: iconColor }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description || categoryName}</p>
                    <p className="text-xs text-slate-400">{formatDate(transaction.date)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-right mr-4">
                    <p className={`font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.type === 'income' ? '+' : '-'}${Math.abs(amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-400">{categoryName}</p>
                  </div>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-400 hover:text-white"
                      onClick={() => onEditTransaction(transaction)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-slate-400 hover:text-red-500"
                      onClick={() => setTransactionToDelete(transaction)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Deletion */}
      <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => transactionToDelete && deleteMutation.mutate(transactionToDelete.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
