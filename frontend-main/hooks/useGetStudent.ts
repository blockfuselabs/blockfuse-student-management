import { useReadContract } from "wagmi";
import DiamondABI from "@/lib/contract/DiamondABI.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";

export interface StudentData {
  firstname: string;
  lastname: string;
  username: string;
  twitter: string;
  linkedin: string;
  github: string;
  track: number; // 0 = Web2, 1 = Web3
  cohort: number;
  isActive: boolean;
  finalScore: number;
  studentAddress: string;
}

export const useGetStudent = (studentAddress: string) => {
  // Only call the contract if we have a valid student address
  const shouldCallContract = Boolean(
    studentAddress && studentAddress.trim() !== ""
  );

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "getStudent",
    args: shouldCallContract ? [studentAddress] : undefined,
  });

  return {
    student: data as StudentData | undefined,
    isLoading: shouldCallContract ? isLoading : false,
    isError: shouldCallContract ? isError : false,
    error: shouldCallContract ? error : undefined,
    refetch,
  };
};
