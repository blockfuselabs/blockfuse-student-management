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
import { useGetCohorts } from "@/lib/hooks/useGetCohorts";

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export function AddMentorModal({ isOpen, setIsOpen }: Props) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [cohort, setCohort] = React.useState("");
  const [status, setStatus] = React.useState("active");

  // Get real cohort data and filter out completed cohorts
  const { cohorts, isLoading: isLoadingCohorts } = useGetCohorts();

  // Filter out completed cohorts and create options
  const cohortOptions = React.useMemo(() => {
    return cohorts
      .filter(cohort => cohort.status !== "completed")
      .map(cohort => ({
        value: cohort.id,
        label: `${cohort.name} (${cohort.status}) - ${cohort.startDate} to ${cohort.endDate}`
      }));
  }, [cohorts]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm rounded-xl p-6 bg-white border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Add New Mentor
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={() => setIsOpen(false)} className="flex flex-col gap-4 mt-2">
          <Input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-md border-gray-300 text-gray-900 w-full focus:outline-none focus:ring-0 focus:border-gray-300"
            required
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-md border-gray-300 text-gray-900 w-full focus:outline-none focus:ring-0 focus:border-gray-300"
            required
          />
          <select
            value={cohort}
            onChange={(e) => setCohort(e.target.value)}
            className="w-full rounded-md border-gray-300 text-gray-900 focus:outline-none focus:ring-0 focus:border-gray-300"
            required
            disabled={isLoadingCohorts}
          >
            <option value="" disabled>
              {isLoadingCohorts ? "Loading cohorts..." : "Select Cohort"}
            </option>
            {cohortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {cohortOptions.length === 0 && !isLoadingCohorts && (
            <p className="text-sm text-gray-500">
              No active cohorts available. Please create a cohort first.
            </p>
          )}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-md border-gray-300 text-gray-900 focus:outline-none focus:ring-0 focus:border-gray-300"
            required
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Mentor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 