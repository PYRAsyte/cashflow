import { useLocation } from "wouter";
import { Home, BarChart4, Wallet, LineChart, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const [location, navigate] = useLocation();

  const routes = [
    {
      title: "Home",
      href: "/",
      icon: Home,
    },
    {
      title: "Transactions",
      href: "/transactions",
      icon: BarChart4,
    },
    {
      title: "Budget",
      href: "/budgets",
      icon: Wallet,
    },
    {
      title: "Reports",
      href: "/reports",
      icon: LineChart,
    },
    {
      title: "Profile",
      href: "/settings",
      icon: User,
    },
  ];

  const handleNavClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <nav className={cn(
      "md:hidden fixed bottom-0 left-0 right-0 z-10 bg-slate-900/90 backdrop-blur-md flex justify-around items-center py-3 border-t border-slate-700",
      className
    )}>
      {routes.map((route) => (
        <a 
          key={route.href} 
          href={route.href}
          onClick={handleNavClick(route.href)}
          className="flex flex-col items-center"
        >
          <route.icon className={cn(
            "h-5 w-5",
            location === route.href ? "text-primary" : "text-slate-400"
          )} />
          <span className={cn(
            "text-xs mt-1",
            location === route.href ? "text-primary" : "text-slate-400"
          )}>
            {route.title}
          </span>
        </a>
      ))}
    </nav>
  );
}