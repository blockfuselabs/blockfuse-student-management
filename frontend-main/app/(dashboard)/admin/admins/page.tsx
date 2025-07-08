"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/shared/Table";
import { AddAdminModal } from "@/components/modals/AddAdminModal";
import { ReplaceAdminWalletModal } from "@/components/modals/ReplaceAdminWalletModal";
import { Admin, adminColumns } from "@/components/tables/StudentColumns";
import { useGetAdmins } from "@/lib/hooks/useGetAdmins";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useReadContract } from "wagmi";
import AdminUsernameFacetAbi from "@/lib/contract/AdminUsernameFacet.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import { useUserRole } from "@/lib/hooks/useUserRole";
import { useRouter } from "next/navigation";
import { useIsMounted } from "@/lib/hooks/useIsMounted";

// const statusTabs = [
//   { label: "All", value: "all" },
//   { label: "Active", value: "active" },
//   { label: "Inactive", value: "inactive" },
// ];

const AdminsPage = () => {
  const [addAdminModalOpen, setAddAdminModalOpen] = useState(false);
  // const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // State for replace wallet modal
  const [replaceWalletModalOpen, setReplaceWalletModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);

  // Access control
  const { isSuperAdmin, isLoading: roleLoading } = useUserRole();
  const router = useRouter();
  const isMounted = useIsMounted();

  // Fetch admins from blockchain
  const {
    admins: blockchainAdmins,
    isLoading,
    error,
    refetch,
  } = useGetAdmins(refreshKey);

  // Fetch usernames for admins - add refreshKey to force refetch when needed
  const { data: adminsWithUsernames, refetch: refetchUsernames } =
    useReadContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: AdminUsernameFacetAbi.abi,
      functionName: "getAllAdminsWithUsernames",
      query: {
        enabled: isSuperAdmin, // Only fetch if user is super admin
        staleTime: 0, // Always consider data stale to allow refetching
      },
    });

  // Redirect non-super admins
  useEffect(() => {
    if (isMounted && !roleLoading && !isSuperAdmin) {
      router.push("/admin");
    }
  }, [isMounted, roleLoading, isSuperAdmin, router]);

  // Auto-refetch usernames when refreshKey changes
  useEffect(() => {
    if (isSuperAdmin && refetchUsernames) {
      refetchUsernames();
    }
  }, [refreshKey, isSuperAdmin, refetchUsernames]);

  // Refresh function
  const handleRefresh = useCallback(async () => {
    console.log("Refreshing admins data...");
    setRefreshKey((prev) => prev + 1);

    // Also trigger manual refetch for admins
    if (refetch) {
      await refetch();
    }

    // Also trigger manual refetch for usernames
    if (refetchUsernames) {
      await refetchUsernames();
    }
  }, [refetch, refetchUsernames]);

  // Handle admin added - enhanced with toast notification
  const handleAdminAdded = useCallback(async () => {
    console.log("Admin added callback triggered");
    toast.success("Admin added successfully!");

    // Small delay to ensure blockchain state is updated
    setTimeout(async () => {
      // Refresh the data
      await handleRefresh();
    }, 1000);
  }, [handleRefresh]);

  // Handle admin removed
  const handleAdminRemoved = useCallback(async () => {
    console.log("Admin removed callback triggered");
    toast.success("Admin removed successfully!");

    // Small delay to ensure blockchain state is updated
    setTimeout(async () => {
      // Refresh the data
      await handleRefresh();
    }, 1000);
  }, [handleRefresh]);

  // Handle admin wallet replaced
  const handleAdminWalletReplaced = useCallback(async () => {
    console.log("Admin wallet replaced callback triggered");

    // Small delay to ensure blockchain state is updated
    setTimeout(async () => {
      // Refresh the data
      await handleRefresh();
    }, 1000);
  }, [handleRefresh]);

  const handleReplaceWallet = (admin: Admin) => {
    setSelectedAdmin(admin);
    setReplaceWalletModalOpen(true);
  };

  // Show loading while checking permissions
  if (!isMounted || roleLoading) {
    return (
      <div className="p-6 h-screen bg-white rounded-xl">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
            <p className="text-gray-600">Checking permissions...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied for non-super admins
  if (!isSuperAdmin) {
    return (
      <div className="p-6 h-screen bg-white rounded-xl">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              Only super admins can access the admins management section.
            </p>
            <Button onClick={() => router.push("/admin")} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log(blockchainAdmins);

  // Merge usernames into admins
  const adminsData: Admin[] = blockchainAdmins.map((admin, index) => {
    let username = undefined;
    if (
      adminsWithUsernames &&
      Array.isArray(adminsWithUsernames) &&
      adminsWithUsernames.length >= 2 &&
      Array.isArray(adminsWithUsernames[0]) &&
      Array.isArray(adminsWithUsernames[1])
    ) {
      const addresses = adminsWithUsernames[0] as string[];
      const usernames = adminsWithUsernames[1] as string[];
      const addrIndex = addresses.findIndex(
        (addr) => addr.toLowerCase() === admin.address.toLowerCase()
      );
      if (addrIndex !== -1) {
        username = usernames[addrIndex];
      }
    }
    return {
      id: index.toString(),
      address: admin.address,
      isActive: admin.isActive,
      username,
    };
  });

  const filteredAdmins = adminsData.filter((admin) => {
    const matchesSearch = admin.address
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (error) {
    return (
      <div className="p-6 h-screen bg-white rounded-xl">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Admins
            </h2>
            <p className="text-gray-600">{error}</p>
            <Button onClick={handleRefresh} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-screen bg-white rounded-xl">
      <div className="flex w-full justify-between items-center">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-semibold text-gray-900">
              Admins Management
            </h1>
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 border border-purple-300 rounded-full">
              Super Admin Only
            </span>
          </div>
          <p className="text-gray-400 mt-1">
            Add, organize, and manage admins by status.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="lg"
            variant="outline"
            className="flex text-base h-[44px] w-[44px] gap-1 items-center"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            size="lg"
            className="flex text-base h-[44px] w-[130px] gap-1 items-center"
            onClick={() => setAddAdminModalOpen(true)}
          >
            Add new
          </Button>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="mt-7 mb-2 w-full gap-2">
        {/* <div className="flex gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none
                ${
                  selectedTab === tab.value
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
              onClick={() => setSelectedTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div> */}
        <input
          type="text"
          placeholder="Search by wallet address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ml-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-0 text-sm w-64 bg-gray-50"
        />
      </div>

      <div className="mt-2 w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
              <p className="text-gray-600">Loading admins...</p>
            </div>
          </div>
        ) : (
          <Table
            data={filteredAdmins}
            columns={adminColumns(handleAdminRemoved, handleReplaceWallet)}
            title=""
            searchable={false}
            exportable={false}
          />
        )}
      </div>

      <AddAdminModal
        isOpen={addAdminModalOpen}
        setIsOpen={setAddAdminModalOpen}
        onAdminAdded={handleAdminAdded}
      />

      <ReplaceAdminWalletModal
        open={replaceWalletModalOpen}
        onClose={() => setReplaceWalletModalOpen(false)}
        admin={selectedAdmin}
        onSuccess={handleAdminWalletReplaced}
      />
    </div>
  );
};

export default AdminsPage;
