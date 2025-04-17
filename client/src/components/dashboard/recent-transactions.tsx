import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Home, CreditCard, ShoppingBag, Utensils, Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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

interface DashboardSummary {
  recentTransactions: Transaction[];
}

const iconMap: Record<string, any> = {
  home: Home,
  "credit-card": CreditCard,
  "shopping-bag": ShoppingBag,
  utensils: Utensils,
  car: Car,
};

export function RecentTransactions() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data, isLoading, error } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
  });

  if (isLoading) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-slate-700 rounded-xl p-5 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
          <div className="w-20 h-8 bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div className="mb-4">
          <div className="h-10 bg-slate-700 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white/5 rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-700 mr-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-slate-700 rounded"></div>
                    <div className="h-3 w-24 bg-slate-700 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-slate-700 rounded"></div>
                  <div className="h-3 w-16 bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white/5 backdrop-blur-md border border-slate-700 rounded-xl p-5 mt-6">
        <p className="text-slate-300">Failed to load recent transactions.</p>
      </div>
    );
  }

  const { recentTransactions } = data;

  // Basic search filter
  const filteredTransactions = recentTransactions.filter(transaction => 
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return `${date.toLocaleDateString()}, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-md border border-slate-700 rounded-xl p-5 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Recent Transactions</h3>
        <Link href="/transactions">
          <Button variant="link" className="text-sm font-medium text-primary hover:text-primary/90 transition-colors p-0">
            View All
          </Button>
        </Link>
      </div>

      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <Input 
            type="text" 
            className="bg-white/5 border-slate-700 w-full py-2 pl-10 pr-4 rounded-lg focus:ring-primary"
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400">No transactions found.</p>
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
                className="bg-white/5 hover:bg-white/10 transition-all duration-200 rounded-lg p-4 flex items-center justify-between cursor-pointer"
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
                <div className="text-right">
                  <p className={`font-medium ${transaction.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.type === 'income' ? '+' : '-'}${Math.abs(amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400">{categoryName}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredTransactions.length > 0 && (
        <div className="mt-6 text-center">
          <Link href="/transactions">
            <Button className="bg-white/5 hover:bg-white/10 transition-colors px-4 py-2 rounded-lg">
              Load More
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
