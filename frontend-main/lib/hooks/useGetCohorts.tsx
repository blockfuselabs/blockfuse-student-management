"use client";
import { useState, useEffect, useCallback } from "react";
import { useReadContract } from "wagmi";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";
import DiamondABI from "@/lib/contract/DiamondABI.json";

export interface CohortData {
  id: number;
  tracks: string[];
  totalStudents: number;
  startDate: number;
  endDate: number;
  duration: number;
}

export interface GetCohortsState {
  cohorts: CohortData[];
  isLoading: boolean;
  error: string | null;
}

// Helper function to convert number to Roman numeral
const toRomanNumeral = (num: number): string => {
  if (num === 0) return "0";

  const romanNumerals = [
    { value: 1000, numeral: "M" },
    { value: 900, numeral: "CM" },
    { value: 500, numeral: "D" },
    { value: 400, numeral: "CD" },
    { value: 100, numeral: "C" },
    { value: 90, numeral: "XC" },
    { value: 50, numeral: "L" },
    { value: 40, numeral: "XL" },
    { value: 10, numeral: "X" },
    { value: 9, numeral: "IX" },
    { value: 5, numeral: "V" },
    { value: 4, numeral: "IV" },
    { value: 1, numeral: "I" },
  ];

  let result = "";
  let remaining = num;

  for (const { value, numeral } of romanNumerals) {
    while (remaining >= value) {
      result += numeral;
      remaining -= value;
    }
  }

  return result;
};

export const useGetCohorts = (refreshKey: number = 0) => {
  const [state, setState] = useState<GetCohortsState>({
    cohorts: [],
    isLoading: true,
    error: null,
  });

  // Get cohort count first
  const {
    data: cohortCount,
    isLoading: countLoading,
    error: countError,
  } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "getCohortCount",
  });

  // Get all cohorts from the contract
  const {
    data: cohortsData,
    isLoading: cohortsLoading,
    error: cohortsError,
  } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: DiamondABI.abi,
    functionName: "getAllCohorts",
  });

  useEffect(() => {
    console.log("=== useGetCohorts Debug ===");
    console.log("Cohort Count:", cohortCount);
    console.log("Cohorts Data:", cohortsData);

    if (countLoading || cohortsLoading) {
      console.log("Loading cohorts data...");
      setState((prev) => ({ ...prev, isLoading: true }));
      return;
    }

    if (countError || cohortsError) {
      console.error("Error getting cohorts data:", countError || cohortsError);
      const errorMessage =
        (countError || cohortsError)?.message || "Unknown error";
      setState({
        cohorts: [],
        isLoading: false,
        error: `Failed to get cohorts data: ${errorMessage}`,
      });
      return;
    }

    if (!cohortCount || Number(cohortCount) === 0) {
      console.log("No cohorts found");
      setState({
        cohorts: [],
        isLoading: false,
        error: null,
      });
      return;
    }

    if (!cohortsData) {
      console.log("No cohorts data found");
      setState({
        cohorts: [],
        isLoading: false,
        error: null,
      });
      return;
    }

    // Parse the cohorts data
    const [ids, totalStudents, startDates, endDates, durations, tracks] =
      cohortsData as [
        bigint[],
        bigint[],
        bigint[],
        bigint[],
        bigint[],
        number[][]
      ];

    console.log("Parsed data:", {
      ids: ids.map((id) => Number(id)),
      totalStudents: totalStudents.map((students) => Number(students)),
      startDates: startDates.map((date) => Number(date)),
      endDates: endDates.map((date) => Number(date)),
      durations: durations.map((duration) => Number(duration)),
      tracks,
    });

    const cohorts: CohortData[] = [];

    // Convert track enums to strings and create cohort objects
    for (let i = 0; i < ids.length; i++) {
      const trackEnums = tracks[i] || [];
      const trackStrings = trackEnums.map((track) => {
        return track === 0 ? "web2" : "web3";
      });

      cohorts.push({
        id: Number(ids[i]),
        tracks: trackStrings,
        totalStudents: Number(totalStudents[i]),
        startDate: Number(startDates[i]),
        endDate: Number(endDates[i]),
        duration: Number(durations[i]),
      });
    }

    // Sort cohorts in hierarchical order (ascending by ID)
    cohorts.sort((a, b) => a.id - b.id);

    console.log("Final cohorts list (sorted):", cohorts);

    setState({
      cohorts,
      isLoading: false,
      error: null,
    });
  }, [
    refreshKey,
    cohortCount,
    cohortsData,
    countLoading,
    cohortsLoading,
    countError,
    cohortsError,
  ]);

  const refetch = useCallback(() => {
    // The hook will automatically refetch when refreshKey changes
  }, []);

  return { ...state, refetch, toRomanNumeral };
};
