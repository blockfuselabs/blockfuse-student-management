import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useReplaceStudentWalletTx } from "@/lib/hooks/useReplaceStudentWalletTx";
import { toast } from "react-toastify";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import DiamondABI from "@/lib/contract/DiamondABI.json";

interface ReplaceStudentWalletModalProps {
  open: boolean;
  onClose: () => void;
  oldAddress: string;
  onSuccess?: () => void;
}

export const ReplaceStudentWalletModal: React.FC<ReplaceStudentWalletModalProps> = ({ open, onClose, oldAddress, onSuccess }) => {
  const [newAddress, setNewAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { replaceStudentWallet, isPending } = useReplaceStudentWalletTx();

  const handleReplace = async () => {
    setIsSubmitting(true);
    try {
      await replaceStudentWallet(oldAddress, newAddress);
      toast.success("Student wallet replaced successfully!");
      setNewAddress("");
      onClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error?.message || "Failed to replace student wallet");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Replace Student Wallet</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Old Address</label>
            <Input value={oldAddress} readOnly className="mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Address</label>
            <Input
              value={newAddress}
              onChange={e => setNewAddress(e.target.value)}
              placeholder="0x..."
              className="mt-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleReplace} disabled={!newAddress || isSubmitting || isPending} loading={isSubmitting || isPending}>
            {isSubmitting || isPending ? "Replacing..." : "Replace"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 