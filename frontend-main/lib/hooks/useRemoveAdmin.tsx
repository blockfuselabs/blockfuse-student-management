"use client";
import { useState, useEffect } from "react";
import { useWriteContract, useTransaction } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import AdminABI from "@/lib/contract/DiamondABI.json";

export interface RemoveAdminParams {
  adminAddress: string;
}

export const useRemoveAdmin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    writeContract,
    data: writeData,
    isError: isWriteError,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isTransactionLoading,
    isSuccess,
    isError: isTransactionError,
  } = useTransaction({
    hash: writeData,
  });

  // Handle transaction success
  useEffect(() => {
    if (isSuccess) {
      console.log("Admin removed successfully!");
    }
  }, [isSuccess]);

  // Handle transaction errors
  useEffect(() => {
    if (isWriteError || isTransactionError) {
      const errorMessage = writeError?.message || "Transaction failed";
      console.error("Transaction error:", errorMessage);
      setError(errorMessage);
    }
  }, [isWriteError, isTransactionError, writeError]);

  const removeAdmin = async (params: RemoveAdminParams) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Removing admin with params:", params);

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
        abi: AdminABI.abi,
        functionName: "removeAdmin",
        args: [params.adminAddress],
      });
    } catch (err) {
      console.error("Error removing admin:", err);
      setError(err instanceof Error ? err.message : "Failed to remove admin");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    removeAdmin,
    isLoading: isLoading || isTransactionLoading,
    isSuccess,
    error,
    resetError: () => setError(null),
  };
};
