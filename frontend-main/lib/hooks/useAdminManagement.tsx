"use client";
import { useCallback, useState } from "react";
import { useAddAdmin } from "./useAddAdmin";
import { useRemoveAdmin } from "./useRemoveAdmin";
import { useGetAdmins } from "./useGetAdmins";

export interface AdminManagementState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  transactionHash?: string;
}

export const useAdminManagement = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    admins,
    isLoading: isLoadingAdmins,
    error: adminsError,
  } = useGetAdmins(refreshKey);
  const {
    addAdmin,
    isLoading: isAdding,
    isSuccess: isAddSuccess,
    error: addError,
  } = useAddAdmin();
  const {
    removeAdmin,
    isLoading: isRemoving,
    isSuccess: isRemoveSuccess,
    error: removeError,

  } = useRemoveAdmin();

  // Combined state
  const isLoading = isLoadingAdmins || isAdding || isRemoving;
  const isSuccess = isAddSuccess || isRemoveSuccess;
  const error = adminsError || addError || removeError;

  // Activate admin (add them back)
  const activateAdmin = useCallback(
    async (adminAddress: string) => {
      try {
        await addAdmin({ adminAddress });
        // Refresh the admins list after successful activation
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Error activating admin:", error);
      }
    },
    [addAdmin]
  );

  // Deactivate admin (remove them)
  const deactivateAdmin = useCallback(
    async (adminAddress: string) => {
      try {
        await removeAdmin({ adminAddress });
        // Refresh the admins list after successful deactivation
        setRefreshKey((prev) => prev + 1);
      } catch (error) {
        console.error("Error deactivating admin:", error);
      }
    },
    [removeAdmin]
  );

  // Reset all states
  // const reset = useCallback(() => {
  //   resetAdd();
  //   resetRemove();
  // }, [resetAdd, resetRemove]);

  // Get active admins (those currently in the list)
  const activeAdmins = admins.filter((admin) => admin.isActive);


  const inactiveAdmins: typeof admins = []; // This would need to be implemented based on your requirements

  return {
    // State
    admins,
    activeAdmins,
    inactiveAdmins,
    isLoading,
    isSuccess,
    error,

    // Actions
    activateAdmin,
    deactivateAdmin,

    // Refresh
    refreshAdmins: () => setRefreshKey((prev) => prev + 1),
  };
};
