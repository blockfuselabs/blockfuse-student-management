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
import { useAddAdmin } from "@/lib/hooks/useAddAdmin";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onAdminAdded?: () => void; // Callback to refresh admin list
};

export function AddAdminModal({ isOpen, setIsOpen, onAdminAdded }: Props) {
  const [address, setAddress] = React.useState("");
  const { addAdmin, isLoading, isSuccess, error, reset } = useAddAdmin();

  // Reset form and hook state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setAddress("");
      reset();
    }
  }, [isOpen, reset]);

  // Close modal and refresh list on success
  React.useEffect(() => {
    if (isSuccess) {
      setIsOpen(false);
      // Call the refresh callback if provided
      if (onAdminAdded) {
        onAdminAdded();
      }
    }
  }, [isSuccess, setIsOpen, onAdminAdded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim()) {
      return;
    }

    try {
      await addAdmin({ adminAddress: address });
    } catch (err) {
      console.error("Error adding admin:", err);
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

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size={"lg"}
            className="w-full rounded-md bg-black text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!address.trim() || isLoading}
          >
            {isLoading ? "Adding Admin..." : "Add Admin"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
