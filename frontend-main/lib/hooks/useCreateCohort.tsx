"use client";
import { useCallback, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import ABI from "@/lib/contract/ABI.json";

export const useCreateCohort = () => {
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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

        if (!startDate || !endDate || startDate >= endDate) {
          throw new Error(
            "Invalid date range: startDate must be before endDate"
          );
        }

        const startTimestamp: number = Math.floor(
          new Date(startDate).getTime() / 1000
        );
        const endTimestamp: number = Math.floor(
          new Date(endDate).getTime() / 1000
        );
        console.log(startTimestamp);
        console.log(endTimestamp);
        await writeContract({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: "createCohort",
          args: [startTimestamp, endTimestamp],
        });

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
    [writeContract]
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
