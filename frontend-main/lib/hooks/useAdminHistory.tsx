"use client";

import { useState, useEffect, useCallback } from "react";
import { useReadContract, useWatchContractEvent } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import AdminFacetABI from "@/lib/contract/AdminFacet.json";
import AdminUsernameFacetAbi from "@/lib/contract/AdminUsernameFacet.json";

export interface AdminData {
  address: string;
  isActive: boolean;
  username?: string;
}

export interface AdminHistoryState {
  allAdmins: AdminData[];
  activeAdmins: AdminData[];
  inactiveAdmins: AdminData[];
  isLoading: boolean;
  error: string | null;
}

export const useAdminHistory = (refreshKey: number = 0) => {
  const [state, setState] = useState<AdminHistoryState>({
    allAdmins: [],
    activeAdmins: [],
    inactiveAdmins: [],
    isLoading: true,
    error: null,
  });

  // Get current active admins
  const {
    data: adminAddresses,
    isLoading: adminsLoading,
    error: adminsError,
    refetch: refetchAdmins,
  } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: AdminFacetABI.abi,
    functionName: "getAllAdmins",
    query: {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      staleTime: 0,
      gcTime: 0,
    },
  });

  // Get usernames for all admins
  const {
    data: adminsWithUsernames,
    isLoading: usernamesLoading,
    error: usernamesError,
    refetch: refetchUsernames,
  } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: AdminUsernameFacetAbi.abi,
    functionName: "getAllAdminsWithUsernames",
    query: {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      staleTime: 0,
      gcTime: 0,
    },
  });

  // Watch for admin added events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: AdminFacetABI.abi,
    eventName: "AdminAdded",
    onLogs: (logs) => {
      console.log("Admin added event:", logs);
      // Refresh data when admin is added
      setTimeout(() => {
        refetchAdmins();
        refetchUsernames();
      }, 1000);
    },
  });

  // Watch for admin removed events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: AdminFacetABI.abi,
    eventName: "AdminRemoved",
    onLogs: (logs) => {
      console.log("Admin removed event:", logs);
      // Refresh data when admin is removed
      setTimeout(() => {
        refetchAdmins();
        refetchUsernames();
      }, 1000);
    },
  });

  // Watch for admin replaced events
  useWatchContractEvent({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: AdminFacetABI.abi,
    eventName: "AdminReplaced",
    onLogs: (logs) => {
      console.log("Admin replaced event:", logs);
      // Refresh data when admin is replaced
      setTimeout(() => {
        refetchAdmins();
        refetchUsernames();
      }, 1000);
    },
  });

  // Process admin data
  useEffect(() => {
    console.log("=== useAdminHistory Debug ===");
    console.log("Admin Addresses:", adminAddresses);
    console.log("Admins with Usernames:", adminsWithUsernames);

    if (adminsLoading || usernamesLoading) {
      console.log("Loading admin data...");
      setState((prev) => ({ ...prev, isLoading: true }));
      return;
    }

    if (adminsError || usernamesError) {
      console.error("Error getting admin data:", adminsError || usernamesError);
      const errorMessage =
        (adminsError || usernamesError)?.message || "Unknown error";
      setState({
        allAdmins: [],
        activeAdmins: [],
        inactiveAdmins: [],
        isLoading: false,
        error: `Failed to get admin data: ${errorMessage}`,
      });
      return;
    }

    const currentActiveAdmins = new Set<string>();
    const allAdmins: AdminData[] = [];

    // Process current active admins
    if (adminAddresses && Array.isArray(adminAddresses)) {
      adminAddresses.forEach((address: string) => {
        if (
          address &&
          address !== "0x0000000000000000000000000000000000000000"
        ) {
          currentActiveAdmins.add(address.toLowerCase());
          allAdmins.push({
            address: address,
            isActive: true,
          });
          console.log("Active admin found:", address);
        }
      });
    }

    // Process usernames
    if (
      adminsWithUsernames &&
      Array.isArray(adminsWithUsernames) &&
      adminsWithUsernames.length >= 2 &&
      Array.isArray(adminsWithUsernames[0]) &&
      Array.isArray(adminsWithUsernames[1])
    ) {
      const addresses = adminsWithUsernames[0] as string[];
      const usernames = adminsWithUsernames[1] as string[];

      // Update usernames for existing admins
      allAdmins.forEach((admin) => {
        const addrIndex = addresses.findIndex(
          (addr) => addr.toLowerCase() === admin.address.toLowerCase()
        );
        if (addrIndex !== -1) {
          admin.username = usernames[addrIndex];
        }
      });
    }

    // Separate active and inactive admins
    const activeAdmins = allAdmins.filter((admin) => admin.isActive);
    const inactiveAdmins = allAdmins.filter((admin) => !admin.isActive);

    console.log("Final admin lists:", {
      allAdmins,
      activeAdmins,
      inactiveAdmins,
    });

    setState({
      allAdmins,
      activeAdmins,
      inactiveAdmins,
      isLoading: false,
      error: null,
    });
  }, [
    refreshKey,
    adminAddresses,
    adminsWithUsernames,
    adminsLoading,
    usernamesLoading,
    adminsError,
    usernamesError,
  ]);

  // Trigger refetch when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      console.log(
        "Refetching admin history due to refreshKey change:",
        refreshKey
      );
      refetchAdmins();
      refetchUsernames();
    }
  }, [refreshKey, refetchAdmins, refetchUsernames]);

  const manualRefetch = useCallback(async () => {
    console.log("Manual refetch triggered");
    await Promise.all([refetchAdmins(), refetchUsernames()]);
  }, [refetchAdmins, refetchUsernames]);

  return { ...state, refetch: manualRefetch };
};
