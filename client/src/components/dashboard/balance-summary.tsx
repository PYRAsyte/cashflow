import { useQuery } from "@tanstack/react-query";
import { 
  Wallet, 
  ArrowDownRight, 
  ArrowUpRight,
  Loader2
} from "lucide-react";

interface BalanceSummaryProps {
  className?: string;
}

interface SummaryData {
  currentBalance: number;
  income: {
    amount: number;
    changePercentage: number;
  };
  expenses: {
    amount: number;
    changePercentage: number;
  };
}

export function BalanceSummary({ className }: BalanceSummaryProps) {
  const { data, isLoading, error } = useQuery<SummaryData>({
    queryKey: ["/api/dashboard/summary"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/5 backdrop-blur-md border border-slate-700 rounded-xl p-5 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="h-4 w-32 bg-slate-700 rounded mb-2"></div>
                <div className="h-8 w-24 bg-slate-700 rounded"></div>
              </div>
              <div className="w-10 h-10 rounded-full bg-slate-700"></div>
            </div>
            <div className="h-4 w-40 bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-slate-700 rounded-xl p-5 mb-6">
        <p className="text-slate-300">Failed to load balance summary.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
      {/* Current Balance */}
      <div className="bg-white/5 backdrop-blur-md border border-slate-700 rounded-xl p-5 transition-all hover:translate-y-[-2px]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-medium text-slate-400">Current Balance</h3>
            <p className="text-2xl font-bold mt-1">${data.currentBalance.toFixed(2)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="flex items-center text-sm">
          <span className={`flex items-center ${data.income.changePercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data.income.changePercentage >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
            {Math.abs(data.income.changePercentage)}%
          </span>
          <span className="text-slate-400 ml-2">from last month</span>
        </div>
      </div>

      {/* Monthly Income */}
      <div className="bg-white/5 backdrop-blur-md border border-slate-700 rounded-xl p-5 transition-all hover:translate-y-[-2px]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-medium text-slate-400">Monthly Income</h3>
            <p className="text-2xl font-bold mt-1">${data.income.amount.toFixed(2)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <ArrowDownRight className="h-5 w-5 text-green-500" />
          </div>
        </div>
        <div className="flex items-center text-sm">
          <span className={`flex items-center ${data.income.changePercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data.income.changePercentage >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
            {Math.abs(data.income.changePercentage)}%
          </span>
          <span className="text-slate-400 ml-2">from last month</span>
        </div>
      </div>

      {/* Monthly Expenses */}
      <div className="bg-white/5 backdrop-blur-md border border-slate-700 rounded-xl p-5 transition-all hover:translate-y-[-2px]">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm font-medium text-slate-400">Monthly Expenses</h3>
            <p className="text-2xl font-bold mt-1">${data.expenses.amount.toFixed(2)}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <ArrowUpRight className="h-5 w-5 text-red-500" />
          </div>
        </div>
        <div className="flex items-center text-sm">
          <span className={`flex items-center ${data.expenses.changePercentage <= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data.expenses.changePercentage <= 0 ? <ArrowDownRight className="h-4 w-4 mr-1" /> : <ArrowUpRight className="h-4 w-4 mr-1" />}
            {Math.abs(data.expenses.changePercentage)}%
          </span>
          <span className="text-slate-400 ml-2">from last month</span>
        </div>
      </div>
    </div>
  );
}
