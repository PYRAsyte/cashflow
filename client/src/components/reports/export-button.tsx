import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface ExportButtonProps {
  period?: string;
}

export function ExportButton({ period = '30days' }: ExportButtonProps) {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<string>("csv");
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(new Date().setDate(new Date().getDate() - 30))
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  
  const handleExport = async () => {
    try {
      // Build query params for the export
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate.toISOString());
      if (endDate) queryParams.append('endDate', endDate.toISOString());
      
      // For CSV export, we'll use the API endpoint directly
      const url = `/api/export/transactions?${queryParams.toString()}`;
      
      // Create a link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast({
        title: "Export successful",
        description: "Your transactions have been exported successfully.",
      });
      
      setIsExportDialogOpen(false);
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your transactions.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsExportDialogOpen(true)}
        className="bg-white/5 border-slate-700"
      >
        <FileDown className="mr-2 h-4 w-4" />
        Export
      </Button>
      
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle>Export Transactions</DialogTitle>
            <DialogDescription className="text-slate-400">
              Choose a date range and format for your export.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !startDate && "text-slate-500"
                      } bg-white/5 border-slate-700`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
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
                        !endDate && "text-slate-500"
                      } bg-white/5 border-slate-700`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select
                value={exportFormat}
                onValueChange={setExportFormat}
              >
                <SelectTrigger className="bg-white/5 border-slate-700">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
              className="border-slate-700"
            >
              Cancel
            </Button>
            <Button onClick={handleExport}>
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
