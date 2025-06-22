"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/shared/Table";
import { GenerateAttendanceModal } from "@/components/modals/GenerateAttendanceModal";

type Attendance = {
  id: string;
  date: string;
  cohort: string;
  track: string;
  status: string;
};

const attendanceData: Attendance[] = [
  {
    id: "1",
    date: "2023-10-26",
    cohort: "Cohort 1",
    track: "Frontend",
    status: "Generated",
  },
  {
    id: "2",
    date: "2023-10-25",
    cohort: "Cohort 2",
    track: "Backend",
    status: "Completed",
  },
  {
    id: "3",
    date: "2023-10-24",
    cohort: "Cohort 1",
    track: "Full-stack",
    status: "Completed",
  },
];

const columns: {
  header: string;
  accessor: keyof Attendance;
  render?: (item: Attendance) => React.ReactNode;
}[] = [
  { header: "Date", accessor: "date" },
  { header: "Cohort", accessor: "cohort" },
  { header: "Track", accessor: "track" },
  {
    header: "Status",
    accessor: "status",
    render: (item: Attendance) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.status === "Generated"
            ? "bg-yellow-100 text-yellow-800"
            : "bg-green-100 text-green-800"
        }`}
      >
        {item.status}
      </span>
    ),
  },
];

const AttendancePage = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
      <div className="">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Attendance Management
          </h1>
          <p className="text-gray-400 mt-1">
            Create, organize, and manage student cohorts.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          Generate New Attendance
        </Button>
      </div>

      <GenerateAttendanceModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />

      <div>
        <Table data={attendanceData} columns={columns} searchable={false} exportable={false} />
      </div>
    </div>
  );
};

export default AttendancePage; 