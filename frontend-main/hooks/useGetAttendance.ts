import { useReadContract } from "wagmi";
import DiamondABI from "@/lib/contract/DiamondABI.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";

export interface AttendanceData {
  students: string[];
  dates: number[];
}

export const useGetAttendanceByCohortAndTrack = (
  cohortId: number,
  track: number
) => {
  // Only call the contract if we have valid parameters
  const shouldCallContract = cohortId > 0 && (track === 0 || track === 1);

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "getAttendanceByCohortAndTrack",
    args: shouldCallContract ? [cohortId, track] : undefined,
  });

  return {
    attendance: data as AttendanceData | undefined,
    isLoading: shouldCallContract ? isLoading : false,
    isError: shouldCallContract ? isError : false,
    error: shouldCallContract ? error : undefined,
    refetch,
  };
};

export const useHasAttendance = (
  studentAddress: string,
  cohortId: number,
  track: number,
  day: number
) => {
  // Only call the contract if we have valid parameters
  const shouldCallContract = Boolean(
    studentAddress &&
      studentAddress.trim() !== "" &&
      cohortId > 0 &&
      (track === 0 || track === 1) &&
      day > 0
  );

  const { data, isLoading, isError, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "hasAttendance",
    args: shouldCallContract
      ? [studentAddress, cohortId, track, day]
      : undefined,
  });

  return {
    hasAttendance: data as boolean | undefined,
    isLoading: shouldCallContract ? isLoading : false,
    isError: shouldCallContract ? isError : false,
    error: shouldCallContract ? error : undefined,
    refetch,
  };
};
