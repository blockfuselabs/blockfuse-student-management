import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddAdminWithUsername } from "@/lib/hooks/useAdminUsernameFacet";
import AdminUsernameFacetAbi from "@/lib/contract/AdminUsernameFacet.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onAdminAdded?: () => void; // Callback to refresh admin list
};

export function AddAdminModal({ isOpen, setIsOpen, onAdminAdded }: Props) {
  const [address, setAddress] = React.useState("");
  const [username, setUsername] = React.useState("");
  const { writeContract, isPending, isSuccess, isError, error, reset } = useAddAdminWithUsername();
  const isLoading = isPending;

  // Reset form and hook state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setAddress("");
      setUsername("");
      if (typeof reset === "function") reset();
    }
  }, [isOpen, reset]);

  // Handle success - close modal and refresh list
  React.useEffect(() => {
    if (isSuccess) {
      // Small delay to ensure blockchain state is updated
      setTimeout(() => {
        setIsOpen(false);
        // Call the refresh callback if provided
        if (onAdminAdded) {
          onAdminAdded();
        }
      }, 1000); // 1 second delay to allow blockchain to update
    }
  }, [isSuccess, setIsOpen, onAdminAdded]);

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedAddress = address.trim();
    const trimmedUsername = username.trim();
    if (!trimmedAddress || !trimmedUsername) {
      return;
    }
    try {
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: AdminUsernameFacetAbi.abi,
        functionName: "addAdminWithUsername",
        args: [trimmedAddress, trimmedUsername],
      });
    } catch (err) {
      console.error("Error adding admin:", err);
      // Optionally show a toast or set a local error state
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm rounded-xl p-6 bg-white border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Add New Admin
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Admin Wallet Address
            </label>
            <Input
              type="text"
              placeholder="0x..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="rounded-md border-gray-300 text-gray-900 w-full focus:outline-none focus:ring-0 focus:border-gray-300"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the Ethereum wallet address of the admin to be added
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Admin Username
            </label>
            <Input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-md border-gray-300 text-gray-900 w-full focus:outline-none focus:ring-0 focus:border-gray-300"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a username for the admin
            </p>
          </div>

          {isError && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
              {error?.message ||
                (typeof error === "string" ? error : "") ||
                "Failed to add admin"}
              <br />
              <span className="text-xs text-gray-500">
                Check console for details.
              </span>
            </div>
          )}

          {isSuccess && (
            <div className="text-green-600 text-sm bg-green-50 p-2 rounded-md">
              Admin added successfully! Refreshing data...
            </div>
          )}

          <Button
            type="submit"
            size={"lg"}
            className="w-full rounded-md bg-black text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!address.trim() || !username.trim() || isLoading}
          >
            {isLoading ? "Adding Admin..." : "Add Admin"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
