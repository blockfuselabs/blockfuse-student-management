import { useContractRead } from "wagmi";
import  DiamondABI  from "@/lib/contract/DiamondABI.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";

export interface AttendanceData {
  students: string[];
  dates: number[];
}

export const useGetAttendanceByCohortAndTrack = (
  cohortId: number,
  track: number
) => {
  const { data, isLoading, isError, error, refetch } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "getAttendanceByCohortAndTrack",
    args: [cohortId, track],
    enabled: cohortId > 0 && (track === 0 || track === 1),
  });

  return {
    attendance: data as AttendanceData | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
};

export const useHasAttendance = (
  studentAddress: string,
  cohortId: number,
  track: number,
  day: number
) => {
  const { data, isLoading, isError, error, refetch } = useContractRead({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "hasAttendance",
    args: [studentAddress, cohortId, track, day],
    enabled:
      !!studentAddress &&
      studentAddress.length === 42 &&
      cohortId > 0 &&
      (track === 0 || track === 1) &&
      day > 0,
  });

  return {
    hasAttendance: data as boolean | undefined,
    isLoading,
    isError,
    error,
    refetch,
  };
};
