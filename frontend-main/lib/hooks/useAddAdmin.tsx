"use client";

import { useState, useEffect, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import AdminAbi from "@/lib/contract/AdminFacet.json";

export interface AddAdminParams {
  adminAddress: string;
}

export const useAddAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    writeContract,
    data: writeData,
    isError: isWriteError,
    error: writeError,
    isPending: isWritePending,
  } = useWriteContract();

  const {
    isLoading: isTransactionLoading,
    isSuccess: isTransactionSuccess,
    isError: isTransactionError,
    error: transactionError,
  } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Handle transaction success
  useEffect(() => {
    if (isTransactionSuccess) {
      console.log("Admin added successfully!");
      setIsSuccess(true);
      setIsLoading(false);
    }
  }, [isTransactionSuccess]);

  // Handle transaction errors
  useEffect(() => {
    if (isWriteError || isTransactionError) {
      const errorMessage = 
        writeError?.message || 
        transactionError?.message || 
        "Transaction failed";
      console.log("Transaction error:", errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [isWriteError, isTransactionError, writeError, transactionError]);

  // Reset success state when starting new transaction
  useEffect(() => {
    if (isWritePending) {
      setIsSuccess(false);
    }
  }, [isWritePending]);

  const addAdmin = async (params: AddAdminParams) => {
    try {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      console.log("Adding admin with params:", params);

      // Validate admin address
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!addressRegex.test(params.adminAddress)) {
        throw new Error("Invalid Ethereum address format");
      }

      // Call the contract function
      writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: AdminAbi.abi,
        functionName: "addAdmin",
        args: [params.adminAddress],
      });
    } catch (err) {
      console.error("Error adding admin:", err);
      setError(err instanceof Error ? err.message : "Failed to add admin");
      setIsLoading(false);
    }
  };

  const resetState = useCallback(() => {
    setError(null);
    setIsSuccess(false);
  }, []);

  return {
    addAdmin,
    isLoading: isLoading || isWritePending || isTransactionLoading,
    isSuccess,
    error,
    resetError: () => setError(null),
    resetState,
  };
};