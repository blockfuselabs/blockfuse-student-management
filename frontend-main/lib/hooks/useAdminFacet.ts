import { useContractWrite, useContractRead } from "wagmi";
import AdminFacetAbi from "@/lib/contract/AdminFacet.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";

export function useAddAdmin() {
  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: AdminFacetAbi.abi ?? AdminFacetAbi,
    functionName: "addAdmin",
  });
}

export function useRemoveAdmin() {
  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: AdminFacetAbi.abi ?? AdminFacetAbi,
    functionName: "removeAdmin",
  });
}

export function useRecordStudentAssessment() {
  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: AdminFacetAbi.abi ?? AdminFacetAbi,
    functionName: "recordStudentAssesment",
  });
}

export function useRegisterStudent() {
  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: AdminFacetAbi.abi ?? AdminFacetAbi,
    functionName: "registerStudent",
  });
}

export function useAddStudentToCohort() {
  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: AdminFacetAbi.abi ?? AdminFacetAbi,
    functionName: "addStudentToCohort",
  });
}

export function useDisableStudent() {
  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: AdminFacetAbi.abi ?? AdminFacetAbi,
    functionName: "disableStudent",
  });
}

export function useEnableStudent() {
  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: AdminFacetAbi.abi ?? AdminFacetAbi,
    functionName: "enableStudent",
  });
}

export function useReplaceStudentWallet() {
  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: AdminFacetAbi.abi ?? AdminFacetAbi,
    functionName: "replaceStudentWallet",
  });
}

export function useIsStudentActive(student: string) {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: AdminFacetAbi.abi ?? AdminFacetAbi,
    functionName: "isStudentActive",
    args: [student],
  });
}
