"use client";
import AttendanceSection from "@/components/student/AttendanceSection";
import StudentHeader from "@/components/student/StudentHeader";
import React, { useState } from "react";
import { Table } from "@/components/shared/Table";

const StudentPage = () => {
  const [activeTab, setActiveTab] = useState("schedule");

  const classScheduleColumns = [
    { header: "Day", accessor: "day" as const },
    { header: "Time", accessor: "time" as const },
    { header: "Instructor", accessor: "instructor" as const },
    { header: "Location", accessor: "location" as const },
  ];

  const classScheduleData = [
    {
      id: 1,
      day: "Monday",
      time: "9:00 AM - 11:00 AM",
      subject: "Mathematics",
      instructor: "Mr. Smith",
      location: "Room 101",
    },
    {
      id: 2,
      day: "Tuesday",
      time: "11:30 AM - 1:30 PM",
      subject: "Physics",
      instructor: "Ms. Johnson",
      location: "Room 102",
    },
    {
      id: 3,
      day: "Wednesday",
      time: "2:00 PM - 4:00 PM",
      subject: "Chemistry",
      instructor: "Dr. Lee",
      location: "Room 103",
    },
    {
      id: 4,
      day: "Thursday",
      time: "10:00 AM - 12:00 PM",
      subject: "English",
      instructor: "Mrs. Brown",
      location: "Room 104",
    },
    {
      id: 5,
      day: "Friday",
      time: "1:00 PM - 3:00 PM",
      subject: "Biology",
      instructor: "Mr. Green",
      location: "Room 105",
    },
  ];

  return (
    <div className="">
      <StudentHeader />

      <div className="mt-20 flex items-center gap-2 mb-6 border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none rounded-t-lg
            ${
              activeTab === "attendance"
                ? "bg-[#9434EA] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
          onClick={() => setActiveTab("attendance")}
        >
          Attendance Management
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none rounded-t-lg
            ${
              activeTab === "schedule"
                ? "bg-[#9434EA] text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }
          `}
          onClick={() => setActiveTab("schedule")}
        >
          Class Schedule
        </button>
      </div>

      <div className="mt-8 flex flex-col gap-6">
        {activeTab === "schedule" && (
          <div className="bg-white rounded-xl text-gray-900">
            <h3 className="font-semibold text-lg">Your class Schedule</h3>
            <p className="text-gray-400 mb-4">
              Stay organized and never miss a class! Here&apos;s your up-to-date
              schedule with all your upcoming sessions, instructors, and
              locations.
            </p>
            <Table
              data={classScheduleData}
              columns={classScheduleColumns}
              title=""
              searchable={false}
              exportable={false}
            />
          </div>
        )}
        {activeTab === "attendance" && <AttendanceSection />}
      </div>
    </div>
  );
};

export default StudentPage;
