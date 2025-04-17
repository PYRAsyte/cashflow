import { Switch, Route, Redirect, useLocation } from "wouter";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Transactions from "@/pages/transactions";
import Budgets from "@/pages/budgets";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { Loader2 } from "lucide-react";

function PublicOnlyRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/");
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (user) {
    return <LoadingScreen />;
  }
  
  return <Component />;
}

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();
  
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return <LoadingScreen />;
  }
  
  return <Component />;
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)"}}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/auth" component={() => <PublicOnlyRoute component={AuthPage} />} />
      <Route path="/" component={() => <PrivateRoute component={Dashboard} />} />
      <Route path="/transactions" component={() => <PrivateRoute component={Transactions} />} />
      <Route path="/budgets" component={() => <PrivateRoute component={Budgets} />} />
      <Route path="/reports" component={() => <PrivateRoute component={Reports} />} />
      <Route path="/settings" component={() => <PrivateRoute component={Settings} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
