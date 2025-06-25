"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/shared/Table";
import { AddCohortModal } from "@/components/modals/AddCohortModal";
import { AddTrackToCohortModal } from "@/components/modals/AddTrackToCohortModal";
import { Cohort, createCohortColumns } from "@/components/tables/CohortsColums";
import { useGetCohorts } from "@/lib/hooks/useGetCohorts";
import { RefreshCw } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CohortsPage = () => {
  const [addCohortModalOpen, setAddCohortModalOpen] = useState(false);
  const [addTrackModalOpen, setAddTrackModalOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const {
    cohorts,
    isLoading,
    error,
    isConnected,
    isCorrectNetwork,
    refetch,
  } = useGetCohorts(refreshKey);

  // Handle add track action from table
  const handleAddTrack = useCallback((cohort: Cohort) => {
    setSelectedCohort(cohort);
    setAddTrackModalOpen(true);
  }, []);

  // Refresh function
  const handleRefresh = useCallback(async () => {
    console.log("Refreshing cohorts data...");
    setRefreshKey((prev) => prev + 1);
    if (refetch) {
      await refetch();
    }
  }, [refetch]);

  // Handle cohort added
  const handleCohortAdded = useCallback(async () => {
    console.log("Cohort added callback triggered");
    toast.success("Cohort created successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
    await handleRefresh();
  }, [handleRefresh]);

  // Handle track added
  const handleTrackAdded = useCallback(async () => {
    console.log("Track added callback triggered");
    toast.success("Track added successfully!", {
      position: "top-right",
      autoClose: 3000,
    });
    await handleRefresh();
  }, [handleRefresh]);

  // Create columns with the add track callback
  const cohortColumns = createCohortColumns(handleAddTrack);

  // Render different content based on connection status
  const renderContent = () => {
    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Cohorts
            </h2>
            <p className="text-gray-600">{error.message}</p>
            <Button onClick={handleRefresh} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    

  

    return (
      <Table
        data={cohorts}
        columns={cohortColumns}
        title=""
        searchable={false}
        exportable={false}
        isLoading={isLoading}
      />
    );
  };

  return (
    <div className="p-6 h-screen bg-white rounded-xl">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="flex w-full justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Cohorts Management
          </h1>
          <p className="text-gray-400 mt-1">
            Create, organize, and manage student cohorts.
          </p>
        </div>
        <div className="flex gap-2 items-center">
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
            onClick={() => setAddCohortModalOpen(true)}
            disabled={!isConnected || !isCorrectNetwork}
          >
            Add new
          </Button>
        </div>
      </div>

      <div className="mt-7 w-full">{renderContent()}</div>

      <AddCohortModal
        isOpen={addCohortModalOpen}
        setIsOpen={setAddCohortModalOpen}
        onCohortAdded={handleCohortAdded}
      />

      {selectedCohort && (
        <AddTrackToCohortModal
          isOpen={addTrackModalOpen}
          setIsOpen={() => {
            setAddTrackModalOpen(false);
            setSelectedCohort(null);
          }}
          cohortId={parseInt(selectedCohort.id)}
          cohortName={selectedCohort.name}
          existingTracks={selectedCohort.tracks}
          onTrackAdded={handleTrackAdded}
        />
      )}
    </div>
  );
};

export default CohortsPage;