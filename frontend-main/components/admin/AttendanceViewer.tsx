"use client";

import { useState } from "react";
import { useGetAttendanceByCohortAndTrack } from "@/lib/hooks/useGetAttendance";
import { useGetStudent } from "@/lib/hooks/useGetStudent";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Users,
  Clock,
  AlertCircle,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useContractRead } from 'wagmi';
import StudentFacetABI from '@/lib/contract/StudentFacet.json';
import { CONTRACT_ADDRESS as STUDENT_FACET_ADDRESS } from '@/lib/contract/address';
import { useGetCohorts } from '../../lib/hooks/useGetCohorts';

export default function AttendanceViewer() {
  const isMounted = useIsMounted();
  const [cohortId, setCohortId] = useState("");
  const [track, setTrack] = useState("");

  // Fetch cohorts
  const {
    cohorts,
    isLoading: isCohortsLoading,
    error: cohortsError,
  } = useGetCohorts();

  // Find selected cohort object
  const selectedCohort = cohorts.find((c) => c.id === cohortId);
  const availableTracks = selectedCohort ? selectedCohort.tracks : [];

  // Only call the hook if we have valid parameters
  const shouldCallAttendance = Boolean(
    cohortId &&
    track &&
    !isNaN(Number(cohortId)) &&
    (Number(track) === 0 || Number(track) === 1)
  );

  const { attendance, isLoading, isError, error } =
    useGetAttendanceByCohortAndTrack(
      shouldCallAttendance ? Number(cohortId) : 0,
      shouldCallAttendance ? Number(track) : 0
    );
  
  console.log(attendance)

  const formatDate = (timestamp: number) => {
    if (!isMounted) return "Loading...";
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTrackName = (trackNumber: number) => {
    return trackNumber === 0 ? "Web2" : trackNumber === 1 ? "Web3" : `Track ${trackNumber}`;
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

  // Handle loading and error states for cohorts
  if (isCohortsLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              View Attendance Records
            </CardTitle>
            <CardDescription>Loading cohorts...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading cohorts...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (cohortsError) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              View Attendance Records
            </CardTitle>
            <CardDescription>Error loading cohorts</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {cohortsError.message || "Failed to load cohorts"}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Handle no cohorts
  if (!cohorts || cohorts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              View Attendance Records
            </CardTitle>
            <CardDescription>No cohorts found</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No cohorts are available. Please add a cohort to view attendance data.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reset track when cohort changes
  const handleCohortChange = (value: string) => {
    setCohortId(value);
    setTrack("");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            View Attendance Records
          </CardTitle>
          <CardDescription>
            View attendance records for specific cohorts and tracks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="cohortId">Cohort</Label>
              <Select value={cohortId} onValueChange={handleCohortChange} disabled={cohorts.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a cohort" />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((cohort) => (
                    <SelectItem key={cohort.id} value={cohort.id}>
                      {cohort.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="track">Track</Label>
              <Select
                value={track}
                onValueChange={setTrack}
                disabled={!cohortId || availableTracks.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={cohortId ? (availableTracks.length > 0 ? "Select a track" : "No tracks available") : "Select a cohort first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableTracks.map((trackNum) => (
                    <SelectItem key={trackNum} value={trackNum.toString()}>
                      {getTrackName(trackNum)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error Alert */}
          {isError && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error?.message || "Failed to load attendance data"}
              </AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && shouldCallAttendance && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">
                Loading attendance data...
              </span>
            </div>
          )}

          {/* Attendance Data */}
          {attendance && !isLoading && shouldCallAttendance && (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Students
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {attendance.students?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      in Cohort {cohortId} - {getTrackName(Number(track))}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Attendance Days
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {attendance.dates?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      days with attendance records
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Latest Attendance
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-bold">
                      {attendance.dates && attendance.dates.length > 0
                        ? formatDate(
                          attendance.dates[attendance.dates.length - 1]
                        )
                        : "No records"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      most recent entry
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Students Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Students with Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {attendance.students && attendance.students.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student Address</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Attendance Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendance.students.map((studentAddress) => (
                          <StudentRow
                            key={studentAddress}
                            studentAddress={studentAddress}
                            cohortId={cohortId}
                            track={track}
                          />
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No students found with attendance records for this cohort
                      and track.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Attendance Dates */}
              {attendance.dates && attendance.dates.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Attendance Dates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {attendance.dates.map((date, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {formatDate(date)}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* No Data State */}
          {!isLoading &&
            !attendance &&
            cohortId &&
            track &&
            shouldCallAttendance && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>
                  No attendance data found for Cohort {cohortId} -{" "}
                  {getTrackName(Number(track))}
                </p>
              </div>
            )}

          {/* Initial State */}
          {!cohortId || !track ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Please select a cohort and track to view attendance data.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

// Student Row Component
function StudentRow({
  studentAddress,
  cohortId,
  track,
}: {
  studentAddress: string;
  cohortId: number;
  track: number;
}) {
  const { student, isLoading } = useGetStudent(studentAddress);
  const { data: attendanceDates, isLoading: isAttendanceLoading } = useContractRead({
    address: STUDENT_FACET_ADDRESS,
    abi: StudentFacetABI.abi,
    functionName: 'getAttendanceDatesForStudent',
    args: [studentAddress, cohortId, track],
    watch: true,
  });

  console.log('student debug', student)

  return (
    <TableRow>
      <TableCell className="font-mono text-sm">
        {studentAddress.slice(0, 6)}...{studentAddress.slice(-4)}
      </TableCell>
      <TableCell>
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : student ? (
          <span>
            {student.firstname} {student.lastname}
          </span>
        ) : (
          <span className="text-gray-500">Unknown</span>
        )}
      </TableCell>
      <TableCell>
        {student && (
          <Badge variant={student.isActive ? "default" : "secondary"}>
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
        )}
      </TableCell>
      <TableCell>
        {isAttendanceLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Badge variant="outline">
            {attendanceDates ? attendanceDates.length : 0}
            {attendanceDates && attendanceDates.length > 0 && (
              <span title={attendanceDates.map((day: number) => new Date(day * 86400 * 1000).toLocaleDateString()).join(', ')} style={{ marginLeft: 6, cursor: 'pointer' }}>🗓️</span>
            )}
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
}
