"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useCreateCohort } from "@/lib/hooks/useCreateCohort";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export function AddCohortModal({ isOpen, setIsOpen }: Props) {
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const [openStart, setOpenStart] = React.useState(false);
  const [openEnd, setOpenEnd] = React.useState(false);

  const {
    createCohort,
    isPending,
    isConfirming,
    isSuccess,
    error,
    transactionHash,
  } = useCreateCohort();

  // Format error message
  const formatError = (err: string | null) => {
    if (!err) return null;
    if (err.includes("reverted")) return "Transaction failed. Please check your wallet.";
    if (err.includes("network")) return "Network error. Please check your connection.";
    if (err.includes("start date")) return "Please select a start date.";
    if (err.includes("end date")) return "Please select an end date.";
    return "Failed to create cohort.";
  };

  const formattedError = formatError(error ?? null);

  // Handle success
  React.useEffect(() => {
    if (isSuccess && transactionHash) {
      toast.success("Cohort created successfully!", {
        description: `Transaction: ${transactionHash.slice(0, 10)}...`,
      });
      handleClose();
    }
  }, [isSuccess, transactionHash]);

  // Handle errors
  React.useEffect(() => {
    if (formattedError) {
      toast.error("Failed to create cohort", {
        description: formattedError,
      });
    }
  }, [formattedError]);

  const handleClose = () => {
    setIsOpen(false);
    setStartDate(undefined);
    setEndDate(undefined);
    setOpenStart(false);
    setOpenEnd(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates.");
      return;
    }
    if (endDate <= startDate) {
      toast.error("End date must be after start date.");
      return;
    }
    await createCohort(startDate, endDate);
  };

  const isFormValid = startDate && endDate && endDate > startDate;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm rounded-xl p-6 bg-white border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Add New Cohort
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Start Date Picker */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-1">
              Start Date
            </label>
            <Popover open={openStart} onOpenChange={setOpenStart}>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant="outline"
                  className={`w-full justify-between ${!startDate && formattedError?.includes("start date") ? "border-red-500" : ""}`}
                  onClick={() => setOpenStart(true)}
                  type="button"
                >
                  {startDate ? format(startDate, "PPP") : "Select start date"}
                  <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    setOpenStart(false);
                  }}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* End Date Picker */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-1">
              End Date
            </label>
            <Popover open={openEnd} onOpenChange={setOpenEnd}>
              <PopoverTrigger asChild>
                <Button
                  id="endDate"
                  variant="outline"
                  className={`w-full justify-between ${!endDate && formattedError?.includes("end date") ? "border-red-500" : ""}`}
                  onClick={() => setOpenEnd(true)}
                  type="button"
                >
                  {endDate ? format(endDate, "PPP") : "Select end date"}
                  <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    setOpenEnd(false);
                  }}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
          </div>
          {/* Error Display (4 lines) */}
          <div className="w-full" aria-live="polite">
            {formattedError && (
              <div className="mt-2 text-red-500 text-sm flex items-center gap-1 truncate">
                <AlertCircle className="h-4 w-4 flex-shrink-0" /> {formattedError}
              </div>
            )}
          </div>
          {/* Success Display */}
          {isSuccess && (
            <div className="mt-2 text-green-500 text-sm truncate">
              Cohort created! Hash: {transactionHash?.slice(0, 10)}...
            </div>
          )}
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-md bg-black text-white hover:bg-gray-800 transition"
            disabled={isPending || isConfirming || !isFormValid}
          >
            {isPending || isConfirming ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isPending ? "Sending..." : "Confirming..."}</span>
              </div>
            ) : (
              "Add Cohort"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}