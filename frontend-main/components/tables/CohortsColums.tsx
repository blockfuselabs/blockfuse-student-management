import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
  
export type Cohort = {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    students: number;
    status: "active" | "completed" | "upcoming";
  };
export const cohortcolumns = [
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