"use client";

import { useState, useEffect, useRef } from "react";
import { useLogAttendance } from "@/hooks/useLogAttendance";
import { useGetStudent } from "@/hooks/useGetStudent";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2, User } from "lucide-react";

export default function LogAttendance() {
  const isMounted = useIsMounted();
  const [studentAddress, setStudentAddress] = useState("");
  const [cohortId, setCohortId] = useState("");
  const [track, setTrack] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const hasAutoFilled = useRef(false);

  const { logAttendance, isLoading, isSuccess, error, resetError } =
    useLogAttendance();
  const {
    student,
    isLoading: isLoadingStudent,
    isError: isStudentError,
  } = useGetStudent(studentAddress);

  // Auto-fill cohort and track when student data is loaded
  useEffect(() => {
    if (student && !hasAutoFilled.current) {
      setCohortId(student.cohort.toString());
      setTrack(student.track.toString());
      hasAutoFilled.current = true;
    }
  }, [student]);

  // Reset auto-fill flag when student address changes
  useEffect(() => {
    hasAutoFilled.current = false;
  }, [studentAddress]);

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Log Student Attendance
            </CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!studentAddress) {
      errors.studentAddress = "Student address is required";
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(studentAddress)) {
      errors.studentAddress = "Invalid Ethereum address format";
    }

    if (!cohortId) {
      errors.cohortId = "Cohort ID is required";
    } else if (
      isNaN(Number(cohortId)) ||
      Number(cohortId) < 1 ||
      Number(cohortId) > 255
    ) {
      errors.cohortId = "Cohort ID must be a number between 1 and 255";
    }

    if (!track) {
      errors.track = "Track is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    resetError();

    await logAttendance({
      studentAddress,
      cohortId: Number(cohortId),
      track: Number(track),
    });
  };

  const handleReset = () => {
    setStudentAddress("");
    setCohortId("");
    setTrack("");
    setFormErrors({});
    resetError();
    hasAutoFilled.current = false;
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Log Student Attendance
          </CardTitle>
          <CardDescription>
            Log attendance for a student in a specific cohort and track
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Address */}
            <div className="space-y-2">
              <Label htmlFor="studentAddress">Student Address</Label>
              <Input
                id="studentAddress"
                type="text"
                placeholder="0x..."
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
                className={formErrors.studentAddress ? "border-red-500" : ""}
              />
              {formErrors.studentAddress && (
                <p className="text-sm text-red-500">
                  {formErrors.studentAddress}
                </p>
              )}
            </div>

            {/* Student Information Display */}
            {isLoadingStudent && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading student information...
              </div>
            )}

            {isStudentError && studentAddress && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Student not found or address is invalid
                </AlertDescription>
              </Alert>
            )}

            {student && (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">
                      Student Information
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Name:</span>
                      <span className="ml-2 font-medium">
                        {student.firstname} {student.lastname}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Username:</span>
                      <span className="ml-2 font-medium">
                        {student.username}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`ml-2 font-medium ${
                          student.isActive ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {student.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Final Score:</span>
                      <span className="ml-2 font-medium">
                        {student.finalScore}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cohort ID */}
            <div className="space-y-2">
              <Label htmlFor="cohortId">Cohort ID</Label>
              <Input
                id="cohortId"
                type="number"
                placeholder="1"
                value={cohortId}
                onChange={(e) => setCohortId(e.target.value)}
                className={formErrors.cohortId ? "border-red-500" : ""}
              />
              {formErrors.cohortId && (
                <p className="text-sm text-red-500">{formErrors.cohortId}</p>
              )}
            </div>

            {/* Track */}
            <div className="space-y-2">
              <Label htmlFor="track">Track</Label>
              <Select value={track} onValueChange={setTrack}>
                <SelectTrigger
                  className={formErrors.track ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Web2</SelectItem>
                  <SelectItem value="1">Web3</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.track && (
                <p className="text-sm text-red-500">{formErrors.track}</p>
              )}
            </div>

            {/* Success Message */}
            {isSuccess && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Attendance logged successfully!
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Log Attendance
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
