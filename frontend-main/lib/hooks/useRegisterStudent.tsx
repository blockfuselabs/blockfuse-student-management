/* eslint-disable prefer-const */
"use client";
import { useCallback, useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS } from '@/lib/contract/address';
import AdminFacetABI from "@/lib/contract/AdminFacet.json";
import { RegisterStudentParams, RegisterStudentState } from "../types";
import { Track } from "../types";

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
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: receiptError
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Handle transaction success
  useEffect(() => {
    if (isConfirmed) {
      setState(prev => ({
        ...prev,
        isSuccess: true,
        isLoading: false,
        error: null
      }));
      console.log("Student registered successfully!");
    }
  }, [isConfirmed]);

  // Handle errors from write or receipt
  useEffect(() => {
    const error = writeError || receiptError;
    if (error) {
      setState(prev => ({
        ...prev,
        error: error.message,
        isLoading: false,
        isSuccess: false
      }));
    }
  }, [writeError, receiptError]);

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
    if (!params.email?.trim()) {
      errors.push("Email is required");
    }

    // Address validation (basic Ethereum address format)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (params.studentAddress && !addressRegex.test(params.studentAddress)) {
      errors.push("Invalid Ethereum address format");
    }

    // Social media URL validation (optional but should be valid if provided)




    // Track validation - updated for new track structure
    if (params.track < 0 || params.track > 1) {
      errors.push("Invalid track selected (must be 0 for web2 or 1 for web3)");
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

        // Create username from firstname and lastname
        const username = `${formattedParams.firstname.toLowerCase()}_${formattedParams.lastname.toLowerCase()}`;

        // Prepare contract arguments for the new structure
        const studentDetails = {
          firstname: formattedParams.firstname.trim(),
          lastname: formattedParams.lastname.trim(),
          email: formattedParams.email.trim(),
          username: username,
          twitter: formattedParams.twitter || "",
          linkedin: formattedParams.linkedin || "",
          github: formattedParams.github || "",
          track: formattedParams.track,
          cohort: formattedParams.cohort,
          isActive: true,
          finalScore: 0,
          studentAddress: formattedParams.studentAddress as `0x${string}`,
        };

        console.log("Registering student with details:", studentDetails);

        // Write to contract using the new registerStudent function
        writeContract({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: AdminFacetABI.abi,
          functionName: "registerStudent",
          args: [studentDetails],
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

  return {
    registerStudent,
    isLoading: state.isLoading || isWritePending || isConfirming,
    isSuccess: state.isSuccess,
    error: state.error,
    resetError: () => setState(prev => ({ ...prev, error: null })),
  };
};

export const getTrackName = (track: Track): string => {
  const trackNames = {
    [Track.WEB2]: "Web2",
    [Track.WEB3]: "Web3",
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
