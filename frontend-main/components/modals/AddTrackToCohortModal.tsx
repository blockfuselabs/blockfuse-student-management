"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAddTrackToCohort } from "@/lib/hooks/useAddTrackToCohort";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  cohortId: number;
  cohortName: string;
  existingTracks: number[];
  onTrackAdded?: () => void; // New callback for refreshing data
};

export function AddTrackToCohortModal({
  isOpen,
  setIsOpen,
  cohortId,
  existingTracks,
  onTrackAdded,
}: Props) {
  const TRACK_OPTIONS = [
    { value: 0, label: "web2" },
    { value: 1, label: "web3" },
  ];

  const availableTracks = TRACK_OPTIONS.filter(
    (track) => !existingTracks.includes(track.value)
  );

  const [selectedTrack, setSelectedTrack] = React.useState<number | "">("");
  const { addTrackToCohort, isLoading, isSuccess, error, resetState } =
    useAddTrackToCohort();

  // Reset form and hook state when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedTrack("");
      resetState();
    }
  }, [isOpen, resetState]);

  // Handle success - close modal and refresh list
  React.useEffect(() => {
    if (isSuccess) {
      console.log("Track addition successful, closing modal and refreshing data");
      setTimeout(() => {
        setIsOpen(false);
        if (onTrackAdded) {
          onTrackAdded();
        }
      }, 1000); // 1-second delay to allow blockchain update
    }
  }, [isSuccess, setIsOpen, onTrackAdded]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedTrack === "") {
      return;
    }
    try {
      await addTrackToCohort(cohortId, Number(selectedTrack));
    } catch (err) {
      console.error("Error adding track:", err);
    }
  };

  const isFormValid = selectedTrack !== "" && availableTracks.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-sm rounded-xl p-6 bg-white border border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Add Track to Cohort
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Current Tracks
            </label>
            <div className="text-sm text-gray-600">
              {existingTracks.length > 0 ? (
                existingTracks.map((track) => (
                  <span
                    key={track}
                    className="inline-block bg-gray-100 px-2 py-1 rounded mr-2 mb-1"
                  >
                    {track === 0 ? "web2" : "web3"}
                  </span>
                ))
              ) : (
                <span className="text-gray-500">No tracks added yet</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Select Track to Add
            </label>
            <select
              value={selectedTrack}
              onChange={(e) =>
                setSelectedTrack(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-0 focus:border-gray-300"
              disabled={isLoading || availableTracks.length === 0}
              required
            >
              <option value="" disabled>
                {availableTracks.length === 0
                  ? "All tracks already added"
                  : "Select a track"}
              </option>
              {availableTracks.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {availableTracks.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                This cohort already has all available tracks.
              </p>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
              {error}
            </div>
          )}

          {isSuccess && (
            <div className="text-green-600 text-sm bg-green-50 p-2 rounded-md">
              Track added successfully! Refreshing data...
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-md bg-black text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? "Adding Track..." : "Add Track"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}