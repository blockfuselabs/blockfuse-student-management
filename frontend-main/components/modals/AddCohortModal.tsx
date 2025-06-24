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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useCreateCohort } from "@/lib/hooks/useCreateCohort";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onCohortAdded?: () => void;
};

export function AddCohortModal({ isOpen, setIsOpen, onCohortAdded }: Props) {
  const [startDate, setStartDate] = React.useState<Date | undefined>();
  const [endDate, setEndDate] = React.useState<Date | undefined>();
  const { createCohort, isLoading, isSuccess, error, resetState } = useCreateCohort();

  // Reset form and hook state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setStartDate(undefined);
      setEndDate(undefined);
      resetState();
    }
  }, [isOpen, resetState]);

  // Handle success - close modal and refresh list
  React.useEffect(() => {
    if (isSuccess) {
      console.log("Cohort creation successful, closing modal and refreshing data");
      setTimeout(() => {
        setIsOpen(false);
        if (onCohortAdded) {
          onCohortAdded();
        }
      }, 1000); // 1-second delay
    }
  }, [isSuccess, setIsOpen, onCohortAdded]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      return;
    }
    if (endDate <= startDate) {
      return;
    }
    try {
      await createCohort(startDate, endDate);
    } catch (err) {
      console.error("Error creating cohort:", err);
    }
  };

  const isFormValid = startDate && endDate && endDate > startDate;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm rounded-xl p-6 bg-white border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Add New Cohort
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium mb-1 text-gray-700"
            >
              Start Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant="outline"
                  className="w-full justify-between text-gray-900"
                  type="button"
                  disabled={isLoading}
                >
                  {startDate ? format(startDate, "PPP") : "Select start date"}
                  <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium mb-1 text-gray-700"
            >
              End Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="endDate"
                  variant="outline"
                  className="w-full justify-between text-gray-900"
                  type="button"
                  disabled={isLoading}
                >
                  {endDate ? format(endDate, "PPP") : "Select end date"}
                  <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="text-green-600 text-sm bg-green-50 p-2 rounded-md">
              Cohort created successfully! Refreshing data...
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-md bg-black text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Creating Cohort..." : "Add Cohort"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}