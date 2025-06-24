"use client";
import { useCallback, useState } from "react";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import CohortFacetABI from "@/lib/contract/CohortFacet.json";

export const useCreateCohort = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const publicClient = usePublicClient();

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

  interface CreateCohortParams {
    startDate: string | number | Date;
    endDate: string | number | Date;
  }

  type CreateCohortFunction = (
    startDate: CreateCohortParams["startDate"],
    endDate: CreateCohortParams["endDate"]
  ) => Promise<void>;

  const createCohort: CreateCohortFunction = useCallback(
    async (startDate, endDate) => {
      try {
        setError(null);
        setIsSuccess(false);
        setCurrentStep("");

        if (!startDate || !endDate || startDate >= endDate) {
          throw new Error(
            "Invalid date range: startDate must be before endDate"
          );
        }

        if (!publicClient) {
          throw new Error("Public client not available");
        }

        const startTimestamp: number = Math.floor(
          new Date(startDate).getTime() / 1000
        );
        const endTimestamp: number = Math.floor(
          new Date(endDate).getTime() / 1000
        );

        // Create the cohort only
        setCurrentStep("Creating cohort...");
        console.log("Creating cohort with dates:", {
          startTimestamp,
          endTimestamp,
        });

        await writeContract({
          address: CONTRACT_ADDRESS,
          abi: CohortFacetABI.abi,
          functionName: "createCohort",
          args: [startTimestamp, endTimestamp],
        });

        setCurrentStep("Cohort created successfully!");
        if (hash) {
          setIsSuccess(true);
        }
      } catch (err: unknown) {
        setCurrentStep("");
        if (err instanceof Error) {
          setError(err.message);
          console.error("Error creating cohort:", err);
        } else {
          setError("Failed to create cohort");
          console.error("Error creating cohort:", err);
        }
      }
    },
    [writeContract, publicClient, hash]
  );

  return {
    createCohort,
    isPending,
    isConfirming,
    isSuccess: isSuccess && isConfirmed,
    error: error || writeError?.message,
    transactionHash: hash,
    currentStep,
  };
};
