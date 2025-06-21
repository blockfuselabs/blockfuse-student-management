import { useContractRead, useContractWrite } from "wagmi";
import CohortFacetAbi from "@/lib/contract/CohortFacet.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";

// Example: Add hooks for CohortFacet functions
export function useGetCohort(cohortId: number) {
  return useContractRead({
    address: CONTRACT_ADDRESS,
    abi: CohortFacetAbi.abi ?? CohortFacetAbi,
    functionName: "getCohort",
    args: [cohortId],
  });
}

export function useAddCohort() {
  return useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CohortFacetAbi.abi ?? CohortFacetAbi,
    functionName: "addCohort",
  });
}
// Add more hooks for other CohortFacet functions as needed
