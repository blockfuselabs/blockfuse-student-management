"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useRegisterStudent, getTrackOptions} from "@/lib/hooks/useRegisterStudent";
import { toast } from "sonner"; // or your preferred toast library

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export function AddStudentModal({ isOpen, setIsOpen }: Props) {
  // Form state
  const [firstname, setFirstname] = React.useState("");
  const [lastname, setLastname] = React.useState("");
  const [twitter, setTwitter] = React.useState("");
  const [linkedin, setLinkedin] = React.useState("");
  const [github, setGithub] = React.useState("");
 
  type Track = number; // Or use an enum or union type if needed
  
    const [track, setTrack] = React.useState<Track | "">("");
  const [cohort, setCohort] = React.useState<number | "">("");
  const [studentAddress, setStudentAddress] = React.useState("");

  // Define TrackOption type
  type TrackOption = {
    value: number;
    label: string;
  };

  // Get track options
  const trackOptions = getTrackOptions();

  // Cohort options - you might want to fetch these dynamically from your contract
  const cohortOptions = [
    { value: 1, label: "Cohort 1 - Web Development 2024" },
    { value: 2, label: "Cohort 2 - Mobile Development 2024" },
    { value: 3, label: "Cohort 3 - Blockchain Development 2024" },
  ];

  const {
    registerStudent,
    isLoading,
    isSuccess,
    error,
    reset,
    transactionHash
  } = useRegisterStudent();

  // Handle successful registration
  React.useEffect(() => {
    if (isSuccess && transactionHash) {
      toast.success("Student registered successfully!", {
        description: `Transaction: ${transactionHash.slice(0, 10)}...`
      });
      handleClose();
    }
  }, [isSuccess, transactionHash]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      toast.error("Failed to register student", {
        description: error
      });
    }
  }, [error]);

  const handleClose = () => {
    setIsOpen(false);
    // Reset form state
    setFirstname("");
    setLastname("");
    setTwitter("");
    setLinkedin("");
    setGithub("");
    setTrack("");
    setCohort("");
    setStudentAddress("");
    // Reset hook state
    reset();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate required fields
    if (!firstname.trim() || !lastname.trim() || !studentAddress.trim() || track === "" || cohort === "") {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await registerStudent({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        twitter: twitter.trim(),
        linkedin: linkedin.trim(),
        github: github.trim(),
        track: track as Track,
        cohort: cohort as number,
        studentAddress: studentAddress.trim(),
      });
    } catch (err) {
      // Error is already handled by the hook and useEffect
      console.error("Error in handleSubmit:", err);
    }
  };

  const isFormValid = 
    firstname.trim() && 
    lastname.trim() && 
    studentAddress.trim() && 
    track !== "" && 
    cohort !== "";

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md rounded-xl p-6 bg-white border border-gray-200 shadow-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Register New Student
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter first name"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              className="rounded-md border-gray-300 text-gray-900 w-full"
              disabled={isLoading}
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter last name"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="rounded-md border-gray-300 text-gray-900 w-full"
              disabled={isLoading}
              required
            />
          </div>

          {/* Student Address */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Student Wallet Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="0x..."
              value={studentAddress}
              onChange={(e) => setStudentAddress(e.target.value)}
              className="rounded-md border-gray-300 text-gray-900 w-full font-mono text-sm"
              disabled={isLoading}
              required
            />
          </div>

          {/* Track Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Track <span className="text-red-500">*</span>
            </label>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value === "" ? "" : Number(e.target.value) as Track)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
              required
            >
              <option value="" disabled>Select Track</option>
                {trackOptions.map((option: TrackOption) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
                ))}
            </select>
          </div>

          {/* Cohort Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Cohort <span className="text-red-500">*</span>
            </label>
            <select
              value={cohort}
              onChange={(e) => setCohort(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
              required
            >
              <option value="" disabled>Select Cohort</option>
              {cohortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Social Media Fields */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Social Media </h3>
            
            <Input
              type="text"
              placeholder="Twitter handle (@username) or URL"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="rounded-md border-gray-300 text-gray-900 w-full"
              disabled={isLoading}
            />
            
            <Input
              type="text"
              placeholder="LinkedIn profile URL"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="rounded-md border-gray-300 text-gray-900 w-full"
              disabled={isLoading}
            />
            
            <Input
              type="text"
              placeholder="GitHub username or URL"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="rounded-md border-gray-300 text-gray-900 w-full"
              disabled={isLoading}
            />
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
              <span className="text-sm text-green-700">Student registered successfully!</span>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-black text-white hover:bg-gray-800 transition"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                "Register Student"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}