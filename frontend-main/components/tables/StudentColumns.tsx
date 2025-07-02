import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { MoreHorizontal, Pencil, Trash2, Shield, Star } from "lucide-react";
import { useRemoveAdmin, useAddAdmin } from "@/lib/hooks/useAdminFacet";
import { toast } from "react-toastify";
import React from "react";
import AdminFacetABI from "@/lib/contract/AdminFacet.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";

export type Student = {
  id: string;
  name: string;
  email: string;
  cohort: string;
  status: "active" | "graduated" | "evicted" | "suspended";
  finalScore: number;
};

export const studentColumns = (
  onAddScore?: (studentAddress: string) => void,
  onEdit?: (studentAddress: string) => void
) => [
    {
      header: "Name",
      accessor: "name" as const,
    },
    {
      header: "Track",
      accessor: "email" as const,
    },
    {
      header: "Cohort",
      accessor: "cohort" as const,
    },
    {
      header: "Final Score",
      accessor: "finalScore" as const,
      render: (item: Student) => (
        <span className="font-medium text-gray-900">
          {item.finalScore}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status" as const,
      render: (item: Student) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === "active"
            ? "bg-green-100 text-green-800"
            : item.status === "graduated"
              ? "bg-blue-100 text-blue-800"
              : item.status === "evicted"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: "id" as const,
      render: (item: Student) => (
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
              onClick={() => onEdit && onEdit(item.id)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {onAddScore && (
              <DropdownMenuItem
                className="flex items-center gap-2 cursor-pointer text-blue-600 focus:text-blue-600"
                onClick={() => onAddScore(item.id)}
              >
                <Star className="h-4 w-4" />
                Add Score
              </DropdownMenuItem>
            )}
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

export type Admin = {
  id: string;
  address: string;
  isActive: boolean;
};

// Separate component for admin actions to use hooks properly
const AdminActions = ({
  admin,
  onAdminRemoved,
}: {
  admin: Admin;
  onAdminRemoved?: () => void;
}) => {
  const { writeContract: removeAdmin, isPending: isRemoving } =
    useRemoveAdmin();

  const { writeContract: addAdmin, isPending: isAdding } = useAddAdmin();

  const handleRemoveAdmin = async () => {
    try {
      await removeAdmin({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: AdminFacetABI.abi,
        functionName: "removeAdmin",
        args: [admin.address as `0x${string}`],
      });
      toast.success("Admin deactivated successfully");
      // Call the refresh callback if provided
      if (onAdminRemoved) {
        onAdminRemoved();
      }
    } catch (error) {
      console.error("Error deactivating admin:", error);
      toast.error("Failed to deactivate admin");
    }
  };

  const handleAddAdmin = async () => {
    try {
      await addAdmin({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: AdminFacetABI.abi,
        functionName: "addAdmin",
        args: [admin.address as `0x${string}`],
      });
      toast.success("Admin activated successfully");
      // Call the refresh callback if provided
      if (onAdminRemoved) {
        onAdminRemoved();
      }
    } catch (error) {
      console.error("Error activating admin:", error);
      toast.error("Failed to activate admin");
    }
  };

  return (
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
          onClick={() => console.log("View", admin.address)}
        >
          <Pencil className="h-4 w-4" />
          View Details
        </DropdownMenuItem>
        {admin.isActive ? (
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600"
            onClick={handleRemoveAdmin}
            disabled={isRemoving}
          >
            <Trash2 className="h-4 w-4" />
            {isRemoving ? "Deactivating..." : "Deactivate Admin"}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer text-green-600 focus:text-green-600"
            onClick={handleAddAdmin}
            disabled={isAdding}
          >
            <Shield className="h-4 w-4" />
            {isAdding ? "Activating..." : "Activate Admin"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const adminColumns = (onAdminRemoved?: () => void) => [
  {
    header: "Wallet Address",
    accessor: "address" as const,
    render: (item: Admin) => (
      <div className="font-mono text-sm">
        {item.address.slice(0, 6)}...{item.address.slice(-4)}
      </div>
    ),
  },
  {
    header: "Status",
    accessor: "isActive" as const,
    render: (item: Admin) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${item.isActive
          ? "bg-green-100 text-green-800"
          : "bg-gray-100 text-gray-800"
          }`}
      >
        {item.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    header: "Actions",
    accessor: "id" as const,
    render: (item: Admin) => (
      <AdminActions admin={item} onAdminRemoved={onAdminRemoved} />
    ),
  },
];
