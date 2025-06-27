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
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, Loader2, Star } from "lucide-react";
import { useRecordStudentAssessment } from "@/lib/hooks/useRecordStudentAssessment";
import { useGetStudent } from "@/lib/hooks/useGetStudent";
import { toast } from "sonner";

type Props = {
 isOpen: boolean;
 setIsOpen: (open: boolean) => void;
 studentAddress: string;
 refetchStudents?: () => void;
};

export function AddScoreModal({ isOpen, setIsOpen, studentAddress, refetchStudents }: Props) {
 const [score, setScore] = React.useState("");
 const [isSubmitting, setIsSubmitting] = React.useState(false);

 const { recordAssessment } = useRecordStudentAssessment();
 const { student, isLoading: isLoadingStudent } = useGetStudent(studentAddress);

 const handleClose = () => {
  if (!isSubmitting) {
   setIsOpen(false);
   setScore("");
  }
 };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!score || isNaN(Number(score))) {
   toast.error("Please enter a valid score");
   return;
  }

  const scoreValue = Number(score);
  if (scoreValue < -100 || scoreValue > 100) {
   toast.error("Score must be between -100 and 100");
   return;
  }

  setIsSubmitting(true);

  try {
   await recordAssessment({
    address: studentAddress as `0x${string}`,
    score: scoreValue,
   });

   toast.success(`Score of ${scoreValue} added successfully!`);
   setTimeout(() => {
    setScore("");
    setIsOpen(false);
    if (refetchStudents) refetchStudents();
   }, 1000);
  } catch (error) {
   console.error("Error recording assessment:", error);
   toast.error("Failed to record assessment. Please try again.");
  } finally {
   setIsSubmitting(false);
  }
 };

 const isFormValid = score && !isNaN(Number(score)) && Number(score) >= -100 && Number(score) <= 100;

 return (
  <Dialog open={isOpen} onOpenChange={handleClose}>
   <DialogContent className="max-w-md rounded-xl p-6 bg-white border border-gray-200 shadow-xl">
    <DialogHeader>
     <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
      <Star className="h-5 w-5 text-yellow-500" />
      Add Student Score
     </DialogTitle>
    </DialogHeader>
    <DialogDescription>
     Please enter a score to add or deduct from the student. Use positive values for rewards and negative for deductions.
    </DialogDescription>

    {isLoadingStudent ? (
     <div className="flex items-center justify-center py-8">
      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      <span className="ml-2 text-gray-600">Loading student details...</span>
     </div>
    ) : student ? (
     <div className="space-y-4">
      {/* Student Info Card */}
      <div className="bg-gray-50 rounded-lg p-4 border">
       <h3 className="font-medium text-gray-900 mb-2">Student Details</h3>
       <div className="space-y-1 text-sm text-gray-600">
        <div><span className="font-medium">Name:</span> {student.firstname} {student.lastname}</div>
        <div><span className="font-medium">Current Score:</span> {Number(student.finalScore)}</div>
        <div><span className="font-medium">Status:</span>
         <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${student.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}>
          {student.isActive ? "Active" : "Inactive"}
         </span>
        </div>
       </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
       {/* Score Input */}
       <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
         Score <span className="text-red-500">*</span>
        </label>
        <div className="relative">
         <Input
          type="number"
          placeholder="Enter score (-100 to 100)"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="rounded-md border-gray-300 text-gray-900 w-full pr-10"
          disabled={isSubmitting}
          min="-100"
          max="100"
          step="1"
          required
         />
         <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <Star className="h-4 w-4 text-gray-400" />
         </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
         Enter a score between -100 and 100. This will be added to the student&apos;s current final score.
        </p>
       </div>

       {/* Submit Button */}
       <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        disabled={!isFormValid || isSubmitting}
       >
        {isSubmitting ? (
         <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Adding Score...
         </>
        ) : (
         <>
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Add Score
         </>
        )}
       </Button>
      </form>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
       <div className="flex items-start">
        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
        <div className="text-sm text-blue-800">
         <p className="font-medium">Score Addition</p>
         <p className="mt-1">
          The new score will be added to the student&apos;s current final score.
          Use positive values for good performance and negative values for deductions.
         </p>
        </div>
       </div>
      </div>
     </div>
    ) : (
     <div className="text-center py-8 text-gray-500">
      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
      <p>Student not found or inactive</p>
     </div>
    )}
   </DialogContent>
  </Dialog>
 );
} 