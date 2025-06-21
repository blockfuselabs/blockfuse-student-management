import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react";

export type Cohort = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  students: number;
  status: "active" | "completed" | "upcoming";
  tracks: number[]; // Array of track numbers (0 for web2, 1 for web3)
};

// Helper function to get track name
const getTrackName = (trackNumber: number): string => {
  return trackNumber === 0 ? "web2" : trackNumber === 1 ? "web3" : `Track ${trackNumber}`;
};

// Create a function that returns the columns with the onAddTrack callback
export const createCohortColumns = (onAddTrack: (cohort: Cohort) => void) => [
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
    header: "Tracks",
    accessor: "tracks" as const,
    render: (item: Cohort) => (
      <div className="flex flex-wrap gap-1">
        {item.tracks.length > 0 ? (
          item.tracks.map((track) => (
            <span
              key={`${item.id}-${track}`}
              className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {getTrackName(track)}
            </span>
          ))
        ) : (
          <span className="text-gray-500 text-sm">No tracks</span>
        )}
      </div>
    ),
  },
  {
    header: "Status",
    accessor: "status" as const,
    render: (item: Cohort) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === "active"
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
            onClick={() => onAddTrack(item)}
          >
            <Plus className="h-4 w-4" />
            Add Track
          </DropdownMenuItem>
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