import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthlyTrends } from "@/components/dashboard/monthly-trends";
import { ExpenseBreakdown } from "@/components/dashboard/expense-breakdown";
import { Loader2, AlertCircle } from "lucide-react";
import { ExportButton } from "@/components/reports/export-button";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("trends");
  const [period, setPeriod] = useState('30days');

  return (
    <AppLayout title="Reports">
      <div className="glass rounded-xl p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-semibold">Financial Reports</h3>
            <p className="text-slate-400 text-sm">Visualize your financial data</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={period}
              onValueChange={setPeriod}
            >
              <SelectTrigger className="bg-white/5 border-slate-700 w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="year">This year</SelectItem>
              </SelectContent>
            </Select>
            <ExportButton period={period} />
          </div>
        </div>

        <Tabs defaultValue="trends" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-slate-800 grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
            <TabsTrigger value="categories">Category Breakdown</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trends" className="mt-0">
            <Card className="border-none bg-transparent shadow-none">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg font-medium">Income vs Expenses</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="h-[400px]">
                  <MonthlyTrends />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories" className="mt-0">
            <Card className="border-none bg-transparent shadow-none">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-lg font-medium">Expense Breakdown by Category</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="h-[400px]">
                  <ExpenseBreakdown />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="glass rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Spending Insights</h3>
        
        <SpendingInsights period={period} />
      </div>
    </AppLayout>
  );
}

function SpendingInsights({ period }: { period: string }) {
  // This would normally fetch from an API endpoint that provides spending insights
  // For this implementation, we'll use a placeholder component
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard/expense-breakdown", { period }],
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-slate-400">Loading insights...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load spending insights</h3>
        <p className="text-slate-400">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  // Get top spending category
  const topCategory = data.length > 0 ? data[0] : null;

  // Simple insights based on the data
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass-dark p-5 rounded-xl">
        <h4 className="text-lg font-medium mb-4">Top Spending Category</h4>
        {topCategory ? (
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center mr-4"
              style={{ 
                backgroundColor: `${topCategory.category.color}20`,
                color: topCategory.category.color
              }}
            >
              <span className="text-xl">
                {topCategory.category.icon === 'home' && <Home className="h-6 w-6" />}
                {topCategory.category.icon === 'utensils' && <Utensils className="h-6 w-6" />}
                {topCategory.category.icon === 'car' && <Car className="h-6 w-6" />}
                {topCategory.category.icon === 'shopping-bag' && <ShoppingBag className="h-6 w-6" />}
                {topCategory.category.icon === 'credit-card' && <CreditCard className="h-6 w-6" />}
              </span>
            </div>
            <div>
              <p className="font-medium text-xl">{topCategory.category.name}</p>
              <p className="text-slate-400">
                ${topCategory.amount.toFixed(2)} ({topCategory.percentage}% of total)
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-400">No spending data available.</p>
        )}
      </div>

      <div className="glass-dark p-5 rounded-xl">
        <h4 className="text-lg font-medium mb-4">Spending Distribution</h4>
        {data.length > 0 ? (
          <div className="space-y-4">
            <p className="text-slate-300">
              Your spending is distributed across {data.length} categories.
            </p>
            {data.length >= 3 && (
              <p className="text-slate-300">
                Your top 3 categories account for {
                  Math.round(data.slice(0, 3).reduce((sum, item) => sum + item.percentage, 0))
                }% of your total spending.
              </p>
            )}
          </div>
        ) : (
          <p className="text-slate-400">No spending data available.</p>
        )}
      </div>
    </div>
  );
}

// Import these at the top of the file
import { Home, Utensils, Car, ShoppingBag, CreditCard } from "lucide-react";
