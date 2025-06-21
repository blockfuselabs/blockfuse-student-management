"use client";
import { useState, useEffect } from "react";
import { useWriteContract, useTransaction } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import DiamondABI from "@/lib/contract/DiamondABI.json";

export interface CreateCohortParams {
  startDate: number;
  endDate: number;
}

export const useCreateCohort = () => {
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
      console.log("Cohort created successfully!");
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

  const createCohort = async (params: CreateCohortParams) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Creating cohort with params:", params);

      if (!writeContract) {
        throw new Error("Contract write function not available");
      }

      // Call the contract function
      await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: DiamondABI.abi,
        functionName: "createCohort",
        args: [params.startDate, params.endDate],
      });
    } catch (err) {
      console.error("Error creating cohort:", err);
      setError(err instanceof Error ? err.message : "Failed to create cohort");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCohort,
    isLoading: isLoading || isTransactionLoading,
    isSuccess,
    error,
    resetError: () => setError(null),
  };
};
