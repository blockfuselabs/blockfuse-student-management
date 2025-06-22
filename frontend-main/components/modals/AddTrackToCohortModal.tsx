"use client";

import * as React from "react";
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useAddTrackToCohort } from "@/lib/hooks/useAddTrackToCohort";
import { toast } from "sonner";

type Props = {
 isOpen: boolean;
 setIsOpen: (open: boolean) => void;
 cohortId: number;
 cohortName: string;
 existingTracks: number[]; // Array of track numbers already in the cohort
};

export function AddTrackToCohortModal({ isOpen, setIsOpen, cohortId, cohortName, existingTracks }: Props) {
 const TRACK_OPTIONS = [
  { value: 0, label: "web2" },
  { value: 1, label: "web3" },
 ];

 // Filter out tracks that already exist in the cohort
 const availableTracks = TRACK_OPTIONS.filter(track => !existingTracks.includes(track.value));

 const [selectedTrack, setSelectedTrack] = React.useState<number | "">("");

 const { addTrackToCohort, isPending, isConfirming, isSuccess, error, transactionHash } = useAddTrackToCohort();

 // Handle successful track addition
 React.useEffect(() => {
  if (isSuccess && transactionHash) {
   toast.success("Track added successfully!", {
    description: `Transaction: ${transactionHash.slice(0, 10)}...`
   });
   handleClose();
  }
 }, [isSuccess, transactionHash]);

 // Handle errors
 React.useEffect(() => {
  if (error) {
   toast.error("Failed to add track", {
    description: error
   });
  }
 }, [error]);

 const handleClose = () => {
  setIsOpen(false);
  setSelectedTrack("");
 };

 const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (selectedTrack === "") {
   toast.error("Please select a track");
   return;
  }

  try {
   await addTrackToCohort(cohortId, selectedTrack);
  } catch (err) {
   console.error("Error in handleSubmit:", err);
  }
 };

 const isSubmitting = isPending || isConfirming;

 return (
  <Dialog open={isOpen} onOpenChange={handleClose}>
   <DialogContent className="max-w-sm rounded-xl p-6 bg-white border border-gray-200 shadow-xl">
    <DialogHeader>
     <DialogTitle className="text-lg font-semibold text-gray-900">
      Add Track to Cohort
     </DialogTitle>
     <DialogDescription className="text-sm text-gray-600">
      Add a track to {cohortName}
     </DialogDescription>
    </DialogHeader>

    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
     {/* Current Tracks Display */}
     <div>
      <label className="block text-sm font-medium mb-1">Current Tracks</label>
      <div className="text-sm text-gray-600">
       {existingTracks.length > 0 ? (
        existingTracks.map(track => (
         <span key={track} className="inline-block bg-gray-100 px-2 py-1 rounded mr-2 mb-1">
          {track === 0 ? "web2" : "web3"}
         </span>
        ))
       ) : (
        <span className="text-gray-500">No tracks added yet</span>
       )}
      </div>
     </div>

     {/* Track Selection */}
     <div>
      <label className="block text-sm font-medium mb-1">Select Track to Add</label>
      <select
       value={selectedTrack}
       onChange={(e) => setSelectedTrack(e.target.value === "" ? "" : Number(e.target.value))}
       className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
       disabled={isSubmitting || availableTracks.length === 0}
       required
      >
       <option value="" disabled>
        {availableTracks.length === 0 ? "All tracks already added" : "Select a track"}
       </option>
       {availableTracks.map(option => (
        <option key={option.value} value={option.value}>
         {option.label}
        </option>
       ))}
      </select>
      {availableTracks.length === 0 && (
       <p className="text-sm text-gray-500 mt-1">
        This cohort already has all available tracks.
       </p>
      )}
     </div>

     {/* Error Display */}
     {error && (
      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
       <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
       <span className="text-sm text-red-700">{error}</span>
      </div>
     )}

     {/* Success Display */}
     {isSuccess && (
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
       <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
       <span className="text-sm text-green-700">Track added successfully!</span>
      </div>
     )}

     {/* Submit Buttons */}
     <div className="flex gap-3 pt-2">
      <Button
       type="button"
       variant="outline"
       className="flex-1"
       onClick={handleClose}
       disabled={isSubmitting}
      >
       Cancel
      </Button>
      <Button
       type="submit"
       className="flex-1 bg-black text-white hover:bg-gray-800 transition"
       disabled={selectedTrack === "" || isSubmitting || availableTracks.length === 0}
      >
       {isSubmitting ? (
        <>
         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
         {isPending ? "Adding..." : "Confirming..."}
        </>
       ) : (
        <>
         <CheckCircle2 className="mr-2 h-4 w-4" />
         Add Track
        </>
       )}
      </Button>
     </div>
    </form>
   </DialogContent>
  </Dialog>
 );
} 