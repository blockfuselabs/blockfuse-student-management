"use client";
import { useCallback, useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS } from '@/lib/contract/address';
import ABI from "@/lib/contract/ABI.json";

export interface RegisterStudentParams {
  firstname: string;
  lastname: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  track: number;
  cohort: number;
  studentAddress: string;
}

export interface RegisterStudentState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  transactionHash?: string;
}

export enum Track {
  WEB3 = 0,
  WEB2 = 1,
}

export const useRegisterStudent = () => {
  const [state, setState] = useState<RegisterStudentState>({
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
    reset: resetWrite
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed,
    error: receiptError 
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Update state when transaction hash changes
  useEffect(() => {
    if (hash) {
      setState(prev => ({ ...prev, transactionHash: hash }));
    }
  }, [hash]);

  // Update state when transaction is confirmed
  useEffect(() => {
    if (isConfirmed) {
      setState(prev => ({ 
        ...prev, 
        isSuccess: true, 
        isLoading: false,
        error: null 
      }));
    }
  }, [isConfirmed]);

  useEffect(() => {
    const error = writeError || receiptError;
    if (error) {
      let userFriendlyMessage = "Registration failed. Please try again.";
      
      // Parse common error messages for better UX
      const errorMessage = error.message?.toLowerCase() || "";
      
      if (errorMessage.includes("user rejected")) {
        userFriendlyMessage = "Transaction was cancelled by user.";
      } else if (errorMessage.includes("insufficient funds")) {
        userFriendlyMessage = "Insufficient funds for transaction fees.";
      } else if (errorMessage.includes("already registered")) {
        userFriendlyMessage = "This student is already registered.";
      } else if (errorMessage.includes("invalid address")) {
        userFriendlyMessage = "Invalid wallet address provided.";
      } else if (errorMessage.includes("network")) {
        userFriendlyMessage = "Network error. Please check your connection.";
      }
      
      setState(prev => ({ 
        ...prev, 
        error: userFriendlyMessage, 
        isLoading: false,
        isSuccess: false 
      }));
    }
  }, [writeError, receiptError]);

 
  useEffect(() => {
    const isLoading = isWritePending || isConfirming;
    setState(prev => ({ ...prev, isLoading }));
  }, [isWritePending, isConfirming]);

  // Validation function
  const validateStudentData = (params: RegisterStudentParams) => {
    const errors: string[] = [];

    // Required field validation
    if (!params.firstname?.trim()) {
      errors.push("First name is required");
    }
    if (!params.lastname?.trim()) {
      errors.push("Last name is required");
    }
    if (!params.studentAddress?.trim()) {
      errors.push("Student address is required");
    }

    // Address validation (basic Ethereum address format)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (params.studentAddress && !addressRegex.test(params.studentAddress)) {
      errors.push("Invalid Ethereum address format");
    }

    // Social media URL validation (optional but should be valid if provided)
    const urlRegex = /^https?:\/\/.+/;

    if (params.twitter && !urlRegex.test(params.twitter) && !params.twitter.startsWith('@')) {
      errors.push("Twitter should be a valid URL or handle starting with @");
    }

    if (params.linkedin && !urlRegex.test(params.linkedin)) {
      errors.push("LinkedIn should be a valid URL");
    }

    if (params.github && !urlRegex.test(params.github) && !params.github.includes('github.com')) {
      errors.push("GitHub should be a valid URL or username");
    }

    // Track validation
    if (params.track < 0 || params.track > 7) {
      errors.push("Invalid track selected");
    }

    // Cohort validation
    if (params.cohort < 0 || params.cohort > 255) {
      errors.push("Invalid cohort number (must be 0-255)");
    }

    if (errors.length > 0) {
      throw new Error(errors.join(", "));
    }
  };

  // Format social media inputs
  const formatSocialInputs = (params: RegisterStudentParams) => {
    let { twitter, linkedin, github } = params;

    // Format Twitter handle
    if (twitter && twitter.startsWith('@')) {
      twitter = `https://twitter.com/${twitter.slice(1)}`;
    }

    // Format GitHub username
    if (github && !github.startsWith('http') && !github.includes('github.com')) {
      github = `https://github.com/${github}`;
    }

    return { ...params, twitter, linkedin, github };
  };

  const registerStudent = useCallback(
    async (params: RegisterStudentParams) => {
      try {
        // Reset previous state
        setState(prev => ({ 
          ...prev, 
          error: null, 
          isSuccess: false, 
          isLoading: true 
        }));

        validateStudentData(params);

        // Format social media inputs
        const formattedParams = formatSocialInputs(params);

        // Prepare contract arguments
        const args = [
          formattedParams.firstname.trim(),
          formattedParams.lastname.trim(),
          formattedParams.twitter || "",
          formattedParams.linkedin || "",
          formattedParams.github || "",
          formattedParams.track,
          formattedParams.cohort,
          formattedParams.studentAddress as `0x${string}`,
        ];

        // Write to contract
        writeContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: ABI.abi,
          functionName: "registerStudent",
          args,
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Failed to register student";
        setState(prev => ({ 
          ...prev, 
          error: errorMessage, 
          isLoading: false,
          isSuccess: false 
        }));
        console.error("Error registering student:", error);
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
    registerStudent,
    reset,
    isLoading: state.isLoading,
    isSuccess: state.isSuccess,
    error: state.error,
    transactionHash: state.transactionHash,
    isPending: isWritePending,
    isConfirming,
    isConfirmed,
  };
};

export const getTrackName = (track: Track): string => {
  const trackNames = {
    [Track.WEB3]: "WEB3",
    [Track.WEB2]: "WEB2",
   
  };
  return trackNames[track] || "Unknown";
};

export const getTrackOptions = () => {
  return Object.values(Track)
    .filter(value => typeof value === 'number')
    .map(value => ({
      value: value as Track,
      label: getTrackName(value as Track),
    }));
};