"use client";

import { useState, useEffect, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import AdminUsernameFacetABI from "@/lib/contract/AdminUsernameFacet.json";

export interface SetAdminUsernameParams {
  adminAddress: string;
  username: string;
}

export const useSetAdminUsername = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    data: hash,
    writeContract,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isTransactionLoading, isSuccess: isTransactionSuccess } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Reset error when write error changes
  useEffect(() => {
    if (writeError) {
      setError(writeError.message);
    }
  }, [writeError]);

  // Handle transaction success
  useEffect(() => {
    if (isTransactionSuccess) {
      setIsSuccess(true);
      setIsLoading(false);
      setError(null);
    }
  }, [isTransactionSuccess]);

  const setAdminUsername = useCallback(
    async (params: SetAdminUsernameParams) => {
      try {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        console.log("Setting admin username with params:", params);

        // Validate admin address
        const addressRegex = /^0x[a-fA-F0-9]{40}$/;
        if (!addressRegex.test(params.adminAddress)) {
          throw new Error("Invalid admin address format");
        }

        // Validate username
        if (!params.username.trim()) {
          throw new Error("Username cannot be empty");
        }

        // Call the contract function
        writeContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: AdminUsernameFacetABI.abi,
          functionName: "setAdminUsername",
          args: [params.adminAddress, params.username],
        });
      } catch (err) {
        console.error("Error setting admin username:", err);
        setError(
          err instanceof Error ? err.message : "Failed to set admin username"
        );
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
    setAdminUsername,
    isLoading: isLoading || isWritePending || isTransactionLoading,
    isSuccess,
    error,
    resetError: () => setError(null),
    resetState,
  };
};
