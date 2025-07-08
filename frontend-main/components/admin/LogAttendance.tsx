"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useLogAttendance } from "@/lib/hooks/useLogAttendance";
import { useGetStudent } from "@/lib/hooks/useGetStudent";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { useGetCohorts } from "@/lib/hooks/useGetCohorts";
import { useGetStudentsForCohorts } from "@/lib/hooks/useGetStudents";
import { Button } from "@/components/ui/button";
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
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Calendar,
} from "lucide-react";
import { Calendar as UiCalendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { useHasAttendance } from "@/lib/hooks/useGetAttendance";
import { toast } from "sonner";

export default function LogAttendance() {
  const isMounted = useIsMounted();
  const [selectedCohort, setSelectedCohort] = useState<string>("");
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [attendanceDate, setAttendanceDate] = useState<Date | null>(new Date());
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const hasShownSuccessToast = useRef(false);

  const { logAttendance, isLoading, isSuccess, error, resetState } =
    useLogAttendance();

  // Get cohorts
  const { cohorts } = useGetCohorts();

  // Get students for selected cohort and track
  const selectedCohortData = useMemo(() => {
    return cohorts.find((c) => c.id === selectedCohort);
  }, [cohorts, selectedCohort]);

  const cohortForStudents = useMemo(() => {
    if (!selectedCohortData) return [];
    return [selectedCohortData];
  }, [selectedCohortData]);

  const { students: cohortStudents, isLoading: isLoadingStudents } =
    useGetStudentsForCohorts(cohortForStudents);

  // Filter students by selected track
  const filteredStudents = useMemo(() => {
    if (!selectedTrack || !cohortStudents.length) return [];
    const trackNum = Number(selectedTrack);
    return cohortStudents.filter((student) => student.track === trackNum);
  }, [cohortStudents, selectedTrack]);

  // Get selected student details
  const {
    student,
    isLoading: isLoadingStudent,
    isError: isStudentError,
  } = useGetStudent(selectedStudent);

  // Convert selected date to day number (same as contract calculation)
  const selectedDay = attendanceDate
    ? Math.floor(attendanceDate.getTime() / (1000 * 60 * 60 * 24))
    : 0;

  // Check for duplicate attendance
  const {
    hasAttendance,
    refetch: refetchHasAttendance,
    isLoading: hasAttendanceLoading,
    error: hasAttendanceError,
  } = useHasAttendance(
    selectedStudent,
    Number(selectedCohort),
    Number(selectedTrack),
    selectedDay
  );

  // Debug logging
  console.log("Attendance check debug:", {
    selectedStudent,
    selectedCohort: Number(selectedCohort),
    selectedTrack: Number(selectedTrack),
    selectedDay,
    hasAttendance,
    hasAttendanceLoading,
    hasAttendanceError,
  });

  // Reset student selection when cohort or track changes
  useEffect(() => {
    setSelectedStudent("");
    setDuplicateError(null);
  }, [selectedCohort, selectedTrack]);

  // Check attendance status when student, cohort, track, or date changes
  useEffect(() => {
    setDuplicateError(null);
    if (selectedStudent && selectedCohort && selectedTrack && attendanceDate) {
      refetchHasAttendance();
    }
  }, [
    selectedStudent,
    selectedCohort,
    selectedTrack,
    attendanceDate,
    refetchHasAttendance,
  ]);

  // Refetch attendance status after successful log
  useEffect(() => {
    if (isSuccess && !hasShownSuccessToast.current) {
      hasShownSuccessToast.current = true;
      refetchHasAttendance();
      toast.success("Attendance logged successfully!");
      // Reset form after success
      setTimeout(() => {
        setSelectedStudent("");
        setDuplicateError(null);
        resetState();
        hasShownSuccessToast.current = false;
      }, 2000);
    }
  }, [isSuccess, refetchHasAttendance, resetState]);

  // Handle attendance logging
  const handleLogAttendance = async () => {
    if (
      !selectedStudent ||
      !selectedCohort ||
      !selectedTrack ||
      !attendanceDate
    ) {
      toast.error("Please select all required fields");
      return;
    }

    if (hasAttendance) {
      setDuplicateError(
        "Attendance already logged for this student on this day."
      );
      return;
    }

    setDuplicateError(null);
    resetState();
    hasShownSuccessToast.current = false;

    try {
      await logAttendance({
        studentAddress: selectedStudent,
        cohortId: Number(selectedCohort),
        track: Number(selectedTrack),
      });
    } catch (error) {
      console.error("Error logging attendance:", error);
    }
  };

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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Log Student Attendance
          </CardTitle>
          <CardDescription>
            Select cohort, track, and student to log attendance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Cohort Selection */}
            <div className="space-y-2">
              <Label htmlFor="cohort">Cohort</Label>
              <Select value={selectedCohort} onValueChange={setSelectedCohort}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a cohort" />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((cohort) => (
                    <SelectItem key={cohort.id} value={cohort.id}>
                      {cohort.name} ({cohort.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Track Selection */}
            <div className="space-y-2">
              <Label htmlFor="track">Track</Label>
              <Select
                value={selectedTrack}
                onValueChange={setSelectedTrack}
                disabled={!selectedCohort}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a track" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCohortData?.tracks.map((track) => (
                    <SelectItem key={track} value={track.toString()}>
                      {track === 0
                        ? "Web2"
                        : track === 1
                        ? "Web3"
                        : `Track ${track}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Student Selection */}
            <div className="space-y-2">
              <Label htmlFor="student">Student</Label>
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
                disabled={!selectedTrack || isLoadingStudents}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingStudents
                        ? "Loading students..."
                        : filteredStudents.length === 0
                        ? "No students found"
                        : "Choose a student"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {filteredStudents.map((student) => (
                    <SelectItem
                      key={student.studentAddress}
                      value={student.studentAddress}
                    >
                      {student.firstname} {student.lastname} ({student.username}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingStudents && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading students...
                </div>
              )}
              {!isLoadingStudents &&
                filteredStudents.length === 0 &&
                selectedTrack && (
                  <div className="text-sm text-gray-500">
                    No students found for this cohort and track
                  </div>
                )}
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="attendanceDate">Attendance Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="attendanceDate"
                    variant="outline"
                    className="w-full justify-between"
                    type="button"
                  >
                    {attendanceDate
                      ? format(attendanceDate, "PPP")
                      : "Select date"}
                    <Calendar className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <UiCalendar
                    mode="single"
                    selected={attendanceDate || undefined}
                    onSelect={setAttendanceDate}
                    captionLayout="dropdown"
                    required={true}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Student Information Display */}
            {isLoadingStudent && selectedStudent && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading student information...
              </div>
            )}

            {isStudentError && selectedStudent && (
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
                    {/* Attendance Status Indicator */}
                    {attendanceDate &&
                      selectedStudent &&
                      selectedCohort &&
                      selectedTrack &&
                      (hasAttendance === undefined ? (
                        <span className="ml-3 text-xs text-gray-500 flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Checking attendance...
                        </span>
                      ) : hasAttendance ? (
                        <span className="ml-3 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Attendance Already Taken
                        </span>
                      ) : (
                        <span className="ml-3 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          No Attendance Yet
                        </span>
                      ))}
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

            {/* Duplicate Error */}
            {duplicateError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{duplicateError}</AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Attendance Check Error */}
            {hasAttendanceError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error checking attendance: {hasAttendanceError.message}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Button */}
            <Button
              onClick={handleLogAttendance}
              disabled={
                isLoading ||
                !selectedStudent ||
                !selectedCohort ||
                !selectedTrack ||
                !attendanceDate ||
                hasAttendance
              }
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging Attendance...
                </>
              ) : hasAttendance ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Attendance Already Logged
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Log Attendance
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
