"use client";

import { useState, useEffect, useCallback } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import AdminFacetABI from "@/lib/contract/AdminFacet.json";
import { useSetAdminUsername } from "./useSetAdminUsernameTx";

export interface ReplaceAdminParams {
  oldAdmin: string;
  newAdmin: string;
  oldUsername?: string; // Optional: if provided, will transfer username to new admin
}

export const useReplaceAdmin = () => {
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

  const { setAdminUsername } = useSetAdminUsername();

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

  const replaceAdmin = useCallback(
    async (params: ReplaceAdminParams) => {
      try {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        console.log("Replacing admin with params:", params);

        // Validate admin addresses
        const addressRegex = /^0x[a-fA-F0-9]{40}$/;
        if (!addressRegex.test(params.oldAdmin)) {
          throw new Error("Invalid old admin address format");
        }
        if (!addressRegex.test(params.newAdmin)) {
          throw new Error("Invalid new admin address format");
        }

        // Call the contract function to replace admin
        writeContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: AdminFacetABI.abi,
          functionName: "replaceAdmin",
          args: [params.oldAdmin, params.newAdmin],
        });

        // If username is provided, transfer it to the new admin after a delay
        if (params.oldUsername && params.oldUsername.trim()) {
          setTimeout(async () => {
            try {
              console.log(
                "Transferring username to new admin:",
                params.oldUsername
              );
              await setAdminUsername({
                adminAddress: params.newAdmin,
                username: params.oldUsername!,
              });
              console.log("Username transferred successfully");
            } catch (err) {
              console.error("Error transferring username:", err);
              // Don't fail the whole operation if username transfer fails
            }
          }, 2000); // Wait 2 seconds for the replace transaction to be mined
        }
      } catch (err) {
        console.error("Error replacing admin:", err);
        setError(
          err instanceof Error ? err.message : "Failed to replace admin"
        );
        setIsLoading(false);
      }
    },
    [writeContract, setAdminUsername]
  );

  const resetState = useCallback(() => {
    setError(null);
    setIsSuccess(false);
  }, []);

  return {
    replaceAdmin,
    isLoading: isLoading || isWritePending || isTransactionLoading,
    isSuccess,
    error,
    resetError: () => setError(null),
    resetState,
  };
};
