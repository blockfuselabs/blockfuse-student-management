import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import AdminFacetABI from "@/lib/contract/AdminFacet.json";

export function useRecordStudentAssessment() {
 const { writeContract, data: hash, isPending, error } = useWriteContract();

 const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
  hash,
 });

 const recordAssessment = async ({ address, score }: { address: `0x${string}`; score: number }) => {
  return writeContract({
   address: CONTRACT_ADDRESS as `0x${string}`,
   abi: AdminFacetABI.abi,
   functionName: "recordStudentAssesment",
   args: [address, score],
  });
 };

 return {
  recordAssessment,
  isPending,
  isConfirming,
  isSuccess,
  error,
  hash,
 };
} 