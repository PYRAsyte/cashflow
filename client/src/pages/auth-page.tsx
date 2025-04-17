import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, loginSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { AnimatePresence, motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartLine } from "lucide-react";

const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;
type LoginValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (user) {
      setIsRedirecting(true);
      // Add a delay for the transition animation
      const timer = setTimeout(() => {
        navigate("/");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
    },
  });

  const onLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        setIsRedirecting(true);
        setTimeout(() => {
          navigate("/");
        }, 800);
      }
    });
  };

  const onRegisterSubmit = (values: RegisterValues) => {
    const { confirmPassword, ...userData } = values;
    registerMutation.mutate(userData, {
      onSuccess: () => {
        setIsRedirecting(true);
        setTimeout(() => {
          navigate("/");
        }, 800);
      }
    });
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
      {/* Auth Form Section */}
      <div className="flex items-center justify-center p-6">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isRedirecting ? { opacity: 0, y: -30 } : { opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Card className="w-full bg-opacity-5 backdrop-blur-lg bg-white/5 border-slate-700 shadow-xl">
              <CardHeader className="space-y-1">
                <div className="flex items-center mb-2">
                  <ChartLine className="h-6 w-6 mr-2 text-primary" />
                  <CardTitle className="text-2xl text-white">CashFlow</CardTitle>
                </div>
                <CardDescription className="text-slate-300">
                  Your personal finance tracker
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
                  <TabsList className="grid w-full grid-cols-2 mb-4 bg-slate-800">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  
                  {/* Login Form */}
                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Username</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                  placeholder="Enter your username" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Password</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="password"
                                  className="bg-slate-800/50 border-slate-700 text-white" 
                                  placeholder="Enter your password"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full bg-primary hover:bg-primary/90"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? "Logging in..." : "Login"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  {/* Register Form */}
                  <TabsContent value="register">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Full Name</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                  placeholder="Enter your full name" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Username</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                  placeholder="Choose a username" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Email</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="email"
                                  className="bg-slate-800/50 border-slate-700 text-white"
                                  placeholder="Enter your email" 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Password</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="password"
                                  className="bg-slate-800/50 border-slate-700 text-white" 
                                  placeholder="Create a password"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-300">Confirm Password</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="password"
                                  className="bg-slate-800/50 border-slate-700 text-white" 
                                  placeholder="Confirm your password"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button 
                          type="submit" 
                          className="w-full bg-primary hover:bg-primary/90"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? "Creating account..." : "Create Account"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-center border-t border-slate-700 pt-4">
                <p className="text-sm text-slate-400">
                  {activeTab === "login" 
                    ? "Don't have an account? " 
                    : "Already have an account? "}
                  <Button 
                    variant="link" 
                    className="p-0 text-primary hover:text-primary/90"
                    onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
                  >
                    {activeTab === "login" ? "Register" : "Login"}
                  </Button>
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hero Section */}
      <div className="hidden md:flex flex-col justify-center p-12 text-white">
        <div className="space-y-6 max-w-xl">
          <h1 className="text-4xl font-bold">Take control of your finances</h1>
          <p className="text-xl text-slate-300">
            Track expenses, manage budgets, and gain insights into your spending habits with our intuitive money tracking app.
          </p>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Track Your Expenses</h3>
                <p className="text-slate-300">Easily record and categorize your expenses and income.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Set and Track Budgets</h3>
                <p className="text-slate-300">Create monthly budgets by category and track your progress.</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Visual Analytics</h3>
                <p className="text-slate-300">Get insights with beautiful charts and reports.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}