"use client";

import { useState, useEffect, useCallback } from "react";
import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import AdminFacetABI from "@/lib/contract/AdminFacet.json";

export interface AdminData {
  address: string;
  isActive: boolean;
}

export interface GetAdminsState {
  admins: AdminData[];
  isLoading: boolean;
  error: string | null;
}

export const useGetAdmins = (refreshKey: number = 0) => {
  const [state, setState] = useState<GetAdminsState>({
    admins: [],
    isLoading: true,
    error: null,
  });

  // Get all admins using the new getAllAdmins function
  const {
    data: adminAddresses,
    isLoading: adminsLoading,
    error: adminsError,
    refetch, // Add this to get the refetch function
  } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: AdminFacetABI.abi,
    functionName: "getAllAdmins",
    // Add these options to ensure fresh data
    query: {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      staleTime: 0, // Always consider data stale
      gcTime: 0, // Don't cache the data
    }
  });

  useEffect(() => {
    console.log("=== useGetAdmins Debug ===");
    console.log("Admin Addresses:", adminAddresses);

    if (adminsLoading) {
      console.log("Loading admin data...");
      setState((prev) => ({ ...prev, isLoading: true }));
      return;
    }

    if (adminsError) {
      console.error("Error getting admin data:", adminsError);
      const errorMessage = adminsError?.message || "Unknown error";
      setState({
        admins: [],
        isLoading: false,
        error: `Failed to get admin data: ${errorMessage}`,
      });
      return;
    }

    const admins: AdminData[] = [];

    // Process all admin addresses from the contract
    if (adminAddresses && Array.isArray(adminAddresses)) {
      adminAddresses.forEach((address: string) => {
        if (
          address &&
          address !== "0x0000000000000000000000000000000000000000"
        ) {
          admins.push({
            address: address,
            isActive: true,
          });
          console.log("Admin found:", address);
        }
      });
    }

    console.log("Final admins list:", admins);

    setState({
      admins,
      isLoading: false,
      error: null,
    });
  }, [refreshKey, adminAddresses, adminsLoading, adminsError]);

  // Trigger refetch when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      console.log("Refetching admins due to refreshKey change:", refreshKey);
      refetch();
    }
  }, [refreshKey, refetch]);

  const manualRefetch = useCallback(async () => {
    console.log("Manual refetch triggered");
    await refetch();
  }, [refetch]);

  return { ...state, refetch: manualRefetch };
};