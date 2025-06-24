"use client";

import { useState, useEffect, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import CohortFacetABI from "@/lib/contract/CohortFacet.json";

export const useCreateCohort = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    writeContract,
    data: writeData,
    isError: isPendingError,
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

  // Handle success
  useEffect(() => {
    if (isTransactionSuccess) {
      console.log("Cohort created successfully!");
      setIsSuccess(true);
      setIsLoading(false);
    }
  }, [isTransactionSuccess]);

  // Handle errors
  useEffect(() => {
    if (isPendingError || isTransactionError) {
      const errorMessage =
        writeError?.message ||
        transactionError?.message ||
        transactionError?.toString() ||
        "Failed to create cohort";
      console.log("Transaction error:", errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [isPendingError, isTransactionError, writeError, transactionError]);

  // Reset success state on new transaction
  useEffect(() => {
    if (isWritePending) {
      setIsSuccess(false);
    }
  }, [isWritePending]);

  const createCohort = useCallback(
    async (startDate: Date, endDate: Date) => {
      try {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        if (!startDate || !endDate || endDate <= startDate) {
          throw new Error("Invalid date range: End date must be after start date");
        }

        const startTimestamp = Math.floor(startDate.getTime() / 1000);
        const endTimestamp = Math.floor(endDate.getTime() / 1000);

        console.log("Creating cohort with params:", {
          startTimestamp,
          endTimestamp,
        });

        writeContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CohortFacetABI.abi,
          functionName: "createCohort",
          args: [startTimestamp, endTimestamp],
        });
      } catch (err) {
        console.error("Error creating cohort:", err);
        setError(err instanceof Error ? err.message : "Failed to create cohort");
        setIsLoading(false);
      }
    },
    [writeContract]
  );

  const resetState = useCallback(() => {
    setError(null);
    setIsSuccess(false);
  }, []);

  return {
    createCohort,
    isLoading: isLoading || isWritePending || isTransactionLoading,
    isSuccess,
    error,
    resetState,
  };
};