import { useQuery } from "@tanstack/react-query";
import { 
  Home, 
  Utensils, 
  Car, 
  ShoppingBag, 
  Loader2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface BudgetProgress {
  budget: {
    id: number;
    amount: number;
    categoryId: number;
  };
  spent: number;
  category: {
    id: number;
    name: string;
    icon: string;
    color: string;
  };
  percentage: number;
}

interface BudgetSummary {
  budgetProgress: BudgetProgress[];
}

const iconMap: Record<string, any> = {
  home: Home,
  utensils: Utensils,
  car: Car,
  "shopping-bag": ShoppingBag,
};

export function BudgetOverview() {
  const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
  const [year, setYear] = useState(new Date().getFullYear().toString());
  
  const { data, isLoading, error } = useQuery<BudgetSummary>({
    queryKey: ["/api/dashboard/summary"],
  });

  const getMonthOptions = () => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(2023, i, 1);
      months.push({
        value: date.toLocaleString('default', { month: 'long' }),
        label: date.toLocaleString('default', { month: 'long' }) + ' ' + year
      });
    }
    return months;
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-slate-700 rounded-xl p-5 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Budget Overview</h3>
          <div className="h-10 w-32 bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-700 mr-3"></div>
                  <div className="space-y-1">
                    <div className="h-4 w-24 bg-slate-700 rounded"></div>
                    <div className="h-3 w-20 bg-slate-700 rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-8 bg-slate-700 rounded"></div>
              </div>
              <div className="h-2 bg-slate-700 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-slate-700 rounded-xl p-5 mb-6">
        <p className="text-slate-300">Failed to load budget overview.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-md border border-slate-700 rounded-xl p-5 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Budget Overview</h3>
        <div>
          <Select defaultValue={month + ' ' + year} onValueChange={(v) => setMonth(v.split(' ')[0])}>
            <SelectTrigger className="bg-white/5 border-slate-700 text-white w-[180px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              {getMonthOptions().map((month) => (
                <SelectItem key={month.value} value={month.label}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {data.budgetProgress.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400">No budgets set for this month.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.budgetProgress.map((item) => {
            const Icon = iconMap[item.category.icon] || Home;
            const isOverBudget = item.percentage > 100;
            
            return (
              <div key={item.budget.id} className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                      style={{ 
                        backgroundColor: `${item.category.color}20`,
                        color: item.category.color
                      }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{item.category.name}</p>
                      <p className="text-sm text-slate-400">
                        ${item.spent.toFixed(2)} / ${Number(item.budget.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${isOverBudget ? 'text-red-500' : ''}`}>
                    {item.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full" 
                    style={{ 
                      width: `${Math.min(item.percentage, 100)}%`,
                      backgroundColor: isOverBudget ? '#F43F5E' : item.category.color
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
