"use client";
import { useCallback, useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import ABI from "@/lib/contract/ABI.json";

export interface AddAdminParams {
  adminAddress: string;
}

export interface AddAdminState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  transactionHash?: string;
}

export const useAddAdmin = () => {
  const [state, setState] = useState<AddAdminState>({
    isLoading: false,
    isSuccess: false,
    error: null,
    transactionHash: undefined,
  });

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Update state when transaction hash changes
  useEffect(() => {
    if (hash) {
      setState((prev) => ({ ...prev, transactionHash: hash }));
    }
  }, [hash]);

  // Update state when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      setState((prev) => ({
        ...prev,
        isSuccess: true,
        isLoading: false,
        error: null,
      }));
    }
  }, [isConfirmed]);

  useEffect(() => {
    const error = writeError || receiptError;
    if (error) {
      let userFriendlyMessage = "Failed to add admin. Please try again.";

      // Parse common error messages for better UX
      const errorMessage = error.message?.toLowerCase() || "";

      if (errorMessage.includes("user rejected")) {
        userFriendlyMessage = "Transaction was cancelled by user.";
      } else if (errorMessage.includes("insufficient funds")) {
        userFriendlyMessage = "Insufficient funds for transaction fees.";
      } else if (errorMessage.includes("unauthorized")) {
        userFriendlyMessage = "Only super admin can add new admins.";
      } else if (errorMessage.includes("invalid address")) {
        userFriendlyMessage = "Invalid wallet address provided.";
      } else if (errorMessage.includes("network")) {
        userFriendlyMessage = "Network error. Please check your connection.";
      }

      setState((prev) => ({
        ...prev,
        error: userFriendlyMessage,
        isLoading: false,
        isSuccess: false,
      }));
    }
  }, [writeError, receiptError]);

  useEffect(() => {
    const isLoading = isWritePending || isConfirming;
    setState((prev) => ({ ...prev, isLoading }));
  }, [isWritePending, isConfirming]);

  // Validation function
  const validateAdminData = (params: AddAdminParams) => {
    const errors: string[] = [];

    // Required field validation
    if (!params.adminAddress?.trim()) {
      errors.push("Admin address is required");
    }

    // Address validation (basic Ethereum address format)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (params.adminAddress && !addressRegex.test(params.adminAddress)) {
      errors.push("Invalid Ethereum address format");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }
  };

  const addAdmin = useCallback(
    async (params: AddAdminParams) => {
      try {
        // Reset previous state
        setState((prev) => ({
          ...prev,
          error: null,
          isSuccess: false,
          isLoading: true,
        }));

        validateAdminData(params);

        // Prepare contract arguments
        const args = [params.adminAddress.trim()];

        await writeContract({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: "addAdmin",
          args: args,
        });
      } catch (err: unknown) {
        if (err instanceof Error) {
          setState((prev) => ({
            ...prev,
            error: err.message,
            isLoading: false,
          }));
          console.error("Error adding admin:", err);
        } else {
          setState((prev) => ({
            ...prev,
            error: "Failed to add admin",
            isLoading: false,
          }));
          console.error("Error adding admin:", err);
        }
      }
    },
    [writeContract]
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isSuccess: false,
      error: null,
      transactionHash: undefined,
    });
    resetWrite();
  }, [resetWrite]);

  return {
    addAdmin,
    reset,
    ...state,
  };
};
