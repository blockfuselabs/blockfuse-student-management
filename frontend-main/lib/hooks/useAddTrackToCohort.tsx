"use client";

import { useCallback, useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS } from '@/lib/contract/address';
import CohortFacetABI from "@/lib/contract/CohortFacet.json";

export const useAddTrackToCohort = () => {
 const [error, setError] = useState<string | null>(null);
 const [isSuccess, setIsSuccess] = useState(false);

 const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

 const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
  hash,
 });

 interface AddTrackToCohortParams {
  cohortId: number;
  track: number; // 0 for web2, 1 for web3
 }

 type AddTrackToCohortFunction = (cohortId: number, track: number) => Promise<void>;

 const addTrackToCohort: AddTrackToCohortFunction = useCallback(
  async (cohortId, track) => {
   try {
    setError(null);
    setIsSuccess(false);

    // Validate inputs
    if (cohortId <= 0) {
     throw new Error("Invalid cohort ID: must be greater than 0");
    }

    if (track !== 0 && track !== 1) {
     throw new Error("Invalid track: must be 0 (web2) or 1 (web3)");
    }

    await writeContract({
     address: CONTRACT_ADDRESS,
     abi: CohortFacetABI.abi,
     functionName: "addTrackToCohort",
     args: [cohortId, track],
    });

    if (hash) {
     setIsSuccess(true);
    }
   } catch (err: unknown) {
    if (err instanceof Error) {
     setError(err.message);
     console.error("Error adding track to cohort:", err);
    } else {
     setError("Failed to add track to cohort");
     console.error("Error adding track to cohort:", err);
    }
   }
  },
  [writeContract]
 );

 return {
  addTrackToCohort,
  isPending,
  isConfirming,
  isSuccess: isSuccess && isConfirmed,
  error: error || writeError?.message,
  transactionHash: hash,
 };
}; 