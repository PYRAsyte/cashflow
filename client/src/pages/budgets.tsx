import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { BudgetList } from "@/components/budgets/budget-list";
import { BudgetForm } from "@/components/budgets/budget-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Budgets() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Fetch budgets for selected month/year
  const { data: budgets, isLoading, error } = useQuery({
    queryKey: ["/api/budgets", { month: selectedMonth, year: selectedYear }],
  });

  const handleOpenForm = (budget?: any) => {
    setBudgetToEdit(budget || null);
    setIsFormOpen(true);
  };

  return (
    <AppLayout 
      title="Budgets" 
      showActionButton={true}
      onActionButtonClick={() => handleOpenForm()}
    >
      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-semibold">Monthly Budgets</h3>
            <p className="text-slate-400 text-sm">Set and track your spending limits by category</p>
          </div>
          <Button 
            onClick={() => handleOpenForm()} 
            className="hidden md:flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Budget</span>
          </Button>
        </div>

        <BudgetList 
          budgets={budgets}
          isLoading={isLoading}
          error={error}
          onEditBudget={handleOpenForm}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />
      </div>

      <BudgetForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)}
        budgetToEdit={budgetToEdit}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />
    </AppLayout>
  );
}
