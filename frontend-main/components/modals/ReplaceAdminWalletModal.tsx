"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useReplaceAdmin } from "@/lib/hooks/useReplaceAdminTx";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface ReplaceAdminWalletModalProps {
  open: boolean;
  onClose: () => void;
  admin: {
    address: string;
    username?: string;
  } | null;
  onSuccess?: () => void;
}

export const ReplaceAdminWalletModal: React.FC<
  ReplaceAdminWalletModalProps
> = ({ open, onClose, admin, onSuccess }) => {
  const [newAddress, setNewAddress] = useState("");
  const hasShownSuccessToast = useRef(false);
  const { replaceAdmin, isLoading, error, isSuccess, resetState } =
    useReplaceAdmin();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setNewAddress("");
      resetState();
      hasShownSuccessToast.current = false;
    }
  }, [open, resetState]);

  // Handle success
  useEffect(() => {
    if (isSuccess && !hasShownSuccessToast.current) {
      hasShownSuccessToast.current = true;
      toast.success("Admin wallet replaced successfully!");
      setNewAddress("");
      onClose();
      if (onSuccess) onSuccess();
      // Reset the success state to prevent repeated toasts
      resetState();
    }
  }, [isSuccess, onClose, onSuccess, resetState]);

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleReplace = async () => {
    if (!admin) return;

    try {
      await replaceAdmin({
        oldAdmin: admin.address,
        newAdmin: newAddress,
        oldUsername: admin.username, // Pass the username to transfer it
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to replace admin wallet";
      console.error("Replace admin error:", errorMessage);
    }
  };

  const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(newAddress);
  const isSameAddress =
    newAddress.toLowerCase() === admin?.address.toLowerCase();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-xl p-6 bg-white border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Replace Admin Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Current Admin
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <div className="font-medium text-gray-900">
                {admin?.username || "No username"}
              </div>
              <div className="font-mono text-sm text-gray-600 mt-1">
                {admin?.address}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              New Wallet Address
            </label>
            <Input
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="0x..."
              className="font-mono text-sm"
              disabled={isLoading}
            />
            {newAddress && !isValidAddress && (
              <p className="text-red-500 text-xs mt-1">
                Please enter a valid Ethereum address
              </p>
            )}
            {newAddress && isSameAddress && (
              <p className="text-orange-500 text-xs mt-1">
                New address is the same as current address
              </p>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>The old admin will lose all admin privileges</li>
                  <li>The new admin will gain all admin privileges</li>
                  <li>The username will be transferred to the new admin</li>
                  <li>This action cannot be undone</li>
                  <li>Only super admins can perform this action</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleReplace}
            disabled={
              !isValidAddress || isSameAddress || isLoading || !newAddress
            }
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Replacing..." : "Replace Wallet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
