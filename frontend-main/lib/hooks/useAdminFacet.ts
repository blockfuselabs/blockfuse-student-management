import { useWriteContract, useReadContract } from "wagmi";
import DiamondABI from "@/lib/contract/DiamondABI.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";

export function useAddAdmin() {
  return useWriteContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "addAdmin",
  });
}

export function useRemoveAdmin() {
  return useWriteContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "removeAdmin",
  });
}

export function useRecordStudentAssessment() {
  return useWriteContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "recordStudentAssesment",
  });
}

export function useRegisterStudent() {
  return useWriteContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "registerStudent",
  });
}

export function useAddStudentToCohort() {
  return useWriteContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "addStudentToCohort",
  });
}

export function useDisableStudent() {
  return useWriteContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "disableStudent",
  });
}

export function useEnableStudent() {
  return useWriteContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "enableStudent",
  });
}

export function useIsStudentActive(student: string) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "isStudentActive",
    args: [student],
  });
}
