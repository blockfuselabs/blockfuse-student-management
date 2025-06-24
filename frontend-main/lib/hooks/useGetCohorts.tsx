"use client";

import {
  useReadContract,
  usePublicClient,
  useAccount,
  useChainId,
} from "wagmi";
import CohortFacetABI from "../contract/CohortFacet.json";
import { CONTRACT_ADDRESS } from "../contract/address";
import { Cohort } from "@/components/tables/CohortsColums";
import { useEffect, useState, useCallback } from "react";

export interface CohortData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  students: number;
  status: "active" | "completed" | "upcoming";
  tracks: number[];
}

export interface GetCohortsState {
  cohorts: CohortData[];
  isLoading: boolean;
  error: Error | null;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  address: string | undefined;
}

export const useGetCohorts = (refreshKey: number = 0) => {
  const [state, setState] = useState<GetCohortsState>({
    cohorts: [],
    isLoading: true,
    error: null,
    isConnected: false,
    isCorrectNetwork: false,
    address: undefined,
  });

  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const isCorrectNetwork = chainId === 11155111; // Sepolia

  const { data: cohortCount, refetch: refetchCount } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CohortFacetABI.abi,
    functionName: "getCohortCount",
    query: {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      staleTime: 0,
      gcTime: 0,
    },
  });

  const fetchCohorts = useCallback(async () => {
    if (!isConnected || !isCorrectNetwork || !publicClient) {
      setState((prev) => ({
        ...prev,
        cohorts: [],
        isLoading: false,
        isConnected,
        isCorrectNetwork,
        address,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      if (!cohortCount || Number(cohortCount) === 0) {
        setState({
          cohorts: [],
          isLoading: false,
          error: null,
          isConnected,
          isCorrectNetwork,
          address,
        });
        return;
      }

      const cohortsData: Cohort[] = [];
      for (let i = 1; i <= Number(cohortCount); i++) {
        try {
          const cohortData = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CohortFacetABI.abi,
            functionName: "getCohort",
            args: [i],
          });

          const cohortTracks = await publicClient.readContract({
            address: CONTRACT_ADDRESS,
            abi: CohortFacetABI.abi,
            functionName: "getCohortTracks",
            args: [i],
          });

          if (cohortData) {
            let id, totalStudents, startDate, endDate;
            if (Array.isArray(cohortData)) {
              [id, , totalStudents, startDate, endDate] = cohortData;
            } else if (
              cohortData &&
              typeof cohortData === "object" &&
              "id" in cohortData &&
              "totalStudents" in cohortData &&
              "startDate" in cohortData &&
              "endDate" in cohortData
            ) {
              id = cohortData.id;
              totalStudents = cohortData.totalStudents;
              startDate = cohortData.startDate;
              endDate = cohortData.endDate;
            } else {
              continue;
            }

            if (Number(startDate) === 0 || Number(endDate) === 0) {
              continue;
            }

            const startDateObj = new Date(Number(startDate) * 1000);
            const endDateObj = new Date(Number(endDate) * 1000);
            const currentDate = new Date();

            let status: "active" | "completed" | "upcoming";
            if (currentDate < startDateObj) {
              status = "upcoming";
            } else if (currentDate > endDateObj) {
              status = "completed";
            } else {
              status = "active";
            }

            const cohort: Cohort = {
              id: id?.toString() || i.toString(),
              name: `Cohort ${id?.toString() || i}`,
              startDate: startDateObj.toISOString().split("T")[0],
              endDate: endDateObj.toISOString().split("T")[0],
              students: Number(totalStudents),
              status,
              tracks: Array.isArray(cohortTracks)
                ? cohortTracks.map((t) => Number(t))
                : [],
            };

            cohortsData.push(cohort);
          }
        } catch (error) {
          console.error(`Error fetching cohort ${i}:`, error);
        }
      }

      setState({
        cohorts: cohortsData,
        isLoading: false,
        error: null,
        isConnected,
        isCorrectNetwork,
        address,
      });
    } catch (error) {
      console.error("Error fetching cohorts:", error);
      setState({
        cohorts: [],
        isLoading: false,
        error:
          error instanceof Error ? error : new Error("Failed to fetch cohorts"),
        isConnected,
        isCorrectNetwork,
        address,
      });
    }
  }, [cohortCount, publicClient, isConnected, isCorrectNetwork, address]);

  useEffect(() => {
    fetchCohorts();
  }, [fetchCohorts, refreshKey]);

  useEffect(() => {
    if (refreshKey > 0) {
      console.log("Refetching cohorts due to refreshKey change:", refreshKey);
      refetchCount();
    }
  }, [refreshKey, refetchCount]);

  const manualRefetch = useCallback(async () => {
    console.log("Manual refetch triggered");
    await refetchCount();
    await fetchCohorts();
  }, [refetchCount, fetchCohorts]);

  return { ...state, refetch: manualRefetch };
};
