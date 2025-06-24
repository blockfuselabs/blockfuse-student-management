import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";
import React from "react";

const AttendanceSuccess = () => {
  return (
<Alert>
    <CheckCircle className="h-6 w-6 text-green-600" />
    <AlertDescription>
        Attendance logged successfully for {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}.
    </AlertDescription>
</Alert>
  );
};

export default AttendanceSuccess;
