"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  const TRACK_OPTIONS = [
    { value: 0, label: "web2" },
    { value: 1, label: "web3" },
  ];
  const [selectedTracks, setSelectedTracks] = React.useState<number[]>([0, 1]);
  const { createCohort, isPending, isConfirming, isSuccess, error, transactionHash } =
    useCreateCohort();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (startDate && endDate && selectedTracks.length > 0) {
      await createCohort(startDate, endDate, selectedTracks);
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
          <DialogDescription className="text-sm text-gray-600">
            Create a new cohort by selecting start and end dates.
          </DialogDescription>
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
          {/* Track Multi-Select */}
          <div>
            <label className="block text-sm font-medium mb-1">Tracks</label>
            <select
              multiple
              value={selectedTracks.map(String)}
              onChange={e => {
                const options = Array.from(e.target.selectedOptions).map(opt => Number(opt.value));
                setSelectedTracks(options);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {TRACK_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple tracks.</div>
          </div>
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-md bg-black text-white hover:bg-gray-800 transition"
            disabled={isPending || isConfirming || !startDate || !endDate || selectedTracks.length === 0}
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