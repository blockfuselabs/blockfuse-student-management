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

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const cohortOptions = [
  { value: "Web Development 2024", label: "Web Development 2024" },
  { value: "Mobile Development 2024", label: "Mobile Development 2024" },
  { value: "Data Science 2024", label: "Data Science 2024" },
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
          >
            <option value="" disabled>Select Cohort</option>
            {cohortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-md border-gray-300 text-gray-900 focus:outline-none focus:ring-0 focus:border-gray-300"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Button
            type="submit"
            size={"lg"}
            className="w-full rounded-md bg-black text-white hover:bg-gray-800 transition"
            disabled={!name.trim() || !email.trim() || !cohort.trim()}
          >
            Add Mentor
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 