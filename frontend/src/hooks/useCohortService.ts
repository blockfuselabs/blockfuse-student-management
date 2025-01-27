// src/hooks/useCohortService.ts
import { useReadContract, useWriteContract, useWatchContractEvent } from 'wagmi';
import { Abi, Address, ContractEventName } from 'viem';
import CONTRACT_ABI from '../smart_contract/SMSAbi.json';

const CONTRACT_ADDRESS = import.meta.env.VITE_PUBLIC_CONTRACT_ADDRESS as Address;

export enum Track {
  FRONTEND,
  BACKEND,
  CLOUD,
  PRODUCT_DESIGN,
}

export interface CohortData {
  id: number;
  tracks: string[];
  students: Address[];
  totalStudents: bigint;
  startDate: bigint;
  endDate: bigint;
  duration: bigint;
}

export interface FormattedCohort {
  id: number;
  name: string;
  tracks: Array<{ id: number; name: string }>;
  students: Address[];
  studentCount: number;
  startDate: number;
  endDate: number;
  duration: number;
}

export const useCohortService = () => {
  // Fetch cohort count
  const { data: cohortCount } = useReadContract({
    abi: CONTRACT_ABI as Abi,
    address: CONTRACT_ADDRESS,
    functionName: 'cohortCount',
  });

  // Read contract data for cohorts
  const { data: cohortData, refetch: refetchCohort } = useReadContract({
    abi: CONTRACT_ABI as Abi,
    address: CONTRACT_ADDRESS,
    functionName: 'getCohort',
    args: [BigInt(0)], // Default args for now
  });

  // Setup for writing to the contract
  const { writeContract, data: writeData } = useWriteContract();

  // Create Cohort
  const createCohort = async (startDate: number, endDate: number) => {
    if (!writeContract) throw new Error('Write contract is not initialized.');
    const tx = await writeContract({
      abi: CONTRACT_ABI as Abi,
      address: CONTRACT_ADDRESS,
      functionName: 'createCohort',
      args: [BigInt(startDate), BigInt(endDate)],
    });
    return tx;
  };

  // Add Track to Cohort
  const addTrackToCohort = async (cohortId: number, track: number) => {
    if (!writeContract) throw new Error('Write contract is not initialized.');
    const tx = await writeContract({
      abi: CONTRACT_ABI as Abi,
      address: CONTRACT_ADDRESS,
      functionName: 'addTrackToCohort',
      args: [cohortId, track],
    });
    return tx;
  };

  // Add Student to Cohort
  const addStudentToCohort = async (cohortId: number, student: Address, track: number) => {
    if (!writeContract) throw new Error('Write contract is not initialized.');
    const tx = await writeContract({
      abi: CONTRACT_ABI as Abi,
      address: CONTRACT_ADDRESS,
      functionName: 'addStudentToCohort',
      args: [cohortId, student, track],
    });
    return tx;
  };

  // Fetch specific cohort data
  // const fetchCohortData = async (cohortId: number): Promise<FormattedCohort | null> => {
  //   const result = await refetchCohort({ args: [BigInt(cohortId)] });
  //   if (!result.data) return null;

  //   const data = result.data as unknown as CohortData;

  //   return {
  //     id: cohortId,
  //     name: `Cohort ${cohortId}`,
  //     tracks: data.tracks.map((track, idx) => ({ id: idx, name: track })),
  //     students: data.students,
  //     studentCount: Number(data.totalStudents),
  //     startDate: Number(data.startDate),
  //     endDate: Number(data.endDate),
  //     duration: Number(data.duration),
  //   };
  // };

  // Fetch all cohorts
  // const fetchCohorts = async (): Promise<FormattedCohort[]> => {
  //   if (!cohortCount) return [];
  //   const count = Number(cohortCount);
  //   const cohorts: FormattedCohort[] = [];

  //   for (let i = 1; i <= count; i++) {
  //     const cohort = await fetchCohortData(i);
  //     if (cohort) cohorts.push(cohort);
  //   }

  //   return cohorts;
  // };

  const recordStudentAssesment = async (student: Address, score: number) => {
    if (!writeContract) throw new Error('Write contract is not initialized.');
    
    const tx = await writeContract({
      abi: CONTRACT_ABI as Abi,
      address: CONTRACT_ADDRESS,
      functionName: 'recordStudentAssesment',
      args: [student, score]
    });
    
    return tx;
  };

  // Watch "CohortCreated" events
  useWatchContractEvent({
    abi: CONTRACT_ABI as Abi,
    address: CONTRACT_ADDRESS,
    eventName: 'CohortCreated' as ContractEventName,
    onLogs: (logs) => console.log('Cohort created:', logs),
  });

  return {
    cohortCount: cohortCount ? Number(cohortCount) : 0,
    // fetchCohorts,
    createCohort,
    addTrackToCohort,
    addStudentToCohort,
    // fetchCohortData,
    writeData,
    recordStudentAssesment
  };
};
