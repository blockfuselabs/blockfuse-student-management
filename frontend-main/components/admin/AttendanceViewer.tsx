"use client";


import { useState } from "react";
import { useGetAttendanceByCohortAndTrack } from "@/hooks/useGetAttendance";
import { useGetStudent } from "@/hooks/useGetStudent";
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

export default function AttendanceViewer() {
  const isMounted = useIsMounted();
  const [cohortId, setCohortId] = useState("");
  const [track, setTrack] = useState("");

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

  const formatDate = (timestamp: number) => {
    // Use client time to prevent hydration issues
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
    return trackNumber === 0 ? "Web2" : "Web3";
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
            View attendance records for specific cohorts and tracks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="cohortId">Cohort ID</Label>
              <Select value={cohortId} onValueChange={setCohortId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a cohort" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((id) => (
                    <SelectItem key={id} value={id.toString()}>
                      Cohort {id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="track">Track</Label>
              <Select value={track} onValueChange={setTrack}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Web2</SelectItem>
                  <SelectItem value="1">Web3</SelectItem>
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
                      {attendance.students.length}
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
                      {attendance.dates.length}
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
                      {attendance.dates.length > 0
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
                  {attendance.students.length > 0 ? (
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
                            attendanceCount={1}
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
              {attendance.dates.length > 0 && (
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
  attendanceCount,
}: {
  studentAddress: string;
  attendanceCount: number;
}) {
  const { student, isLoading } = useGetStudent(studentAddress);

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
        <Badge variant="outline">{attendanceCount}</Badge>
      </TableCell>
    </TableRow>
  );
}
