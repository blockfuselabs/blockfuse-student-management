"use client";

import { useCallback, useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import CohortFacetABI from "@/lib/contract/CohortFacet.json";

export const useAddTrackToCohort = () => {
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
      console.log("Track added successfully!");
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
        "Failed to add track";
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

  const addTrackToCohort = useCallback(
    async (cohortId: number, track: number) => {
      try {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        if (cohortId < 0) {
          throw new Error("Invalid cohort ID");
        }

        if (track < 0 || track > 1) {
          throw new Error("Invalid track. Must be 0 (web2) or 1 (web3)");
        }

        console.log(`Adding track ${track} to cohort ${cohortId}`);

        await writeContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CohortFacetABI.abi,
          functionName: "addTrackToCohort",
          args: [cohortId, track],
        });
      } catch (err) {
        console.error("Error adding track:", err);
        setError(err instanceof Error ? err.message : "Failed to add track");
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
    addTrackToCohort,
    isLoading: isLoading || isWritePending || isTransactionLoading,
    isSuccess,
    error,
    resetState,
  };
};