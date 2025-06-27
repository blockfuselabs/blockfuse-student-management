"use client";

import { useState } from "react";
import { useLogAttendance } from "@/hooks/useLogAttendance";
import { useGetStudent } from "@/hooks/useGetStudent";
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
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
} from "lucide-react";

export default function TestAttendancePage() {
  const [studentAddress, setStudentAddress] = useState("");
  const [cohortId, setCohortId] = useState("");
  const [track, setTrack] = useState("");

  const { logAttendance, isLoading, isSuccess, error, resetError } =
    useLogAttendance();
  const {
    student,
    isLoading: isLoadingStudent,
    isError: isStudentError,
  } = useGetStudent(studentAddress);

  const handleLogAttendance = async () => {
    if (!studentAddress || !cohortId || !track) {
      alert("Please fill in all fields");
      return;
    }

    resetError();
    await logAttendance({
      studentAddress,
      cohortId: Number(cohortId),
      track: Number(track),
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Attendance System Test</h1>
        <p className="text-gray-600">
          Test the attendance logging functionality
        </p>
      </div>

      {/* Log Attendance Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Log Attendance Test
          </CardTitle>
          <CardDescription>
            Test logging attendance for a student
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Student Address</Label>
              <Input
                placeholder="0x..."
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
              />
            </div>
            <div>
              <Label>Cohort ID</Label>
              <Input
                type="number"
                placeholder="1"
                value={cohortId}
                onChange={(e) => setCohortId(e.target.value)}
              />
            </div>
            <div>
              <Label>Track</Label>
              <Select value={track} onValueChange={setTrack}>
                <SelectTrigger>
                  <SelectValue placeholder="Select track" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Web2</SelectItem>
                  <SelectItem value="1">Web3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Student Info Display */}
          {isLoadingStudent && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading student information...
            </div>
          )}

          {isStudentError && studentAddress && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Student not found</AlertDescription>
            </Alert>
          )}

          {student && (
            <Card className="bg-gray-50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Student Found:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    Name: {student.firstname} {student.lastname}
                  </div>
                  <div>Username: {student.username}</div>
                  <div>Status: {student.isActive ? "Active" : "Inactive"}</div>
                  <div>Cohort: {student.cohort}</div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleLogAttendance}
            disabled={isLoading || !student?.isActive}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging Attendance...
              </>
            ) : (
              "Log Attendance"
            )}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Attendance logged successfully!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Contract Info */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              Contract Address: 0x8b7aB51637447c154390dbE1dc184c745B2a67c8
            </div>
            <div>Network: Sepolia Testnet</div>
            <div>Function: logAttendance(address, uint8, uint8)</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
