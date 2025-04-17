import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface ExpenseCategory {
  category: {
    id: number;
    name: string;
    color: string;
  };
  amount: number;
  percentage: number;
}

export function ExpenseBreakdown() {
  const [period, setPeriod] = useState('30days');
  
  const { data, isLoading, error, refetch } = useQuery<ExpenseCategory[]>({
    queryKey: ["/api/dashboard/expense-breakdown", { period }],
  });

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
  };

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
        <p className="text-slate-300">Failed to load expense breakdown.</p>
      </div>
    );
  }

  // Format data for the chart
  const chartData = data.map(item => ({
    name: item.category.name,
    value: item.amount,
    color: item.category.color,
    percentage: item.percentage
  }));

  return (
    <div className="bg-white/5 backdrop-blur-md border border-slate-700 rounded-xl p-5">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Expense Breakdown</h3>
        <div>
          <Select defaultValue={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="bg-white/5 border-slate-700 text-white w-[150px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {chartData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400">No expense data available for the selected period.</p>
        </div>
      ) : (
        <>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    borderColor: '#475569',
                    borderRadius: '0.375rem',
                    color: '#F8FAFC'
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, undefined]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            {chartData.map((item, index) => (
              <div key={index} className="flex items-center">
                <span 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                ></span>
                <span className="text-sm">{item.name} ({item.percentage}%)</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
