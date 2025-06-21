import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS } from '@/lib/contract/address';
import StudentFacetABI from '@/lib/contract/StudentFacet.json';

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
     for (const track of cohort.tracks) {
      console.log('Fetching students for cohort', cohort.id, 'track', track);
      const data = await publicClient.readContract({
       address: CONTRACT_ADDRESS,
       abi: StudentFacetABI.abi,
       functionName: 'getStudentsByCohortAndTrack',
       args: [Number(cohort.id), track],
      });
      console.log('Result for cohort', cohort.id, 'track', track, ':', data);
      if (Array.isArray(data)) {
       all.push(...data);
      }
     }
    }
    console.log('Aggregated students:', all);
    if (!cancelled) setStudents(all);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
   } catch (err: any) {
    if (!cancelled) setError(err.message || 'Failed to fetch students');
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