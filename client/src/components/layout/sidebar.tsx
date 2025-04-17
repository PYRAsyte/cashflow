import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { 
  Home, 
  BarChart4, 
  Wallet, 
  LineChart, 
  Settings, 
  LogOut,
  ChartLine
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();

  const routes = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      title: "Transactions",
      href: "/transactions",
      icon: BarChart4,
    },
    {
      title: "Budgets",
      href: "/budgets",
      icon: Wallet,
    },
    {
      title: "Reports",
      href: "/reports",
      icon: LineChart,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <aside className={cn(
      "hidden md:flex flex-col justify-between h-screen w-64 bg-slate-900/75 backdrop-blur-md border-r border-slate-700",
      className
    )}>
      <div>
        <div className="p-5 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <ChartLine className="mr-3 text-primary" />
            CashFlow
          </h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {routes.map((route) => (
              <li key={route.href}>
                <a 
                  href={route.href}
                  onClick={handleNavClick(route.href)}
                  className={cn(
                    "flex items-center p-3 rounded-lg transition-colors cursor-pointer",
                    location === route.href 
                      ? "bg-primary text-white" 
                      : "hover:bg-slate-700 text-slate-100"
                  )}
                >
                  <route.icon className="w-5 h-5 mr-2" />
                  <span>{route.title}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="p-4 border-t border-slate-700">
        {user && (
          <div className="flex items-center p-3 rounded-lg backdrop-blur-md bg-white/5 hover:bg-slate-700 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/20 text-primary">
                {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto text-slate-400 hover:text-white"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}