import { useWriteContract, useReadContract } from "wagmi";
import AdminUsernameFacetAbi from "@/lib/contract/AdminUsernameFacet.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";

export function useAddAdminWithUsername() {
  return useWriteContract();
}

export function useGetAdminUsername(adminAddress: string | undefined) {
  return useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: AdminUsernameFacetAbi.abi,
    functionName: "getAdminUsername",
    args: adminAddress ? [adminAddress] : undefined,
  });
}
