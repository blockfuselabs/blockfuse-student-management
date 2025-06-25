import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import StudentFacetABI from "@/lib/contract/StudentFacet.json";

export interface StudentDetails {
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

export function useGetStudentsForCohorts(
  cohorts: { id: string | number; tracks: number[]; name: string }[]
) {
  const publicClient = usePublicClient();
  const [students, setStudents] = useState<StudentDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicClient || !cohorts.length) {
      setStudents([]);
      return;
    }
    let cancelled = false;
    async function fetchAll() {
      setIsLoading(true);
      setError(null);
      try {
        const all: StudentDetails[] = [];

        for (const cohort of cohorts) {
          const cohortIdNum = Number(cohort.id);
          if (isNaN(cohortIdNum)) continue; // skip invalid cohort id

          console.log("Fetching students for cohort", cohort.id);

          if (publicClient) {
            try {
              // Use getStudentsByCohortAndTrack for each track in the cohort
              for (const track of cohort.tracks) {
                const trackNum = Number(track);
                if (isNaN(trackNum)) continue; // skip invalid track
                console.log(
                  `Fetching students for cohort ${cohortIdNum}, track ${trackNum}`
                );

                const studentsData = (await publicClient.readContract({
                  address: CONTRACT_ADDRESS,
                  abi: StudentFacetABI.abi,
                  functionName: "getStudentsByCohortAndTrack",
                  args: [cohortIdNum, trackNum],
                })) as StudentDetails[];

                console.log(
                  `Found ${studentsData.length} students for cohort ${cohortIdNum}, track ${trackNum}:`,
                  studentsData
                );

                if (studentsData && studentsData.length > 0) {
                  all.push(...studentsData);
                }
              }
            } catch (cohortError) {
              console.error(
                "Error fetching students for cohort",
                cohortIdNum,
                ":",
                cohortError
              );
            }
          }
        }

        console.log("Aggregated students:", all);
        if (!cancelled) setStudents(all);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Failed to fetch students");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, [cohorts, publicClient]);

  return { students, isLoading, error };
}
