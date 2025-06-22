import { useState, useEffect } from "react";
import { useWriteContract, useTransaction } from "wagmi";
import DiamondABI from "@/lib/contract/DiamondABI.json";
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
    data: writeData,
    isError: isWriteError,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isTransactionLoading,
    isSuccess,
    isError: isTransactionError,
  } = useTransaction({
    hash: writeData,
  });

  // Handle transaction success
  useEffect(() => {
    if (isSuccess) {
      console.log("Attendance logged successfully!");
    }
  }, [isSuccess]);

  // Handle transaction errors
  useEffect(() => {
    if (isWriteError || isTransactionError) {
      const errorMessage = writeError?.message || "Transaction failed";
      console.log("Transaction error:", errorMessage);
      setError(errorMessage);
    }
  }, [isWriteError, isTransactionError, writeError]);

  const logAttendance = async (params: LogAttendanceParams) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Logging attendance with params:", params);

      if (!writeContract) {
        throw new Error("Contract write function not available");
      }

      // Call the contract function
      await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: DiamondABI.abi,
        functionName: "logAttendance",
        args: [params.studentAddress, params.cohortId, params.track],
      });
    } catch (err) {
      console.log("Error logging attendance:", err);
      setError(err instanceof Error ? err.message : "Failed to log attendance");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logAttendance,
    isLoading: isLoading || isTransactionLoading,
    isSuccess,
    error,
    resetError: () => setError(null),
  };
};
