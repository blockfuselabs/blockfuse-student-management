"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/shared/Table";
import { AddStudentModal } from "@/components/modals/AddStudentModal";
import { Student, studentColumns } from "@/components/tables/StudentColumns";

const studentsData: Student[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    cohort: "Web Development 2024",
    status: "active",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    cohort: "Mobile Development 2024",
    status: "graduated",
  },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie@example.com",
    cohort: "Data Science 2024",
    status: "evicted",
  },
  {
    id: "4",
    name: "Diana Prince",
    email: "diana@example.com",
    cohort: "Web Development 2024",
    status: "suspended",
  },
  {
    id: "5",
    name: "Eve Adams",
    email: "eve@example.com",
    cohort: "Web Development 2024",
    status: "active",
  },
];

const statusTabs = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Graduated", value: "graduated" },
  { label: "Evicted", value: "evicted" },
  { label: "Suspended", value: "suspended" },
];

const StudentsPage = () => {
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");



  const filteredStudents = studentsData.filter((student) => {
    const matchesTab =
      selectedTab === "all" ? true : student.status === selectedTab;
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cohort.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-6 h-screen bg-white rounded-xl">
      <div className="flex w-full justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Students Management
          </h1>
          <p className="text-gray-400 mt-1">
            Add, organize, and manage students by status.
          </p>
        </div>
        <Button
          size="lg"
          className="flex text-base h-[44px] w-[130px] gap-1 items-center"
          onClick={() => setAddStudentModalOpen(true)}
        >
          Add new
        </Button>
      </div>

      {/* Tabs and Search */}
      <div className="flex items-center justify-between mt-7 mb-2 w-full gap-2">
        <div className="flex gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none
                ${selectedTab === tab.value ? "bg-black text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
              `}
              onClick={() => setSelectedTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search by name, email, or cohort..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ml-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64 bg-gray-50"
        />
      </div>

      <div className="mt-2 w-full">
        <Table
          data={filteredStudents}
          columns={studentColumns}
          title=""
          searchable={false}
          exportable={false}
        />
      </div>

      <AddStudentModal
        isOpen={addStudentModalOpen}
        setIsOpen={setAddStudentModalOpen}
      />
    </div>
  );
};

export default StudentsPage; 