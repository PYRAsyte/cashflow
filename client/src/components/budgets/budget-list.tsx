import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Home, 
  CreditCard, 
  ShoppingBag, 
  Utensils, 
  Car,
  Loader2,
  AlertCircle,
  Edit,
  Trash2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
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
import { useState } from "react";

interface Budget {
  id: number;
  amount: string | number;
  month: number;
  year: number;
  categoryId: number;
  spent?: number;
  percentage?: number;
  category?: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
}

interface BudgetListProps {
  budgets?: Budget[];
  isLoading: boolean;
  error: Error | null;
  onEditBudget: (budget: Budget) => void;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

const iconMap: Record<string, any> = {
  home: Home,
  "credit-card": CreditCard,
  "shopping-bag": ShoppingBag,
  utensils: Utensils,
  car: Car,
};

export function BudgetList({ 
  budgets, 
  isLoading, 
  error,
  onEditBudget,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange
}: BudgetListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  // Generate month options
  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  // Generate year options
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear + i - 2);

  // Delete budget mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      toast({
        title: "Budget deleted",
        description: "Budget has been deleted successfully",
      });
      setBudgetToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete budget: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-slate-400">Loading budgets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load budgets</h3>
        <p className="text-slate-400 mb-4">{error.message}</p>
        <Button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/budgets"] })}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <div className="w-1/2">
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => onMonthChange(parseInt(value))}
          >
            <SelectTrigger className="bg-white/5 border-slate-700">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value.toString()}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-1/2">
          <Select
            value={selectedYear.toString()}
            onValueChange={(value) => onYearChange(parseInt(value))}
          >
            <SelectTrigger className="bg-white/5 border-slate-700">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {!budgets?.length ? (
        <div className="text-center py-12">
          <div className="bg-white/5 rounded-full p-4 inline-flex mb-4">
            <AlertCircle className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No budgets found</h3>
          <p className="text-slate-400 mb-6">Add a budget to start tracking your spending.</p>
          <Button onClick={() => onEditBudget({ id: 0, amount: "", month: selectedMonth, year: selectedYear, categoryId: 0 })}>
            Create Budget
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {budgets.map((budget) => {
            const amount = typeof budget.amount === 'string' 
              ? parseFloat(budget.amount) 
              : budget.amount;
            
            const spent = budget.spent || 0;
            const percentage = budget.percentage || Math.round((spent / Number(amount)) * 100);
            const isOverBudget = percentage > 100;
            
            const categoryName = budget.category?.name || 'Uncategorized';
            const Icon = budget.category?.icon 
              ? (iconMap[budget.category.icon] || Home)
              : Home;
              
            const iconColor = budget.category?.color || '#6366F1';
            const bgColor = `${iconColor}20`;
            
            return (
              <div key={budget.id} className="glass p-4 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                      style={{ backgroundColor: bgColor, color: iconColor }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{categoryName}</p>
                      <p className="text-sm text-slate-400">
                        ${spent.toFixed(2)} / ${Number(amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm font-medium mr-4 ${isOverBudget ? 'text-red-500' : ''}`}>
                      {percentage}%
                    </span>
                    <div className="flex">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-white"
                        onClick={() => onEditBudget(budget)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-slate-400 hover:text-red-500"
                        onClick={() => setBudgetToDelete(budget)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className="h-2 bg-slate-700"
                  indicatorClassName={isOverBudget ? 'bg-red-500' : undefined}
                  style={{ 
                    '--progress-color': isOverBudget ? '#F43F5E' : iconColor 
                  } as React.CSSProperties}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Deletion */}
      <AlertDialog open={!!budgetToDelete} onOpenChange={(open) => !open && setBudgetToDelete(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this budget? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => budgetToDelete && deleteMutation.mutate(budgetToDelete.id)}
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
