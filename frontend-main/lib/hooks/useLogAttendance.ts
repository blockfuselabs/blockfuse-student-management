import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import StudentFacetABI from "@/lib/contract/StudentFacet.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";

export interface LogAttendanceParams {
  studentAddress: string;
  cohortId: number;
  track: number; // 0 = Web2, 1 = Web3
}

export const useLogAttendance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const logAttendance = async (params: LogAttendanceParams) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Logging attendance with params:", params);

      if (!writeContract) {
        throw new Error("Contract write function not available");
      }

      // Call the contract function with the correct parameters
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: StudentFacetABI.abi,
        functionName: "logAttendance",
        args: [params.studentAddress, params.cohortId, params.track],
      });

      console.log("Attendance logging transaction submitted");
    } catch (err) {
      console.error("Error logging attendance:", err);
      setError(err instanceof Error ? err.message : "Failed to log attendance");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle transaction success/error
  if (isSuccess) {
    console.log("Attendance logged successfully!");
  }

  if (writeError) {
    console.error("Transaction error:", writeError.message);
    setError(writeError.message);
  }

  return {
    logAttendance,
    isLoading: isLoading || isPending || isConfirming,
    isSuccess,
    error,
    resetError: () => setError(null),
    transactionHash: hash,
  };
};
