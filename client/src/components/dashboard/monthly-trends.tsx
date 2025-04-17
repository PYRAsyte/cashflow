import { useQuery } from "@tanstack/react-query";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from "lucide-react";

interface MonthlyData {
  month: number;
  year: number;
  income: number;
  expenses: number;
}

export function MonthlyTrends() {
  const { data, isLoading, error } = useQuery<MonthlyData[]>({
    queryKey: ["/api/dashboard/monthly-trends"],
  });

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-slate-700 rounded-xl p-5 h-[350px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-slate-700 rounded-xl p-5">
        <p className="text-slate-300">Failed to load monthly trends.</p>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = data.map(item => {
    const date = new Date(item.year, item.month - 1);
    return {
      name: date.toLocaleString('default', { month: 'short' }),
      income: item.income,
      expenses: item.expenses
    };
  });

  return (
    <div className="bg-white/5 backdrop-blur-md border border-slate-700 rounded-xl p-5">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Monthly Trends</h3>
        <div className="flex space-x-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
            <span className="w-2 h-2 bg-primary rounded-full mr-1"></span>
            Income
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-500">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
            Expenses
          </span>
        </div>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                borderColor: '#475569',
                borderRadius: '0.375rem',
                color: '#F8FAFC'
              }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, undefined]}
            />
            <Area 
              type="monotone" 
              dataKey="income" 
              stroke="#6366F1" 
              fillOpacity={1} 
              fill="url(#colorIncome)" 
            />
            <Area 
              type="monotone" 
              dataKey="expenses" 
              stroke="#F43F5E" 
              fillOpacity={1} 
              fill="url(#colorExpenses)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
