import { useState } from "react";
import {
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { DiamondABI } from "@/lib/contract/DiamondABI";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";

export interface LogAttendanceParams {
  studentAddress: string;
  cohortId: number;
  track: number; // 0 = Web2, 1 = Web3
}

export const useLogAttendance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { config } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI,
    functionName: "logAttendance",
    enabled: false, // We'll enable it when we have the parameters
  });

  const {
    data,
    write,
    isError: isWriteError,
    error: writeError,
  } = useContractWrite(config);

  const {
    isLoading: isTransactionLoading,
    isSuccess,
    isError: isTransactionError,
  } = useWaitForTransaction({
    hash: data?.hash,
  });

  const logAttendance = async (params: LogAttendanceParams) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Logging attendance with params:", params);

      if (!write) {
        throw new Error("Contract write function not available");
      }

      // Call the contract function
      write({
        args: [params.studentAddress, params.cohortId, params.track],
      });
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

  if (isWriteError || isTransactionError) {
    const errorMessage = writeError?.message || "Transaction failed";
    console.error("Transaction error:", errorMessage);
    setError(errorMessage);
  }

  return {
    logAttendance,
    isLoading: isLoading || isTransactionLoading,
    isSuccess,
    error,
    resetError: () => setError(null),
  };
};
