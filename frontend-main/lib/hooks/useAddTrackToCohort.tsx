"use client";

import { useCallback, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import CohortFacetABI from "@/lib/contract/CohortFacet.json";

export const useAddTrackToCohort = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  type AddTrackToCohortFunction = (
    cohortId: number,
    track: number
  ) => Promise<void>;

  const addTrackToCohort: AddTrackToCohortFunction = useCallback(
    async (cohortId, track) => {
      try {
        setError(null);
        setIsSuccess(false);
        setCurrentStep("");

        if (cohortId < 0) {
          throw new Error("Invalid cohort ID");
        }

        if (track < 0 || track > 1) {
          throw new Error("Invalid track. Must be 0 (web2) or 1 (web3)");
        }

        const trackName = track === 0 ? "web2" : "web3";
        setCurrentStep(`Adding ${trackName} track to cohort ${cohortId}...`);
        console.log(
          `Adding track ${track} (${trackName}) to cohort ${cohortId}`
        );

        await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CohortFacetABI.abi,
          functionName: "addTrackToCohort",
          args: [cohortId, track],
        });

        setCurrentStep("Track added successfully!");
        if (hash) {
          setIsSuccess(true);
        }
      } catch (err: unknown) {
        setCurrentStep("");
        if (err instanceof Error) {
          setError(err.message);
          console.error("Error adding track to cohort:", err);
        } else {
          setError("Failed to add track to cohort");
          console.error("Error adding track to cohort:", err);
        }
      }
    },
    [writeContract, hash]
  );

  return {
    addTrackToCohort,
    isPending,
    isConfirming,
    isSuccess: isSuccess && isConfirmed,
    error: error || writeError?.message,
    transactionHash: hash,
    currentStep,
  };
};
