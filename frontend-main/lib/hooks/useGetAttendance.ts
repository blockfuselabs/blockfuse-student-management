import { usePublicClient } from "wagmi";
import StudentFacetABI from "@/lib/contract/StudentFacet.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import { useEffect, useState } from "react";

export interface AttendanceData {
  students: string[];
  dates: number[];
}

export const useGetAttendanceByCohortAndTrack = (
  cohortId: number,
  track: number
) => {
  const publicClient = usePublicClient();
  const [attendance, setAttendance] = useState<AttendanceData | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!publicClient || cohortId <= 0 || (track !== 0 && track !== 1)) {
      setAttendance(undefined);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchAttendance = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        console.log(
          `Fetching attendance for cohort ${cohortId}, track ${track}`
        );

        const result = (await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: StudentFacetABI.abi,
          functionName: "getAttendanceByCohortAndTrack",
          args: [cohortId, track],
        })) as [string[], bigint[]];

        if (!cancelled) {
          console.log("Attendance data received:", result);

          // Convert bigint dates to numbers
          const dates = result[1].map((date) => Number(date));

          setAttendance({
            students: result[0],
            dates: dates,
          });
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching attendance:", err);
          setIsError(true);
          setError(
            err instanceof Error ? err : new Error("Failed to fetch attendance")
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchAttendance();

    return () => {
      cancelled = true;
    };
  }, [publicClient, cohortId, track]);

  return {
    attendance,
    isLoading,
    isError,
    error,
    refetch: () => {
      // Trigger a refetch by updating the state
      setAttendance(undefined);
    },
  };
};

export const useHasAttendance = (
  studentAddress: string,
  cohortId: number,
  track: number,
  day: number
) => {
  const publicClient = usePublicClient();
  const [hasAttendance, setHasAttendance] = useState<boolean | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (
      !publicClient ||
      !studentAddress ||
      studentAddress.length !== 42 ||
      cohortId <= 0 ||
      (track !== 0 && track !== 1) ||
      day <= 0
    ) {
      setHasAttendance(undefined);
      setIsLoading(false);
      setIsError(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchHasAttendance = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        setError(null);

        console.log(
          `Checking attendance for student ${studentAddress}, cohort ${cohortId}, track ${track}, day ${day}`
        );

        const result = (await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: StudentFacetABI.abi,
          functionName: "hasAttendance",
          args: [studentAddress, cohortId, track, day],
        })) as boolean;

        if (!cancelled) {
          console.log("Has attendance result:", result);
          setHasAttendance(result);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error checking attendance:", err);
          setIsError(true);
          setError(
            err instanceof Error ? err : new Error("Failed to check attendance")
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchHasAttendance();

    return () => {
      cancelled = true;
    };
  }, [publicClient, studentAddress, cohortId, track, day]);

  return {
    hasAttendance,
    isLoading,
    isError,
    error,
    refetch: () => {
      // Trigger a refetch by updating the state
      setHasAttendance(undefined);
    },
  };
};
