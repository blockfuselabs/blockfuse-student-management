"use client";

import { useReadContract, usePublicClient, useAccount, useChainId } from "wagmi";
import CohortFacetABI from "../contract/CohortFacet.json";
import { CONTRACT_ADDRESS } from "../contract/address";
import { Cohort } from "@/components/tables/CohortsColums";
import { useEffect, useState } from "react";

export const useGetCohorts = () => {
 const [cohorts, setCohorts] = useState<Cohort[]>([]);
 const [isLoading, setIsLoading] = useState(false);
 const [fallbackCohortCount, setFallbackCohortCount] = useState<number | null>(null);
 const publicClient = usePublicClient();
 const { address, isConnected } = useAccount();
 const chainId = useChainId();

 // Get total cohort count
 const { data: cohortCount, isLoading: isLoadingCount, error: cohortCountError } = useReadContract({
  address: CONTRACT_ADDRESS,
  abi: CohortFacetABI.abi,
  functionName: "getCohortCount",
 });

 // Debug the contract call directly and set fallback count
 useEffect(() => {
  const debugContractCall = async () => {
   if (!publicClient || !isConnected || chainId !== 11155111) {
    return;
   }

   try {
    const debugResult = await publicClient.readContract({
     address: CONTRACT_ADDRESS,
     abi: CohortFacetABI.abi,
     functionName: "getCohortCount",
    });
    setFallbackCohortCount(Number(debugResult));
   } catch (error) {
    console.error("❌ Direct contract call failed:", error);
   }
  };

  debugContractCall();
 }, [publicClient, isConnected, chainId]);

 // Use fallback count if useReadContract fails
 const effectiveCohortCount = cohortCount || fallbackCohortCount;

 // Fetch cohorts when count is available
 useEffect(() => {
  const fetchCohorts = async () => {
   // Check authentication requirements
   if (!isConnected) {
    setCohorts([]);
    return;
   }

   if (chainId !== 11155111) {
    setCohorts([]);
    return;
   }

   if (!effectiveCohortCount || effectiveCohortCount === 0) {
    setCohorts([]);
    return;
   }

   if (!publicClient) {
    return;
   }

   setIsLoading(true);

   const cohortsData: Cohort[] = [];

   // Fetch each cohort sequentially using public client
   for (let i = 1; i <= effectiveCohortCount; i++) {
    try {
     const cohortData = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CohortFacetABI.abi,
      functionName: "getCohort",
      args: [i],
     });

     if (cohortData) {
      const [id, tracks, totalStudents, startDate, endDate, duration, studentsByTrack] = cohortData;

      // Check if this is a valid cohort (has non-zero dates)
      if (Number(startDate) === 0 || Number(endDate) === 0) {
       continue;
      }

      // Convert timestamps to dates
      const startDateObj = new Date(Number(startDate) * 1000);
      const endDateObj = new Date(Number(endDate) * 1000);
      const currentDate = new Date();

      // Determine status based on dates
      let status: "active" | "completed" | "upcoming";
      if (currentDate < startDateObj) {
       status = "upcoming";
      } else if (currentDate > endDateObj) {
       status = "completed";
      } else {
       status = "active";
      }

      const cohort: Cohort = {
       id: i.toString(), // Use the loop index as ID since contract returns 0
       name: `Cohort ${i}`,
       startDate: startDateObj.toISOString().split('T')[0],
       endDate: endDateObj.toISOString().split('T')[0],
       students: Number(totalStudents),
       status,
      };

      cohortsData.push(cohort);
     }
    } catch (error) {
     console.error(`❌ Error fetching cohort ${i}:`, error);
    }
   }

   setCohorts(cohortsData);
   setIsLoading(false);
  };

  fetchCohorts();
 }, [effectiveCohortCount, publicClient, isConnected, chainId]);

 console.log("🔍 useGetCohorts Debug:", {
  cohortCount: effectiveCohortCount,
  cohortsFound: cohorts.length,
  isLoading: isLoading || isLoadingCount,
  isConnected,
  isCorrectNetwork: chainId === 11155111,
  hasError: !!cohortCountError
 });

 return {
  cohorts,
  isLoading: isLoading || isLoadingCount,
  cohortCount: effectiveCohortCount,
  error: cohortCountError,
  isConnected,
  isCorrectNetwork: chainId === 11155111,
  address,
 };
}; 