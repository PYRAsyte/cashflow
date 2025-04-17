import { useState } from "react";
import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface TransactionFilterProps {
  onFilterChange: (filters: any) => void;
  currentFilters: any;
}

export function TransactionFilter({ onFilterChange, currentFilters }: TransactionFilterProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState({
    startDate: currentFilters.startDate,
    endDate: currentFilters.endDate,
    categoryId: currentFilters.categoryId,
    type: currentFilters.type,
  });

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const handleApplyFilters = () => {
    onFilterChange(tempFilters);
    setIsDialogOpen(false);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      startDate: undefined,
      endDate: undefined,
      categoryId: undefined,
      type: undefined,
    };
    setTempFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setIsDialogOpen(false);
  };

  // Count active filters
  const activeFilterCount = Object.values(currentFilters).filter(Boolean).length;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="bg-white/5 border-slate-700"
        >
          <Filter className="mr-2 h-4 w-4" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle>Filter Transactions</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !tempFilters.startDate && "text-slate-500"
                    } bg-white/5 border-slate-700`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tempFilters.startDate ? (
                      format(tempFilters.startDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                  <Calendar
                    mode="single"
                    selected={tempFilters.startDate}
                    onSelect={(date) => setTempFilters({ ...tempFilters, startDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      !tempFilters.endDate && "text-slate-500"
                    } bg-white/5 border-slate-700`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tempFilters.endDate ? (
                      format(tempFilters.endDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                  <Calendar
                    mode="single"
                    selected={tempFilters.endDate}
                    onSelect={(date) => setTempFilters({ ...tempFilters, endDate: date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={tempFilters.categoryId?.toString()}
                onValueChange={(value) => setTempFilters({ ...tempFilters, categoryId: value ? parseInt(value) : undefined })}
              >
                <SelectTrigger className="bg-white/5 border-slate-700">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="">All Categories</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={tempFilters.type}
                onValueChange={(value) => setTempFilters({ ...tempFilters, type: value || undefined })}
              >
                <SelectTrigger className="bg-white/5 border-slate-700">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleClearFilters}
            className="border-slate-700"
          >
            Clear Filters
          </Button>
          <Button onClick={handleApplyFilters}>
            Apply Filters
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
