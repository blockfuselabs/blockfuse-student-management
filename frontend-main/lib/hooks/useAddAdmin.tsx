"use client";
import { useState, useEffect } from "react";
import { useWriteContract, useTransaction } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import DiamondABI from "@/lib/contract/DiamondABI.json";

export interface AddAdminParams {
  adminAddress: string;
}

export const useAddAdmin = () => {
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
      console.log("Admin added successfully!");
    }
  }, [isSuccess]);

  // Handle transaction errors
  useEffect(() => {
    if (isWriteError || isTransactionError) {
      const errorMessage = writeError?.message || "Transaction failed";
      console.log("Transaction error:", errorMessage);
      setError(errorMessage);
    }
  }, [isWriteError, isTransactionError, writeError]);

  const addAdmin = async (params: AddAdminParams) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Adding admin with params:", params);

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
        abi: DiamondABI.abi,
        functionName: "addAdmin",
        args: [params.adminAddress],
      });
    } catch (err) {
      console.error("Error adding admin:", err);
      setError(err instanceof Error ? err.message : "Failed to add admin");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addAdmin,
    isLoading: isLoading || isTransactionLoading,
    isSuccess,
    error,
    resetError: () => setError(null),
  };
};
