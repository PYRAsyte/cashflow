import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function Settings() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || "",
      email: user?.email || "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onProfileSubmit = (values: ProfileFormValues) => {
    // This would normally call an API endpoint to update the profile
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  const onPasswordSubmit = (values: PasswordFormValues) => {
    // This would normally call an API endpoint to update the password
    toast({
      title: "Password updated",
      description: "Your password has been updated successfully.",
    });
    passwordForm.reset();
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setIsLogoutDialogOpen(false);
  };

  return (
    <AppLayout title="Settings">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Tabs for different settings sections */}
          <div className="md:w-1/4">
            <Card className="bg-white/5 border-slate-700">
              <CardContent className="p-0">
                <Tabs
                  defaultValue="profile"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  orientation="vertical"
                  className="w-full"
                >
                  <TabsList className="flex flex-col h-auto bg-transparent p-0 w-full">
                    <TabsTrigger
                      value="profile"
                      className="justify-start px-4 py-3 text-left data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b border-slate-700"
                    >
                      Profile
                    </TabsTrigger>
                    <TabsTrigger
                      value="security"
                      className="justify-start px-4 py-3 text-left data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b border-slate-700"
                    >
                      Security
                    </TabsTrigger>
                    <TabsTrigger
                      value="preferences"
                      className="justify-start px-4 py-3 text-left data-[state=active]:bg-primary/10 data-[state=active]:text-primary rounded-none border-b border-slate-700"
                    >
                      Preferences
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-center p-4 pt-6">
                <Button
                  variant="destructive"
                  onClick={() => setIsLogoutDialogOpen(true)}
                  disabled={logoutMutation.isPending}
                  className="w-full"
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Content area for selected tab */}
          <div className="md:w-3/4">
            {activeTab === "profile" && (
              <Card className="bg-white/5 border-slate-700">
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Manage your account information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="bg-white/5 border-slate-700"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                className="bg-white/5 border-slate-700"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">Save Changes</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {activeTab === "security" && (
              <Card className="bg-white/5 border-slate-700">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Update your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                className="bg-white/5 border-slate-700"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                className="bg-white/5 border-slate-700"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="password"
                                className="bg-white/5 border-slate-700"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit">Update Password</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {activeTab === "preferences" && (
              <Card className="bg-white/5 border-slate-700">
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Customize your app experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Currency</h3>
                      <p className="text-slate-400 mb-4">
                        Default currency used throughout the app.
                      </p>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            id="usd" 
                            name="currency" 
                            className="mr-2" 
                            defaultChecked 
                          />
                          <label htmlFor="usd" className="flex items-center">
                            <span className="text-xl mr-2">$</span>
                            <span>USD - US Dollar</span>
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            id="eur" 
                            name="currency" 
                            className="mr-2" 
                          />
                          <label htmlFor="eur" className="flex items-center">
                            <span className="text-xl mr-2">€</span>
                            <span>EUR - Euro</span>
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            id="gbp" 
                            name="currency" 
                            className="mr-2" 
                          />
                          <label htmlFor="gbp" className="flex items-center">
                            <span className="text-xl mr-2">£</span>
                            <span>GBP - British Pound</span>
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            id="inr" 
                            name="currency" 
                            className="mr-2" 
                          />
                          <label htmlFor="inr" className="flex items-center">
                            <span className="text-xl mr-2">₹</span>
                            <span>INR - Indian Rupee</span>
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            id="aed" 
                            name="currency" 
                            className="mr-2" 
                          />
                          <label htmlFor="aed" className="flex items-center">
                            <span className="text-xl mr-2">د.إ</span>
                            <span>AED - UAE Dirham</span>
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            id="cny" 
                            name="currency" 
                            className="mr-2" 
                          />
                          <label htmlFor="cny" className="flex items-center">
                            <span className="text-xl mr-2">¥</span>
                            <span>CNY - Chinese Yuan</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="bg-slate-700" />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Date Format</h3>
                      <p className="text-slate-400 mb-4">
                        How dates are displayed in the application.
                      </p>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            id="mdy" 
                            name="dateFormat" 
                            className="mr-2" 
                            defaultChecked 
                          />
                          <label htmlFor="mdy">MM/DD/YYYY (e.g., 12/31/2023)</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            id="dmy" 
                            name="dateFormat"
                            className="mr-2" 
                          />
                          <label htmlFor="dmy">DD/MM/YYYY (e.g., 31/12/2023)</label>
                        </div>
                        <div className="flex items-center">
                          <input 
                            type="radio" 
                            id="ymd" 
                            name="dateFormat"
                            className="mr-2" 
                          />
                          <label htmlFor="ymd">YYYY-MM-DD (e.g., 2023-12-31)</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Preferences</Button>
                </CardFooter>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-white hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600"
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
