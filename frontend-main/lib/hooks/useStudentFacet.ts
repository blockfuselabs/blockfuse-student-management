import { useContractRead, useContractWrite } from "wagmi";
import StudentFacetAbi from "@/lib/contract/StudentFacet.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";

export function useLogAttendance() {
  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: StudentFacetAbi.abi ?? StudentFacetAbi,
    functionName: "logAttendance",
  });
}

export function useGetStudentAssessments(studentAddress: string) {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: StudentFacetAbi.abi ?? StudentFacetAbi,
    functionName: "getStudentAssesments",
    args: [studentAddress],
  });
}

export function useGetStudentFinalScore(studentAddress: string) {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: StudentFacetAbi.abi ?? StudentFacetAbi,
    functionName: "getStudentFinalScore",
    args: [studentAddress],
  });
}

export function useGetStudentScoreByIndex(
  studentAddress: string,
  index: number
) {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: StudentFacetAbi.abi ?? StudentFacetAbi,
    functionName: "getStudentScoreByIndex",
    args: [studentAddress, index],
  });
}

export function useGetAttendanceByCohortAndTrack(
  cohortId: number,
  track: number
) {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: StudentFacetAbi.abi ?? StudentFacetAbi,
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
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: StudentFacetAbi.abi ?? StudentFacetAbi,
    functionName: "hasAttendance",
    args: [studentAddress, cohortId, track, day],
  });
}

export function useGetStudent(studentAddress: string) {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: StudentFacetAbi.abi ?? StudentFacetAbi,
    functionName: "getStudent",
    args: [studentAddress],
  });
}
