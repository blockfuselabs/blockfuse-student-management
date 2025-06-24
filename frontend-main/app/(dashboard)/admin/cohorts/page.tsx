"use client";

import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { Table } from "@/components/shared/Table";
// import { AddCohorModal } from "@/components/modals/AddCohortModal";
import { AddCohortModal } from "@/components/modals/AddCohortModal";
import { AddTrackToCohortModal } from "@/components/modals/AddTrackToCohortModal";
import { Cohort, createCohortColumns } from "@/components/tables/CohortsColums";
import { useGetCohorts } from "@/lib/hooks/useGetCohorts";
import { useChainId } from "wagmi";

const CohortsPage = () => {
  const [addCohortModalOpen, setAddCohortModal] = useState(false);
  const [addTrackModalOpen, setAddTrackModalOpen] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState<Cohort | null>(null);
  const {
    cohorts,
    isLoading,
    cohortCount,
    error,
    isConnected,
    isCorrectNetwork,
    address,
    refetch,
  } = useGetCohorts();
  const chainId = useChainId();

  // Debug network status (console only)
  useEffect(() => {
    console.log("🌐 Network Debug:", {
      chainId,
      expectedChainId: 11155111, // Sepolia
      isCorrectNetwork: chainId === 11155111,
      hasError: !!error,
      errorMessage: error?.message,
      isConnected,
      address,
      cohortCount,
    });
  }, [chainId, error, isConnected, address, cohortCount]);

  // Refresh data when modal is closed (indicating a new cohort might have been created)
  const handleModalClose = () => {
    setAddCohortModal(false);
    // The useGetCohorts hook will automatically refetch when cohortCount changes
  };

  // Handle add track modal close
  const handleAddTrackModalClose = () => {
    setAddTrackModalOpen(false);
    setSelectedCohort(null);
  };

  // Handle add track action from table
  const handleAddTrack = (cohort: Cohort) => {
    setSelectedCohort(cohort);
    setAddTrackModalOpen(true);
  };

  // Create columns with the add track callback
  const cohortcolumns = createCohortColumns(handleAddTrack);

  // Render different content based on connection status
  const renderContent = () => {
    if (!isConnected) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="text-gray-500 mb-2">Wallet not connected</div>
            <div className="text-sm text-gray-400">
              Please connect your wallet to view cohorts
            </div>
          </div>
        </div>
      );
    }

    if (!isCorrectNetwork) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="text-gray-500 mb-2">Wrong network</div>
            <div className="text-sm text-gray-400">
              Please switch to Sepolia testnet
            </div>
          </div>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Loading cohorts...</div>
        </div>
      );
    }

    if (cohorts.length === 0) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">
            {error ? (
              <div>
                <div>Error loading cohorts: {error.message}</div>
                <div className="text-sm mt-2">
                  Please check your network connection
                </div>
              </div>
            ) : (
              "No cohorts found. Create your first cohort!"
            )}
          </div>
        </div>
      );
    }

    return (
      <Table
        data={cohorts}
        columns={cohortcolumns}
        title=""
        searchable={false}
        exportable={false}
      />
    );
  };

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

        <Button
          size="lg"
          className="flex text-base h-[44px] w-[130px] gap-1 items-center"
          onClick={() => setAddCohortModal(true)}
          disabled={!isConnected || !isCorrectNetwork}
        >
          Add new
        </Button>
      </div>

      <div className="mt-7 w-full">{renderContent()}</div>

      <AddCohortModal
        isOpen={addCohortModalOpen}
        setIsOpen={handleModalClose}
        onCohortAdded={refetch}
      />

      {selectedCohort && (
        <AddTrackToCohortModal
          isOpen={addTrackModalOpen}
          setIsOpen={handleAddTrackModalClose}
          cohortId={parseInt(selectedCohort.id)}
          cohortName={selectedCohort.name}
          existingTracks={selectedCohort.tracks}
        />
      )}
    </div>
  );
};

export default CohortsPage;
