import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertTransactionSchema, Category } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number"
  }),
  categoryId: z.string().optional(),
  date: z.date(),
  description: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  transactionToEdit?: any;
}

export function TransactionForm({ isOpen, onClose, transactionToEdit }: TransactionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch categories
  const { data: categories, isLoading: loadingCategories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Set up form with default values
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: "",
      categoryId: undefined,
      date: new Date(),
      description: "",
    },
  });

  // Update form values when editing a transaction
  useEffect(() => {
    if (transactionToEdit) {
      form.reset({
        type: transactionToEdit.type,
        amount: transactionToEdit.amount?.toString() || "",
        categoryId: transactionToEdit.categoryId?.toString(),
        date: new Date(transactionToEdit.date),
        description: transactionToEdit.description || "",
      });
    } else {
      form.reset({
        type: "expense",
        amount: "",
        categoryId: undefined,
        date: new Date(),
        description: "",
      });
    }
  }, [transactionToEdit, form]);

  // Create transaction mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/transactions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/monthly-trends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/expense-breakdown"] });
      toast({
        title: "Transaction created",
        description: "Your transaction has been saved successfully.",
      });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create transaction: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Update transaction mutation
  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", `/api/transactions/${transactionToEdit.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/monthly-trends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/expense-breakdown"] });
      toast({
        title: "Transaction updated",
        description: "Your transaction has been updated successfully.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update transaction: " + error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: TransactionFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        amount: values.amount, // Keep as string to match the schema
        categoryId: values.categoryId ? parseInt(values.categoryId) : null,
      };

      if (transactionToEdit) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border border-slate-700 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{transactionToEdit ? "Edit Transaction" : "Add New Transaction"}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {transactionToEdit 
              ? "Update the transaction details below." 
              : "Enter the details of your transaction."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Transaction Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        <RadioGroupItem 
                          value="expense" 
                          id="expense"
                          className="peer sr-only" 
                        />
                        <label
                          htmlFor="expense"
                          className="flex items-center justify-center w-full p-3 rounded-lg cursor-pointer bg-white/5 border border-slate-700 peer-data-[state=checked]:border-red-500 peer-data-[state=checked]:bg-red-500/10"
                        >
                          <ArrowUp className="mr-2 h-4 w-4 text-red-500" />
                          <span>Expense</span>
                        </label>
                      </div>
                      <div className="flex items-center space-x-2 flex-1">
                        <RadioGroupItem 
                          value="income" 
                          id="income"
                          className="peer sr-only" 
                        />
                        <label
                          htmlFor="income"
                          className="flex items-center justify-center w-full p-3 rounded-lg cursor-pointer bg-white/5 border border-slate-700 peer-data-[state=checked]:border-green-500 peer-data-[state=checked]:bg-green-500/10"
                        >
                          <ArrowDown className="mr-2 h-4 w-4 text-green-500" />
                          <span>Income</span>
                        </label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-slate-400">$</span>
                    </div>
                    <FormControl>
                      <Input
                        placeholder="0.00"
                        {...field}
                        className="bg-white/5 border-slate-700 pl-8"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-slate-700">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {loadingCategories ? (
                        <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                      ) : (
                        categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="bg-white/5 border-slate-700 w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="bg-slate-800"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes about this transaction..."
                      {...field}
                      className="bg-white/5 border-slate-700 min-h-[80px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button
                type="button"
                variant="outline"
                className="border-slate-700 hover:bg-slate-700"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : transactionToEdit ? "Update" : "Add Transaction"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
