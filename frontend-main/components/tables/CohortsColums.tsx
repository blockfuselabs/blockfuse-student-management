import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export type Cohort = {
  id: number;
  name: string;
  startDate: number;
  endDate: number;
  students: number;
  tracks: string[];
  duration: number;
  status: "active" | "completed" | "upcoming";
};

// Helper function to format timestamp to readable date
const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper function to calculate status based on dates
const calculateStatus = (
  startDate: number,
  endDate: number
): "active" | "completed" | "upcoming" => {
  const now = Math.floor(Date.now() / 1000);

  if (now < startDate) {
    return "upcoming";
  } else if (now >= startDate && now <= endDate) {
    return "active";
  } else {
    return "completed";
  }
};

// Helper function to format tracks
const formatTracks = (tracks: string[]): string => {
  if (!tracks || tracks.length === 0) return "No tracks";
  return tracks.map((track) => track.toUpperCase()).join(", ");
};

// Helper function to convert number to Roman numeral
const toRomanNumeral = (num: number): string => {
  if (num === 0) return "0";

  const romanNumerals = [
    { value: 1000, numeral: "M" },
    { value: 900, numeral: "CM" },
    { value: 500, numeral: "D" },
    { value: 400, numeral: "CD" },
    { value: 100, numeral: "C" },
    { value: 90, numeral: "XC" },
    { value: 50, numeral: "L" },
    { value: 40, numeral: "XL" },
    { value: 10, numeral: "X" },
    { value: 9, numeral: "IX" },
    { value: 5, numeral: "V" },
    { value: 4, numeral: "IV" },
    { value: 1, numeral: "I" },
  ];

  let result = "";
  let remaining = num;

  for (const { value, numeral } of romanNumerals) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }

  return result;
};

export const cohortcolumns = [
  {
    header: "Cohort Name",
    accessor: "id" as const,
    render: (item: Cohort) => (
      <span className="font-medium">Cohort {toRomanNumeral(item.id)}</span>
    ),
  },
  {
    header: "Tracks",
    accessor: "tracks" as const,
    render: (item: Cohort) => (
      <span className="text-sm text-gray-600">{formatTracks(item.tracks)}</span>
    ),
  },
  {
    header: "Start Date",
    accessor: "startDate" as const,
    render: (item: Cohort) => (
      <span className="text-sm">{formatDate(item.startDate)}</span>
    ),
  },
  {
    header: "End Date",
    accessor: "endDate" as const,
    render: (item: Cohort) => (
      <span className="text-sm">{formatDate(item.endDate)}</span>
    ),
  },
  {
    header: "Students",
    accessor: "students" as const,
    render: (item: Cohort) => (
      <span className="font-medium">{item.students}</span>
    ),
  },
  {
    header: "Status",
    accessor: "status" as const,
    render: (item: Cohort) => {
      const status = calculateStatus(item.startDate, item.endDate);
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            status === "active"
              ? "bg-green-100 text-green-800"
              : status === "upcoming"
              ? "bg-blue-100 text-blue-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {status}
        </span>
      );
    },
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
