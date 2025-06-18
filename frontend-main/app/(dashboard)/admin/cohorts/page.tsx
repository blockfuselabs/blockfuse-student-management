"use client";

import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import React from "react";
import { Table } from "@/components/shared/Table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Define the type for our cohort data
type Cohort = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  students: number;
  status: "active" | "completed" | "upcoming";
};

// Sample data
const data: Cohort[] = [
  {
    id: "1",
    name: "Web Development 2024",
    startDate: "2024-01-15",
    endDate: "2024-07-15",
    students: 25,
    status: "active",
  },
  {
    id: "2",
    name: "Mobile Development 2024",
    startDate: "2024-02-01",
    endDate: "2024-08-01",
    students: 20,
    status: "upcoming",
  },
  {
    id: "3",
    name: "Data Science 2024",
    startDate: "2024-03-01",
    endDate: "2024-09-01",
    students: 15,
    status: "upcoming",
  },
];

// Define columns
const columns = [
  {
    header: "Cohort Name",
    accessor: "name" as const,
  },
  {
    header: "Start Date",
    accessor: "startDate" as const,
  },
  {
    header: "End Date",
    accessor: "endDate" as const,
  },
  {
    header: "Students",
    accessor: "students" as const,
  },
  {
    header: "Status",
    accessor: "status" as const,
    render: (item: Cohort) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.status === "active"
            ? "bg-green-100 text-green-800"
            : item.status === "upcoming"
            ? "bg-blue-100 text-blue-800"
            : "bg-gray-100 text-gray-800"
        }`}
      >
        {item.status}
      </span>
    ),
  },
  {
    header: "Actions",
    accessor: "id" as const,
    render: (item: Cohort) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => console.log("Edit", item.id)}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
            onClick={() => console.log("Delete", item.id)}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

const CohortsPage = () => {
  return (
    <div className="p-6 h-screen bg-white rounded-xl">
      <div className="flex w-full justify-between items-center">
        <div className="">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Cohorts Management
          </h1>
          <p className="text-gray-400 mt-1">
            Create, organize, and manage student cohorts.
          </p>
        </div>

        <Button
          size="lg"
          className="flex text-base h-[44px] w-[130px] gap-1 items-center"
        >
          Add new
          {/* <Plus size={14} /> */}
        </Button>
      </div>

      <div className="mt-7 w-full">
        <Table
          data={data}
          columns={columns}
          title=""
          searchable={false}
          exportable={false}
        />
      </div>
    </div>
  );
};

export default CohortsPage;
