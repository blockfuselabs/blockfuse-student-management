import { useContractRead } from "wagmi";
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
  const { data, isLoading, isError, error, refetch } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI,
    functionName: "getStudent",
    args: [studentAddress],
    enabled: !!studentAddress && studentAddress.length === 42,
  });

  return {
    student: data as StudentData | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
};
