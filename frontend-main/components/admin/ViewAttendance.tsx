"use client";

import { useState, useMemo } from "react";
import { useGetCohorts } from "@/lib/hooks/useGetCohorts";
import { useGetStudentsForCohorts } from "@/lib/hooks/useGetStudents";
import { useGetAttendanceForMultipleStudents } from "@/lib/hooks/useGetAttendance";
import { useIsMounted } from "@/lib/hooks/useIsMounted";

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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
  CalendarDays,
  UserCheck,
  UserX,
} from "lucide-react";
import { Calendar as UiCalendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";

export default function ViewAttendance() {
  const isMounted = useIsMounted();
  const [selectedCohort, setSelectedCohort] = useState<string>("");
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  // Get cohorts
  const { cohorts } = useGetCohorts();

  // Get selected cohort data
  const selectedCohortData = useMemo(() => {
    return cohorts.find((c) => c.id === selectedCohort);
  }, [cohorts, selectedCohort]);

  // Get students for selected cohort and track
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

  // Convert selected date to day number (same as contract calculation)
  const selectedDay = selectedDate
    ? Math.floor(selectedDate.getTime() / (1000 * 60 * 60 * 24))
    : 0;

  // Check attendance for all students
  const { attendanceData, isLoading: isLoadingAttendance } =
    useGetAttendanceForMultipleStudents(
      filteredStudents,
      Number(selectedCohort),
      Number(selectedTrack),
      selectedDay
    );

  // Debug logging
  console.log("ViewAttendance Debug:", {
    selectedDate,
    selectedDay,
    selectedCohort,
    selectedTrack,
    filteredStudentsLength: filteredStudents.length,
    attendanceDataKeys: Object.keys(attendanceData),
  });

  // Combine student data with attendance data
  const studentsWithAttendance = useMemo(() => {
    if (!selectedCohort || !selectedTrack || !selectedDate) return [];

    return filteredStudents.map((student) => ({
      ...student,
      hasAttendance: attendanceData[student.studentAddress],
      isCheckingAttendance: isLoadingAttendance,
    }));
  }, [
    filteredStudents,
    selectedCohort,
    selectedTrack,
    selectedDate,
    attendanceData,
    isLoadingAttendance,
  ]);

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    if (!studentsWithAttendance.length) return null;

    const totalStudents = studentsWithAttendance.length;
    const presentStudents = studentsWithAttendance.filter(
      (s) => s.hasAttendance === true
    ).length;
    const absentStudents = studentsWithAttendance.filter(
      (s) => s.hasAttendance === false
    ).length;
    const loadingStudents = studentsWithAttendance.filter(
      (s) => s.isCheckingAttendance
    ).length;
    const attendanceRate =
      totalStudents > 0 ? (presentStudents / totalStudents) * 100 : 0;

    return {
      total: totalStudents,
      present: presentStudents,
      absent: absentStudents,
      loading: loadingStudents,
      rate: attendanceRate,
    };
  }, [studentsWithAttendance]);

  const getTrackName = (trackNumber: number) => {
    return trackNumber === 0 ? "Web2" : "Web3";
  };

  const formatDate = (date: Date) => {
    return format(date, "EEEE, MMMM d, yyyy");
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              View Attendance Records
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
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            View Attendance Records
          </CardTitle>
          <CardDescription>
            Check who was present or absent on a specific date
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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

            {/* Date Picker */}
            <div className="space-y-2">
              <Label htmlFor="attendanceDate">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="attendanceDate"
                    variant="outline"
                    className="w-full justify-between"
                    type="button"
                  >
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                    <Calendar className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <UiCalendar
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={setSelectedDate}
                    captionLayout="dropdown"
                    required={true}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Loading State */}
          {(isLoadingStudents || isLoadingAttendance) && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">
                {isLoadingStudents
                  ? "Loading students..."
                  : "Checking attendance..."}
              </span>
            </div>
          )}

          {/* Attendance Statistics */}
          {attendanceStats &&
            selectedCohort &&
            selectedTrack &&
            selectedDate && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Students
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {attendanceStats.total}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      in {selectedCohortData?.name} -{" "}
                      {getTrackName(Number(selectedTrack))}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Present
                    </CardTitle>
                    <UserCheck className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {attendanceStats.present}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {attendanceStats.rate.toFixed(1)}% attendance rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Absent
                    </CardTitle>
                    <UserX className="h-4 w-4 text-red-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      {attendanceStats.absent}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(100 - attendanceStats.rate).toFixed(1)}% absence rate
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Date</CardTitle>
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-bold">
                      {formatDate(selectedDate)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Day {selectedDay}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

          {/* Students Table */}
          {selectedCohort && selectedTrack && selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Student Attendance for {formatDate(selectedDate)}
                </CardTitle>
                <CardDescription>
                  Showing attendance status for {selectedCohortData?.name} -{" "}
                  {getTrackName(Number(selectedTrack))}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredStudents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Attendance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentsWithAttendance.map((student) => (
                        <TableRow key={student.studentAddress}>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {student.firstname} {student.lastname}
                              </div>
                              <div className="text-sm text-gray-500 font-mono">
                                {student.studentAddress.slice(0, 6)}...
                                {student.studentAddress.slice(-4)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              @{student.username}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                student.isActive ? "default" : "secondary"
                              }
                            >
                              {student.isActive ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {student.isCheckingAttendance ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm text-gray-500">
                                  Checking...
                                </span>
                              </div>
                            ) : student.hasAttendance === true ? (
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Present
                              </Badge>
                            ) : student.hasAttendance === false ? (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Absent
                              </Badge>
                            ) : (
                              <Badge variant="outline">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Unknown
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No students found for this cohort and track.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* No Selection State */}
          {(!selectedCohort || !selectedTrack || !selectedDate) && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>
                Please select a cohort, track, and date to view attendance
                records.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
