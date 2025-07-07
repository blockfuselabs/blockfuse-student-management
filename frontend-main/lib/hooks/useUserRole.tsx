"use client";
import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import DiamondABI from "@/lib/contract/DiamondABI.json";
import { useIsMounted } from "./useIsMounted";

// Types based on your ABI - updated to match contract structure
interface StudentDetails {
  firstname: string;
  lastname: string;
  username: string;
  twitter: string;
  linkedin: string;
  github: string;
  track: number; // This is the Track enum (0 for web2, 1 for web3)
  cohort: number;
  isActive: boolean;
  finalScore: bigint;
  studentAddress: string;
}

interface UserRoleData {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isStudent: boolean;
  userType: "admin" | "super_admin" | "student" | "unknown";
  studentData?: StudentDetails | null;
  isLoading: boolean;
  error?: string;
}

export const useUserRole = (): UserRoleData => {
  const isMounted = useIsMounted();
  const { address: userAddress, isConnected } = useAccount();
  const [userRole, setUserRole] = useState<UserRoleData>({
    isAdmin: false,
    isSuperAdmin: false,
    isStudent: false,
    userType: "unknown",
    isLoading: true, // Start with loading true
  });
  const [hasStartedLoading, setHasStartedLoading] = useState(false);

  // Check if user is admin using getAllAdmins function
  const {
    data: adminAddresses,
    isLoading: isAdminLoading,
    error: adminError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: DiamondABI.abi,
    functionName: "getAllAdmins",
    enabled: isConnected && !!userAddress, // Only run when connected
  });

  // Get super admin address
  const {
    data: superAdminAddress,
    isLoading: isSuperAdminLoading,
    error: superAdminError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: DiamondABI.abi,
    functionName: "getSuperAdmin",
    enabled: isConnected && !!userAddress, // Only run when connected
  });

  // Get student data using StudentFacet - only call if we have a user address
  const {
    data: studentData,
    isLoading: isStudentLoading,
    error: studentError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: DiamondABI.abi,
    functionName: "getStudent",
    args: userAddress ? [userAddress] : undefined,
    enabled: isConnected && !!userAddress, // Only run when connected
  });

  useEffect(() => {
    // Don't process anything until mounted to prevent hydration issues
    if (!isMounted) {
      return;
    }

    console.log("=== useUserRole Debug ===");
    console.log("Is Mounted:", isMounted);
    console.log("User Address:", userAddress);
    console.log("Is Connected:", isConnected);
    console.log("Has Started Loading:", hasStartedLoading);
    console.log("Contract Address:", CONTRACT_ADDRESS);
    console.log("Admin Addresses:", adminAddresses);
    console.log("Super Admin Address:", superAdminAddress);
    console.log("Student Data:", studentData);
    console.log("Admin Error:", adminError);
    console.log("Super Admin Error:", superAdminError);
    console.log("Student Error:", studentError);
    console.log("Loading States:", {
      isAdminLoading,
      isSuperAdminLoading,
      isStudentLoading,
    });

    // If not connected, set to default state with loading false
    if (!userAddress || !isConnected) {
      console.log("User not connected, setting default state");
      setUserRole({
        isAdmin: false,
        isSuperAdmin: false,
        isStudent: false,
        userType: "unknown",
        isLoading: false,
      });
      setHasStartedLoading(false);
      return;
    }

    // Mark that we've started the loading process
    if (!hasStartedLoading) {
      console.log("Starting loading process...");
      setHasStartedLoading(true);
      setUserRole(prev => ({ ...prev, isLoading: true }));
      return;
    }

    // Check if any contract calls are still loading
    const isAnyLoading = isAdminLoading || isSuperAdminLoading || isStudentLoading;

    if (isAnyLoading) {
      console.log("Still loading contract data...");
      setUserRole((prev) => ({ ...prev, isLoading: true }));
      return;
    }

    // All contract calls are complete, now determine roles
    console.log("All contract calls complete, determining roles...");

    // Check if user is super admin
    const isSuperAdmin =
      typeof superAdminAddress === "string" &&
      superAdminAddress.toLowerCase() === userAddress.toLowerCase();
    console.log("Is Super Admin:", isSuperAdmin);

    // Check if user is regular admin by checking if their address is in the admin list
    const isRegularAdmin =
      Array.isArray(adminAddresses) &&
      adminAddresses.some(
        (adminAddr: string) =>
          adminAddr.toLowerCase() === userAddress.toLowerCase()
      );
    console.log("Is Regular Admin:", isRegularAdmin);

    // Check if user is admin (super admin or regular admin)
    const isAdmin = isSuperAdmin || isRegularAdmin;
    console.log("Is Admin (any type):", isAdmin);

    // Check if user is student - improved logic with proper typing
    const studentDetails = studentData as StudentDetails | null;
    const isStudent = Boolean(
      studentDetails &&
        studentDetails.studentAddress &&
        studentDetails.studentAddress.toLowerCase() !==
          "0x0000000000000000000000000000000000000000" &&
        studentDetails.studentAddress.toLowerCase() ===
          userAddress.toLowerCase() &&
        studentDetails.isActive // Make sure student is active
    );
    console.log("Is Student:", isStudent);

    // Determine user type
    let userType: "admin" | "super_admin" | "student" | "unknown" = "unknown";
    if (isSuperAdmin) {
      userType = "super_admin";
    } else if (isAdmin) {
      userType = "admin";
    } else if (isStudent) {
      userType = "student";
    }
    console.log("Final User Type:", userType);

    // Handle errors
    const error =
      adminError?.message || superAdminError?.message || studentError?.message;
    if (error) {
      console.error("Contract Error:", error);
    }

    const finalRole = {
      isAdmin,
      isSuperAdmin,
      isStudent,
      userType,
      studentData: studentDetails || undefined,
      isLoading: false, // Set loading to false since all calls are complete
      error,
    };

    console.log("Final Role State:", finalRole);
    setUserRole(finalRole);
  }, [
    isMounted,
    userAddress,
    isConnected,
    hasStartedLoading,
    adminAddresses,
    superAdminAddress,
    studentData,
    isAdminLoading,
    isSuperAdminLoading,
    isStudentLoading,
    adminError,
    superAdminError,
    studentError,
  ]);

  return userRole;
};