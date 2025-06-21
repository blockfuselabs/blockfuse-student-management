"use client";
import { useCallback, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { CONTRACT_ADDRESS } from '@/lib/contract/address';
import CohortFacetABI from "@/lib/contract/CohortFacet.json"

export const useCreateCohort = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const publicClient = usePublicClient();

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  interface CreateCohortParams {
    startDate: string | number | Date;
    endDate: string | number | Date;
    tracks?: number[];
  }

  type CreateCohortFunction = (startDate: CreateCohortParams['startDate'], endDate: CreateCohortParams['endDate'], tracks?: number[]) => Promise<void>;

  const createCohort: CreateCohortFunction = useCallback(
    async (startDate, endDate, tracks = [0, 1]) => {
      try {
        setError(null);
        setIsSuccess(false);

        if (!startDate || !endDate || startDate >= endDate) {
          throw new Error("Invalid date range: startDate must be before endDate");
        }

        const startTimestamp: number = Math.floor(new Date(startDate).getTime() / 1000);
        const endTimestamp: number = Math.floor(new Date(endDate).getTime() / 1000);

        // Create the cohort
        await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CohortFacetABI.abi,
          functionName: "createCohort",
          args: [startTimestamp, endTimestamp],
        });

        // Wait a moment for the transaction to be mined (optional: poll for confirmation)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Get the latest cohort count (assume the new cohort is the latest)
        const cohortCount = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CohortFacetABI.abi,
          functionName: "getCohortCount",
        });
        const newCohortId = Number(cohortCount);

        // Add each selected track to the new cohort
        for (const track of tracks) {
          await writeContract({
            address: CONTRACT_ADDRESS,
            abi: CohortFacetABI.abi,
            functionName: "addTrackToCohort",
            args: [newCohortId, track],
          });
        }

        if (hash) {
          setIsSuccess(true);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
          console.error("Error creating cohort:", err);
        } else {
          setError("Failed to create cohort");
          console.error("Error creating cohort:", err);
        }
      }
    },
    [writeContract, publicClient]
  );

  return {
    createCohort,
    isPending,
    isConfirming,
    isSuccess: isSuccess && isConfirmed,
    error: error || writeError?.message,
    transactionHash: hash,
  };
};