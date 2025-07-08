"use client";

import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import AdminFacetABI from "@/lib/contract/AdminFacet.json";
import { toast } from "sonner";

export interface DeactivateAdminParams {
  adminAddress: string;
}

export const useDeactivateAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    writeContract,
    data: hash,
    isError: isWriteError,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isConfirmError,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Reset states when starting a new transaction
  useEffect(() => {
    if (hash) {
      setIsSuccess(false);
      setError(null);
    }
  }, [hash]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      setIsSuccess(true);
      setIsLoading(false);
    }
  }, [isConfirmed]);

  // Handle transaction errors
  useEffect(() => {
    if (isWriteError || isConfirmError) {
      const errorMessage =
        writeError?.message || confirmError?.message || "Transaction failed";
      setError(errorMessage);
      setIsLoading(false);
      toast.error(errorMessage);
    }
  }, [isWriteError, isConfirmError, writeError, confirmError]);

  const deactivateAdmin = async (params: DeactivateAdminParams) => {
    try {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      console.log("Deactivating admin with params:", params);

      if (!writeContract) {
        throw new Error("Contract write function not available");
      }

      // Validate admin address
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!addressRegex.test(params.adminAddress)) {
        throw new Error("Invalid Ethereum address format");
      }

      // Call the contract function
      await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: AdminFacetABI.abi,
        functionName: "removeAdmin",
        args: [params.adminAddress as `0x${string}`],
      });
    } catch (err) {
      console.error("Error deactivating admin:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to deactivate admin";
      setError(errorMessage);
      setIsLoading(false);
      toast.error(errorMessage);
    }
  };

  const resetState = () => {
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
    resetWrite();
  };

  return {
    deactivateAdmin,
    isLoading: isLoading || isConfirming,
    isSuccess,
    error,
    resetState,
  };
};
