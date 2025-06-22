import { useReadContract, useWriteContract } from "wagmi";
import DiamondABI from "@/lib/contract/DiamondABI.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";

export function useLogAttendance() {
  return useWriteContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "logAttendance",
  });
}

export function useGetStudentAssessments(studentAddress: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "getStudentAssesments",
    args: [studentAddress],
  });
}

export function useGetStudentFinalScore(studentAddress: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
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
    abi: DiamondABI.abi,
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
    abi: DiamondABI.abi,
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
    abi: DiamondABI.abi,
    functionName: "hasAttendance",
    args: [studentAddress, cohortId, track, day],
  });
}

export function useGetStudent(studentAddress: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "getStudent",
    args: [studentAddress],
  });
}
