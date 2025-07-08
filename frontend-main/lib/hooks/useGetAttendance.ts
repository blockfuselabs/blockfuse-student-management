import { useReadContract, useWalletClient } from "wagmi";
import DiamondABI from "@/lib/contract/DiamondABI.json";
import AdminFacetABI from "@/lib/contract/AdminFacet.json";
import StudentFacetABI from "@/lib/contract/StudentFacet.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import { useState, useEffect } from "react";
import { readContract } from "viem/actions";

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

export const useGetAttendanceDatesForStudent = (
  studentAddress: string,
  cohortId: number,
  track: number
) => {
  const { data: walletClient } = useWalletClient();
  const [attendanceDates, setAttendanceDates] = useState<number[] | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchAttendanceDates = async () => {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      try {
        if (
          walletClient &&
          studentAddress &&
          studentAddress.trim() !== "" &&
          cohortId > 0 &&
          (track === 0 || track === 1)
        ) {
          const result = await readContract(walletClient, {
            address: CONTRACT_ADDRESS as `0x${string}`,
            abi: AdminFacetABI.abi,
            functionName: "getAttendanceDatesForStudent",
            args: [studentAddress, cohortId, track],
          });
          setAttendanceDates(result as number[]);
        } else {
          setAttendanceDates(undefined);
        }
      } catch (err) {
        setIsError(true);
        setError(err);
        setAttendanceDates(undefined);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendanceDates();
    // Only re-run if these change
  }, [walletClient, studentAddress, cohortId, track]);

  return {
    attendanceDates,
    isLoading,
    isError,
    error,
    refetch: () => {
      // Optionally expose a refetch method
      if (walletClient) {
        // Just re-run the effect
        setAttendanceDates(undefined);
        setIsLoading(true);
        setIsError(false);
        setError(null);
        // Call fetchAttendanceDates again
        // (could refactor to expose fetchAttendanceDates directly)
      }
    },
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
    abi: StudentFacetABI.abi,
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

export const useGetAttendanceForMultipleStudents = (
  students: Array<{ studentAddress: string }>,
  cohortId: number,
  track: number,
  day: number
) => {
  const { data: walletClient } = useWalletClient();
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const fetchAttendanceForAll = async () => {
      if (
        !walletClient ||
        !students.length ||
        !cohortId ||
        day === undefined ||
        day === null
      ) {
        setAttendanceData({});
        return;
      }

      setIsLoading(true);
      setIsError(false);
      setError(null);

      try {
        const attendanceResults: Record<string, boolean> = {};

        // Check attendance for each student
        for (const student of students) {
          try {
            const result = await readContract(walletClient, {
              address: CONTRACT_ADDRESS as `0x${string}`,
              abi: StudentFacetABI.abi,
              functionName: "hasAttendance",
              args: [student.studentAddress, cohortId, track, day],
            });
            attendanceResults[student.studentAddress] = result as boolean;
          } catch (err) {
            console.error(
              `Error checking attendance for ${student.studentAddress}:`,
              err
            );
            attendanceResults[student.studentAddress] = false;
          }
        }

        setAttendanceData(attendanceResults);
      } catch (err) {
        setIsError(true);
        setError(err);
        setAttendanceData({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttendanceForAll();
  }, [walletClient, students, cohortId, track, day]);

  return {
    attendanceData,
    isLoading,
    isError,
    error,
    refetch: () => {
      if (walletClient) {
        setAttendanceData({});
        setIsLoading(true);
        setIsError(false);
        setError(null);
      }
    },
  };
};
