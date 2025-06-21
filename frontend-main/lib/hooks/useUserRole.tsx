import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import ABI from "@/lib/contract/ABI.json";

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
  studentData?: StudentDetails;
  isLoading: boolean;
  error?: string;
}

// Your contract configuration

export const useUserRole = (): UserRoleData => {
  const { address: userAddress, isConnected } = useAccount();
  const [userRole, setUserRole] = useState<UserRoleData>({
    isAdmin: false,
    isSuperAdmin: false,
    isStudent: false,
    userType: "unknown",
    isLoading: true,
  });

  // Check if user is admin
  const {
    data: isAdminData,
    isLoading: isAdminLoading,
    error: adminError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI, 
    functionName: "admins",
    args: userAddress ? [userAddress] : undefined,
  });

  // Get super admin address
  const {
    data: superAdminAddress,
    isLoading: isSuperAdminLoading,
    error: superAdminError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "superAdmin",
  });

  // Get student data
  const {
    data: studentData,
    isLoading: isStudentLoading,
    error: studentError,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: "getStudent",
    args: userAddress ? [userAddress] : undefined,
  });

  useEffect(() => {
    console.log("=== useUserRole Debug ===");
    console.log("User Address:", userAddress);
    console.log("Is Connected:", isConnected);
    console.log("Admin Data:", isAdminData);
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

    if (!userAddress || !isConnected) {
      console.log("User not connected, setting default state");
      setUserRole({
        isAdmin: false,
        isSuperAdmin: false,
        isStudent: false,
        userType: "unknown",
        isLoading: false,
      });
      return;
    }

    const isLoading = isAdminLoading || isSuperAdminLoading || isStudentLoading;

    if (isLoading) {
      console.log("Still loading contract data...");
      setUserRole((prev) => ({ ...prev, isLoading: true }));
      return;
    }

    // Check if user is super admin
    const isSuperAdmin =
      typeof superAdminAddress === "string" &&
      superAdminAddress.toLowerCase() === userAddress.toLowerCase();
    console.log("Is Super Admin:", isSuperAdmin);

    // Check if user is regular admin
    const isRegularAdmin = Boolean(isAdminData);
    console.log("Is Regular Admin:", isRegularAdmin);

    // Check if user is admin (super admin or regular admin)
    const isAdmin = isSuperAdmin || isRegularAdmin;
    console.log("Is Admin (any type):", isAdmin);

    // Check if user is student - improved logic
    const isStudent = Boolean(
      studentData &&
        studentData.studentAddress &&
        studentData.studentAddress.toLowerCase() !==
          "0x0000000000000000000000000000000000000000" &&
        studentData.studentAddress.toLowerCase() ===
          userAddress.toLowerCase() &&
        studentData.isActive // Make sure student is active
    );
    console.log("Is Student:", isStudent);
    console.log("Student Data Details:", {
      hasStudentData: Boolean(studentData),
      studentAddress: studentData?.studentAddress,
      isActive: studentData?.isActive,
      addressMatch:
        studentData?.studentAddress?.toLowerCase() ===
        userAddress?.toLowerCase(),
    });

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
      studentData: studentData as StudentDetails,
      isLoading: false,
      error,
    };

    console.log("Final Role State:", finalRole);
    setUserRole(finalRole);
  }, [
    userAddress,
    isConnected,
    isAdminData,
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


