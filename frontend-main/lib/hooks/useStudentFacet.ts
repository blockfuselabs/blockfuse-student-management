import { useReadContract, useWriteContract } from "wagmi";
import StudentAbi from "@/lib/contract/StudentFacet.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";

export function useLogAttendance() {
  return useWriteContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: StudentAbi.abi,
    functionName: "logAttendance",
  });
}

export function useGetStudentAssessments(studentAddress: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: StudentAbi.abi,
    functionName: "getStudentAssesments",
    args: [studentAddress],
  });
}

export function useGetStudentFinalScore(studentAddress: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: StudentAbi.abi,
    functionName: "getStudentFinalScore",
    args: [studentAddress],
  });
}

export function useGetStudentScoreByIndex(
  studentAddress: string,
  index: number
) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: StudentAbi.abi,
    functionName: "getStudentScoreByIndex",
    args: [studentAddress, index],
  });
}

export function useGetAttendanceByCohortAndTrack(
  cohortId: number,
  track: number
) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: StudentAbi.abi,
    functionName: "getAttendanceByCohortAndTrack",
    args: [cohortId, track],
  });
}

export function useHasAttendance(
  studentAddress: string,
  cohortId: number,
  track: number,
  day: number
) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: StudentAbi.abi,
    functionName: "hasAttendance",
    args: [studentAddress, cohortId, track, day],
  });
}

export function useGetStudent(studentAddress: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: StudentAbi.abi,
    functionName: "getStudent",
    args: [studentAddress],
  });
}

export function useGetStudentsByCohortTrackAndDay(
  cohortId: number,
  track: number,
  day: number
) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: StudentAbi.abi,
    functionName: "getStudentsByCohortTrackAndDay",
    args: [cohortId, track, day],
  });
}
