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
import { useGetCohorts } from '../../lib/hooks/useGetCohorts';
import { useGetAttendanceDatesForStudent } from "@/lib/hooks/useGetAttendance";

export default function AttendanceViewer() {
  const isMounted = useIsMounted();
  const [cohortId, setCohortId] = useState("");
  const [track, setTrack] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

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

  const formatDate = (timestamp: number | bigint) => {
    if (!isMounted) return "Loading...";
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
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

  // Map students and attendance counts for table
  let tableData: { address: string; attendanceCount: number }[] = [];
  if (attendance && Array.isArray(attendance[0]) && Array.isArray(attendance[1])) {
    tableData = attendance[0].map((address: string, i: number) => ({
      address,
      attendanceCount: Number(attendance[1][i] ?? 0),
    }));
  }

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
                      {attendance[0]?.length || 0}
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
                      {attendance[1]?.length || 0}
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
                      {attendance[1] && attendance[1].length > 0
                        ? formatDate(Number(attendance[1][attendance[1].length - 1]))
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
                  {tableData.length > 0 ? (
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
                        {tableData.map(({ address, attendanceCount }) => (
                          <StudentRow
                            key={address}
                            studentAddress={address}
                            attendanceCount={attendanceCount}
                            isSelected={selectedStudent === address}
                            onSelect={() => setSelectedStudent(address)}
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

              {/* Attendance Dates for selected student with count > 1 */}
              {selectedStudent && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Attendance Dates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StudentAttendanceDates
                      studentAddress={selectedStudent}
                      cohortId={cohortId}
                      track={track}
                      attendanceCount={tableData.find(s => s.address === selectedStudent)?.attendanceCount || 0}
                    />
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
  attendanceCount,
  isSelected,
  onSelect,
}: {
  studentAddress: string;
  attendanceCount: number;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { student, isLoading } = useGetStudent(studentAddress);
  return (
    <TableRow onClick={onSelect} className={isSelected ? "bg-blue-50" : ""} style={{ cursor: "pointer" }}>
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
        <Badge variant="outline">{attendanceCount}</Badge>
      </TableCell>
    </TableRow>
  );
}

// Component to render attendance dates for a student
function StudentAttendanceDates({ studentAddress, cohortId, track, attendanceCount }: { studentAddress: string; cohortId: number; track: number; attendanceCount: number }) {
  const { attendanceDates, isLoading } = useGetAttendanceDatesForStudent(studentAddress, Number(cohortId), Number(track));

  if (attendanceCount === 0) {
    return <div>No attendance taken for this student.</div>;
  }
  if (isLoading) return <div>Loading attendance dates...</div>;
  if (!attendanceDates || attendanceDates.length === 0) return <div>No attendance dates found.</div>;
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
      {attendanceDates.map((date, index) => (
        <Badge key={index} variant="outline" className="text-xs">
          {new Date(Number(date) * 86400 * 1000).toLocaleDateString()}
        </Badge>
      ))}
    </div>
  );
}
