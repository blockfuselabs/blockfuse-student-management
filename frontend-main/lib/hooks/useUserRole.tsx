import { useState, useEffect } from 'react';
import { useAccount, useReadContract} from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/contract/address';
import ABI from "@/lib/contract/ABI.json"

// Types based on your ABI
interface StudentDetails {
  firstname: string;
  lastname: string;
  username: string;
  twitter: string;
  linkedin: string;
  github: string;
  track: number;
  cohort: number;
  isActive: boolean;
  finalScore: bigint;
  studentAddress: string;
}

interface UserRoleData {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isStudent: boolean;
  userType: 'admin' | 'super_admin' | 'student' | 'unknown';
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
    userType: 'unknown',
    isLoading: true,
  });

  // Check if user is admin
  const { 
    data: isAdminData, 
    isLoading: isAdminLoading, 
    error: adminError 
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi:ABI.abi,
    functionName: 'admins',
    args: userAddress ? [userAddress] : undefined,
  });


  // Get super admin address
  const { 
    data: superAdminAddress, 
    isLoading: isSuperAdminLoading, 
    error: superAdminError 
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi:ABI.abi,
    functionName: 'superAdmin',
  });

  // Get student data
  const { 
    data: studentData, 
    isLoading: isStudentLoading, 
    error: studentError 
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi:ABI.abi,
    functionName: 'getStudent',
    args: userAddress ? [userAddress] : undefined,
  });

  useEffect(() => {
    if (!userAddress || !isConnected) {
      setUserRole({
        isAdmin: false,
        isSuperAdmin: false,
        isStudent: false,
        userType: 'unknown',
        isLoading: false,
      });
      return;
    }

    const isLoading = isAdminLoading || isSuperAdminLoading || isStudentLoading;

    if (isLoading) {
      setUserRole(prev => ({ ...prev, isLoading: true }));
      return;
    }

    // Check if user is super admin
    const isSuperAdmin = typeof superAdminAddress === 'string' && superAdminAddress.toLowerCase() === userAddress.toLowerCase();

    // Check if user is regular admin
    const isRegularAdmin = Boolean(isAdminData);
    
    // Check if user is admin (super admin or regular admin)
    const isAdmin = isSuperAdmin || isRegularAdmin;

    // Check if user is student
    const isStudent = Boolean(
      studentData && 
      studentData.studentAddress && 
      studentData.studentAddress.toLowerCase() !== '0x0000000000000000000000000000000000000000' &&
      studentData.studentAddress.toLowerCase() === userAddress.toLowerCase()
    );

    // Determine user type
    let userType: 'admin' | 'super_admin' | 'student' | 'unknown' = 'unknown';
    if (isSuperAdmin) {
      userType = 'super_admin';
    } else if (isAdmin) {
      userType = 'admin';
    } else if (isStudent) {
      userType = 'student';
    }

    // Handle errors
    const error = adminError?.message || superAdminError?.message || studentError?.message;

    setUserRole({
      isAdmin,
      isSuperAdmin,
      isStudent,
      userType,
      studentData: studentData as StudentDetails,
      isLoading: false,
      error,
    });

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

// Additional utility hook for role-based access control
// export const useRoleAccess = () => {
//   const userRole = useUserRole();

//   return {
//     ...userRole,
//     // Utility functions for easier access control
//     canManageStudents: userRole.isAdmin,
//     canManageCohorts: userRole.isAdmin,
//     canLogAttendance: userRole.isAdmin,
//     canRecordAssessments: userRole.isAdmin,
//     canManageAdmins: userRole.isSuperAdmin,
//     hasStudentAccess: userRole.isStudent,
//     isAuthenticated: userRole.isAdmin || userRole.isStudent,
//   };
// };
