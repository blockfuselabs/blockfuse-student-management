"use client";

import { useState } from "react";
import LogAttendance from "@/components/admin/LogAttendance";
import AttendanceViewer from "@/components/admin/AttendanceViewer";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Eye,
  ScanQrCode,
} from "lucide-react";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { GenerateAttendanceModal } from "@/components/modals/GenerateAttendanceModal";

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState<"log" | "view">("log");
  const [isGenerateModalOpen, setGenerateModalOpen] = useState(false);
  const isMounted = useIsMounted();

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="px-4 w-full flex flex-col gap-6 py-2">
        <div className="">
          <h3 className="text-base md:text-xl font-semibold text-grey-800">
            Attendance Management
          </h3>
          <p className="text-gray-500 mt-1 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 w-full flex flex-col gap-6 py-2">
      <div className="flex justify-between">
        <div className="">
          <h3 className="text-base md:text-xl font-semibold text-grey-800">
            Attendance Management
          </h3>
          <p className="text-gray-500 mt-1 font-medium">
            Log and manage student attendance for different cohorts and tracks.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full">
        <div className="flex justify-between">
          <div className="flex gap-2 mb-6">
            <Button
              variant={activeTab === "log" ? "default" : "outline"}
              onClick={() => setActiveTab("log")}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Log Attendance
            </Button>
            <Button
              variant={activeTab === "view" ? "default" : "outline"}
              onClick={() => setActiveTab("view")}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Records
            </Button>
          </div>
          <Button size={"lg"} onClick={() => setGenerateModalOpen(true)}>
            Generate attendance code
            <ScanQrCode />
          </Button>
        </div>

        {/* Content */}
        <div className="mt-6">
          {activeTab === "log" && <LogAttendance />}
          {activeTab === "view" && <AttendanceViewer />}
        </div>
      </div>

      <GenerateAttendanceModal
        isOpen={isGenerateModalOpen}
        setIsOpen={setGenerateModalOpen}
      />
    </div>
  );
}
