
import { useReadContract } from 'wagmi';
import { Abi, Address } from 'viem';
import CONTRACT_ABI from '../ABI/smsAbi.json';
import { writeContract } from 'viem/actions';

const CONTRACT_ADDRESS = import.meta.env.VITE_PUBLIC_CONTRACT_ADDRESS as Address;

export function useAssessmentService() {
  const useStudentAssesments = (studentWalletAddress: Address) => {
    const { 
      data: assessmentsData, 
      refetch, 
      isLoading, 
      isError,
      error 
    } = useReadContract({
      abi: CONTRACT_ABI as Abi,
      address: CONTRACT_ADDRESS,
      functionName: 'getStudentAssesments', 
      args: [studentWalletAddress],
    });

    const assessments = Array.isArray(assessmentsData) 
      ? assessmentsData.map(score => Number(score))
      : [];

    console.log('Assessments Debug:', {
      rawData: assessmentsData,
      processedData: assessments,
      isLoading,
      isError,
      error
    });

    return {
      assessments,
      refetch,
      isLoading,
      isError,
      error
    };
  };

  const useStudentFinalScore = (studentWalletAddress: Address) => {
    const { 
      data: finalScoreData, 
      isError, 
      isLoading, 
      refetch,
      error
    } = useReadContract({
      abi: CONTRACT_ABI as Abi,
      address: CONTRACT_ADDRESS,
      functionName: 'getStudentFinalScore',
      args: [studentWalletAddress],
    });

    const finalScore = finalScoreData ? Number(finalScoreData) : undefined;

    console.log('Final Score Debug:', {
      rawData: finalScoreData,
      processedData: finalScore,
      isLoading,
      isError,
      error
    });

    return { 
      finalScore, 
      isError, 
      isLoading, 
      refetch,
      error
    };
  };

  const useStudentScoreByIndex = (studentWalletAddress: Address, index: number) => {
    const { 
      data: scoreData, 
      isError, 
      isLoading, 
      refetch,
      error
    } = useReadContract({
      abi: CONTRACT_ABI as Abi,
      address: CONTRACT_ADDRESS,
      functionName: 'getStudentScoreByIndex',
      args: [studentWalletAddress, index],
    });

    const score = scoreData ? Number(scoreData) : undefined;

    console.log(`Score for Index ${index} Debug:`, {
      rawData: scoreData,
      processedData: score,
      isLoading,
      isError,
      error
    });

    return { 
      score, 
      isError, 
      isLoading, 
      refetch,
      error
    };
  };

  const useGetCohort = (cohortId: number) => {
    const { 
      data: cohortData, 
      isError, 
      isLoading, 
      error
    } = useReadContract({
      abi: CONTRACT_ABI as Abi,
      address: CONTRACT_ADDRESS,
      functionName: 'getCohort',
      args: [cohortId],
    });

    const cohort = {processedData: cohortData};

    console.log(`Get Cohort:`, {
      rawData: cohort,
      processedData: cohortData,
      isLoading,
      isError,
      error
    });

    console.log(cohort)

    return { 
      cohort, 
      isError, 
      isLoading, 
      error
    };
  }

  const useGetStudentsByCohortAndTrack = (cohortId: number, track: number) => {
    const { 
      data: studentsData, 
      isError, 
      isLoading,
      isSuccess, 
      error
    } = useReadContract({
      abi: CONTRACT_ABI as Abi,
      address: CONTRACT_ADDRESS,
      functionName: 'getStudentsByCohortAndTrack',
      args: [cohortId, track],
    });

    const studentDetails = {processedData: studentsData};

    console.log("error", isError, "loading", isLoading, "error",error, "success", isSuccess)

    return { 
      studentDetails, 
      isError, 
      isLoading, 
      error
    };
  }

  return {
    useStudentAssesments,
    useStudentFinalScore,
    useStudentScoreByIndex,
    useGetCohort,
    useGetStudentsByCohortAndTrack,
  };
}
