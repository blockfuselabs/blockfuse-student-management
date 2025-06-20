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
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useCreateCohort } from "@/lib/hooks/useCreateCohort";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export function AddCohortModal({ isOpen, setIsOpen }: Props) {
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();
  const [openStart, setOpenStart] = React.useState(false);
  const [openEnd, setOpenEnd] = React.useState(false);
  const { createCohort, isPending, isConfirming, isSuccess, error, transactionHash } =
    useCreateCohort();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (startDate && endDate) {
      console.log("Submitting cohort with dates:", startDate, endDate); // Debug log
      await createCohort(startDate, endDate);
      if (isSuccess) {
        setIsOpen(false); // Close modal on success
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm rounded-xl p-6 bg-white border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Add New Cohort
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* Start Date Picker */}
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Popover open={openStart} onOpenChange={setOpenStart}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
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
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Popover open={openEnd} onOpenChange={setOpenEnd}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
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
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-md bg-black text-white hover:bg-gray-800 transition"
            disabled={isPending || isConfirming || !startDate || !endDate}
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
          {error && <div className="mt-2 text-red-500 text-sm">{error}</div>}
          {isSuccess && (
            <div className="mt-2 text-green-500 text-sm">
              Cohort created successfully! Transaction Hash: {transactionHash}
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}