import { useReadContract, useWriteContract } from "wagmi";
// import DiamondABI from "@/lib/contract/DiamondABI.json";
import CohortFacetABI from "@/lib/contract/CohortFacet.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";

// Example: Add hooks for CohortFacet functions
export function useGetCohort(cohortId: number) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CohortFacetABI.abi,
    functionName: "getCohort",
    args: [cohortId],
  });
}

export function useCreateCohort() {
  return useWriteContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "createCohort",
  });
}

export function useAddTrackToCohort() {
  return useWriteContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "addTrackToCohort",
  });
}

export function useGetCohortCount() {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "getCohortCount",
  });
}

export function useGetCohortTracks(cohortId: number) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "getCohortTracks",
    args: [cohortId],
  });
}
