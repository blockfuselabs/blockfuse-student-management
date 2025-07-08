import {
  useWriteContract,
  useReadContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import AdminUsernameFacetAbi from "@/lib/contract/AdminUsernameFacet.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import { useState, useEffect, useCallback } from "react";

export function useAddAdminWithUsername() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    writeContract,
    data: hash,
    isError: isWriteError,
    error: writeError,
    isPending: isWritePending,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isConfirmError,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed) {
      console.log("Admin with username added successfully!");
      setIsSuccess(true);
      setIsLoading(false);
    }
  }, [isConfirmed]);

  // Handle transaction errors
  useEffect(() => {
    if (isWriteError || isConfirmError) {
      const errorMessage =
        writeError?.message || confirmError?.message || "Transaction failed";
      console.log("Transaction error:", errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    }
  }, [isWriteError, isConfirmError, writeError, confirmError]);

  // Reset success state when starting new transaction
  useEffect(() => {
    if (isWritePending) {
      setIsSuccess(false);
    }
  }, [isWritePending]);

  const resetState = useCallback(() => {
    setError(null);
    setIsSuccess(false);
    if (typeof reset === "function") reset();
  }, [reset]);

  return {
    writeContract,
    isLoading: isLoading || isWritePending || isConfirming,
    isSuccess,
    isError: isWriteError || isConfirmError,
    error,
    reset: resetState,
    data: hash,
  };
}

export function useGetAdminUsername(adminAddress: string | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: AdminUsernameFacetAbi.abi,
    functionName: "getAdminUsername",
    args: adminAddress ? [adminAddress] : undefined,
  });
}
