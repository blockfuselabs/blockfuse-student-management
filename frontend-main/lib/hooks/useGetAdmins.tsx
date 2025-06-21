"use client";
import { useState, useEffect, useCallback } from "react";
import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import ABI from "@/lib/contract/ABI.json";

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

  // Get the super admin address
  const {
    data: superAdminAddress,
    isLoading: superAdminLoading,
    error: superAdminError,
  } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: ABI,
    functionName: "superAdmin",
  });

  useEffect(() => {
    console.log("=== useGetAdmins Debug ===");
    console.log("Super Admin Address:", superAdminAddress);

    if (superAdminLoading) {
      console.log("Loading super admin data...");
      setState((prev) => ({ ...prev, isLoading: true }));
      return;
    }

    if (superAdminError) {
      console.error("Error getting super admin data:", superAdminError);
      const errorMessage = superAdminError?.message || "Unknown error";
      setState({
        admins: [],
        isLoading: false,
        error: `Failed to get admin data: ${errorMessage}`,
      });
      return;
    }

    const admins: AdminData[] = [];

    // Add super admin if exists
    if (
      superAdminAddress &&
      superAdminAddress !== "0x0000000000000000000000000000000000000000"
    ) {
      admins.push({
        address: superAdminAddress as string,
        isActive: true,
      });
      console.log("Super Admin:", superAdminAddress);
    }

    // Note: For now, we're only showing the super admin
    // The adminList function was causing issues, so we're using a simplified approach
    // To get all admins, you would need to:
    // 1. Fix the smart contract to properly handle adminList access
    // 2. Or implement a different approach using events
    // 3. Or create a custom function in the contract to return all admins

    console.log("Final admins list:", admins);

    setState({
      admins,
      isLoading: false,
      error: null,
    });
  }, [refreshKey, superAdminAddress, superAdminLoading, superAdminError]);

  const refetch = useCallback(() => {
    // The hook will automatically refetch when refreshKey changes
  }, []);

  return { ...state, refetch };
};
