"use client";

import { Button } from "@/components/ui/button";
import React, { useState, useCallback } from "react";
import { Table } from "@/components/shared/Table";
// import { AddCohorModal } from "@/components/modals/AddCohortModal";
import { AddCohortModal } from "@/components/modals/AddCohortModal";
import { Cohort, cohortcolumns } from "@/components/tables/CohortsColums";
import { useGetCohorts } from "@/lib/hooks/useGetCohorts";
import { RefreshCw } from "lucide-react";

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

const CohortsPage = () => {
  const [addCohortModalOpen, setAddCohortModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch cohorts from blockchain
  const {
    cohorts: blockchainCohorts,
    isLoading,
    error,
  } = useGetCohorts(refreshKey);

  // Transform blockchain data to match our Cohort type
  const cohortsData: Cohort[] = blockchainCohorts.map((cohort) => ({
    id: cohort.id,
    name: `Cohort ${toRomanNumeral(cohort.id)}`, // Generate name from ID with Roman numeral
    startDate: cohort.startDate,
    endDate: cohort.endDate,
    students: cohort.totalStudents,
    tracks: cohort.tracks,
    duration: cohort.duration,
    status: "active" as const, // This will be calculated in the column render
  }));

  // Refresh function
  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Handle cohort added
  const handleCohortAdded = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  if (error) {
    return (
      <div className="p-6 h-screen bg-white rounded-xl">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Cohorts
            </h2>
            <p className="text-gray-600">{error}</p>
            <Button onClick={handleRefresh} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-screen bg-white rounded-xl">
      <div className="flex w-full justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Cohorts Management
          </h1>
          <p className="text-gray-400 mt-1">
            Create, organize, and manage student cohorts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="lg"
            variant="outline"
            className="flex text-base h-[44px] w-[44px] gap-1 items-center"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            size="lg"
            className="flex text-base h-[44px] w-[130px] gap-1 items-center"
            onClick={() => setAddCohortModal(true)}
          >
            Add new
          </Button>
        </div>
      </div>

      <div className="mt-7 w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
              <p className="text-gray-600">Loading cohorts...</p>
            </div>
          </div>
        ) : (
          <>
            {cohortsData.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Cohorts Found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first cohort to get started.
                  </p>
                  <Button onClick={() => setAddCohortModal(true)}>
                    Create Cohort I
                  </Button>
                </div>
              </div>
            ) : (
              <Table
                data={cohortsData}
                columns={cohortcolumns}
                title=""
                searchable={false}
                exportable={false}
              />
            )}
          </>
        )}
      </div>

      <AddCohortModal
        isOpen={addCohortModalOpen}
        setIsOpen={setAddCohortModal}
        onCohortAdded={handleCohortAdded}
      />
    </div>
  );
};

export default CohortsPage;
