import { useState } from "react";
import { useWalletClient } from "wagmi";
import { writeContract } from "viem/actions";
import DiamondABI from "@/lib/contract/DiamondABI.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";

export function useReplaceStudentWalletTx() {
  const { data: walletClient } = useWalletClient();
  const [isPending, setIsPending] = useState(false);

  const replaceStudentWallet = async (
    oldAddress: string,
    newAddress: string
  ) => {
    if (!walletClient) throw new Error("Wallet not connected");
    setIsPending(true);
    try {
      await writeContract(walletClient, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: DiamondABI.abi,
        functionName: "replaceStudentWallet",
        args: [oldAddress, newAddress],
      });
    } finally {
      setIsPending(false);
    }
  };

  return { replaceStudentWallet, isPending };
}
