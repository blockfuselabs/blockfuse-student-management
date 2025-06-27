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
import { useRegisterStudent } from "@/lib/hooks/useRegisterStudent";
import { useGetCohorts } from "@/lib/hooks/useGetCohorts";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  refetchStudents?: () => void;
};

export function AddStudentModal({ isOpen, setIsOpen, refetchStudents }: Props) {
  // Form state
  const [firstname, setFirstname] = React.useState("");
  const [lastname, setLastname] = React.useState("");
  const [twitter, setTwitter] = React.useState("");
  const [linkedin, setLinkedin] = React.useState("");
  const [github, setGithub] = React.useState("");
  const [email, setEmail] = React.useState("");

  // Define Track type - should match your contract enum
  type Track = 0 | 1; // 0 = web2, 1 = web3
  // Or use an enum or union type if needed

  const [track, setTrack] = React.useState<number | "">("");
  const [cohort, setCohort] = React.useState<number | "">("");
  const [studentAddress, setStudentAddress] = React.useState("");


  const [trackOptions, setTrackOptions] = React.useState<{ value: number; label: string }[]>([]);

  // Get real cohort data and filter out completed cohorts
  const { cohorts, isLoading: isLoadingCohorts } = useGetCohorts();

  const {
    registerStudent,
    isLoading,
    isSuccess,
    error,
    reset,
    transactionHash,
    isConfirming
  } = useRegisterStudent();

  const handleClose = useCallback(() => {
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
    setEmail("");
    // Reset hook state if defined
    if (typeof reset === 'function') reset();
    // Refetch students if provided
    if (typeof refetchStudents === 'function') refetchStudents();
  }, [setIsOpen, reset, refetchStudents]);

  // Filter out completed cohorts and create options
  const cohortOptions = React.useMemo(() => {
    return cohorts
      .filter(cohort => cohort.status !== "completed")
      .map(cohort => ({
        value: parseInt(cohort.id),
        label: `${cohort.name} (${cohort.status}) - ${cohort.startDate} to ${cohort.endDate}`
      }));
  }, [cohorts]);

  // Set track options from cohorts array when cohort changes
  React.useEffect(() => {
    if (!cohort) {
      setTrackOptions([]);
      return;
    }
    const selectedCohort = cohorts.find(c => parseInt(c.id) === Number(cohort));
    if (selectedCohort && Array.isArray(selectedCohort.tracks)) {
      const options = selectedCohort.tracks.map((track) => ({
        value: track,
        label: track === 0 ? "web2" : track === 1 ? "web3" : `Track ${track}`,
      }));
      setTrackOptions(options);
    } else {
      setTrackOptions([]);
    }
  }, [cohort, cohorts]);

  // Handle successful registration
  React.useEffect(() => {
    if (isSuccess && transactionHash) {
      handleClose();
    }
  }, [handleClose, isSuccess, transactionHash]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      // Handle error
    }
  }, [error]);

  // Debug: Log all information about the selected cohort when it changes
  React.useEffect(() => {
    if (!cohort) return;
    // Find the cohort object from the cohorts array
    const selectedCohortObj = cohorts.find(c => parseInt(c.id) === Number(cohort));
    // Find the cohort option from cohortOptions
    const selectedCohortOption = cohortOptions.find(opt => opt.value === Number(cohort));
    console.log('--- Cohort Debug Info ---');
    console.log('Selected cohort value:', cohort);
    console.log('Type of selected cohort:', typeof cohort);
    console.log('Selected cohort object from cohorts:', selectedCohortObj);
    console.log('Selected cohort option from cohortOptions:', selectedCohortOption);
    console.log('All cohortOptions:', cohortOptions);
    console.log('All cohorts:', cohorts);
    console.log('-------------------------');
  }, [cohort, cohorts, cohortOptions]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Student registered successfully!");
      setTimeout(() => {
        setIsOpen(false);
        if (refetchStudents) refetchStudents();
      }, 1000);
    }
  }, [isSuccess, setIsOpen, refetchStudents]);

  React.useEffect(() => {
    if (error) {
      toast.error("Registration failed: " + error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate required fields
    if (!firstname.trim() || !lastname.trim() || !studentAddress.trim() || track === "" || cohort === "") {
      return;
    }

    try {
      await registerStudent({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim(),
        twitter: twitter.trim(),
        linkedin: linkedin.trim(),
        github: github.trim(),
        track: track as Track,
        cohort: cohort as number,
        studentAddress: studentAddress.trim(),
      });
    } catch (err) {
      console.error("Error in handleSubmit:", err);
    }
  };

  const isFormValid =
    firstname.trim() &&
    lastname.trim() &&
    studentAddress.trim() &&
    track !== "" &&
    cohort !== "";

  const isSubmitting = isLoading || isLoadingCohorts;
  const getLoadingText = () => {
    if (isConfirming) return "Confirming...";
    if (isLoading) return "Registering...";
    return "Register Student";
  };

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
            <label className="block text-sm font-medium mb-1 text-gray-700">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter first name"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              className="rounded-md border-gray-300 text-gray-900 w-full"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Last Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter last name"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              className="rounded-md border-gray-300 text-gray-900 w-full"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Student Address */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Student Wallet Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="0x..."
              value={studentAddress}
              onChange={(e) => setStudentAddress(e.target.value)}
              className="rounded-md border-gray-300 text-gray-900 w-full font-mono text-sm"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Cohort Selection */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Cohort <span className="text-red-500">*</span>
            </label>
            <select
              value={cohort}
              onChange={(e) => setCohort(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
              required
            >
              <option value="" disabled>
                {isLoadingCohorts ? "Loading cohorts..." : "Select Cohort"}
              </option>
              {cohortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {cohortOptions.length === 0 && !isLoadingCohorts && (
              <p className="text-sm text-gray-500 mt-1">
                No active cohorts available. Please create a cohort first.
              </p>
            )}
          </div>

          {/* Track Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Track <span className="text-red-500">*</span>
            </label>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting || !cohort}
              required
            >
              <option value="" disabled>Select Track</option>
              {trackOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {/* Show message if no tracks available for selected cohort */}
            {cohort && trackOptions.length === 0 && (
              <div className="text-xs text-red-500 mt-1">No tracks available for this cohort. Please add tracks first.</div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md border-gray-300 text-gray-900 w-full"
              disabled={isSubmitting}
              required
            />
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
              disabled={isSubmitting}
            />

            <Input
              type="text"
              placeholder="LinkedIn profile URL"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="rounded-md border-gray-300 text-gray-900 w-full"
              disabled={isSubmitting}
            />

            <Input
              type="text"
              placeholder="GitHub username or URL"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="rounded-md border-gray-300 text-gray-900 w-full"
              disabled={isSubmitting}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Registration Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Transaction Status */}
          {isLoading && !error && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />
              <span className="text-sm text-blue-700">
                {isConfirming ? "Confirming transaction..." : "Processing registration..."}
              </span>
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
          <div className="flex gap-3 pt-4">
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
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {getLoadingText()}
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Register Student
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}