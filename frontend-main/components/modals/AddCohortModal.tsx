// components/modals/AddCohortModal.tsx
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export function AddCohorModal({ isOpen, setIsOpen }: Props) {
  const [cohortName, setCohortName] = React.useState("");
  const [startDate, setStartDate] = React.useState<Date>();
  const [endDate, setEndDate] = React.useState<Date>();
  const [openStart, setOpenStart] = React.useState(false);
  const [openEnd, setOpenEnd] = React.useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
     
      <DialogContent className="max-w-sm rounded-xl p-6 bg-white border border-gray-200 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Add New Cohort
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={() => setIsOpen(false)} className="flex flex-col gap-4 mt-2">
          <Input
            type="text"
            placeholder="Cohort Name"
            value={cohortName}
            onChange={(e) => setCohortName(e.target.value)}
            className="rounded-md focus:outline-0 border-gray-300  focus:ring-0 text-gray-900"
            required
          />
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
            size={'lg'}
            className="w-full rounded-md bg-black text-white hover:bg-gray-800 transition"
            disabled={!cohortName.trim() || !startDate || !endDate}
          >
            Add Cohort
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}