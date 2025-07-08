import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import StudentFacetABI from "@/lib/contract/StudentFacet.json";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import { toast } from "sonner";

export interface LogAttendanceParams {
  studentAddress: string;
  cohortId: number;
  track: number; // 0 = Web2, 1 = Web3
}

export const useLogAttendance = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    writeContract,
    data: hash,
    isError: isWriteError,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isConfirmError,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Reset states when starting a new transaction
  useEffect(() => {
    if (hash) {
      setIsSuccess(false);
      setError(null);
    }
  }, [hash]);

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      setIsSuccess(true);
      setIsLoading(false);
    }
  }, [isConfirmed]);

  // Handle transaction errors
  useEffect(() => {
    if (isWriteError || isConfirmError) {
      const errorMessage =
        writeError?.message || confirmError?.message || "Transaction failed";
      setError(errorMessage);
      setIsLoading(false);
      toast.error(errorMessage);
    }
  }, [isWriteError, isConfirmError, writeError, confirmError]);

  const logAttendance = async (params: LogAttendanceParams) => {
    try {
      setIsLoading(true);
      setError(null);
      setIsSuccess(false);

      console.log("Logging attendance with params:", params);

      if (!writeContract) {
        throw new Error("Contract write function not available");
      }

      // Call the contract function with 3 arguments
      await writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: StudentFacetABI.abi,
        functionName: "logAttendance",
        args: [params.studentAddress, params.cohortId, params.track],
      });
    } catch (err) {
      console.log("Error logging attendance:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to log attendance";
      setError(errorMessage);
      setIsLoading(false);
      toast.error(errorMessage);
    }
  };

  const resetState = () => {
    setIsLoading(false);
    setError(null);
    setIsSuccess(false);
    resetWrite();
  };

  return {
    logAttendance,
    isLoading: isLoading || isConfirming,
    isSuccess,
    error,
    resetState,
  };
};
