"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/shared/Table";
import { AddStudentModal } from "@/components/modals/AddStudentModal";
import { AddStudentsExcelModal } from "@/components/modals/AddStudentsExcelModal";
import { Student, studentColumns } from "@/components/tables/StudentColumns";
import { useGetCohorts } from "@/lib/hooks/useGetCohorts";
import { useGetStudentsForCohorts, StudentDetails } from "@/lib/hooks/useGetStudents";

const statusTabs = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Graduated", value: "graduated" },
  { label: "Evicted", value: "evicted" },
  { label: "Suspended", value: "suspended" },
];

// Helper to map on-chain studentDetails to Student table type
function mapStudentDetailsToStudent(
  s: StudentDetails,
  cohortName: string
): Student {
  // Map track number to label
  let trackLabel = s.track === 0 ? "web2" : s.track === 1 ? "web3" : `Track ${s.track}`;
  return {
    id: s.studentAddress,
    name: `${s.firstname} ${s.lastname}`,
    email: trackLabel, // Show track instead of email
    cohort: cohortName,
    status: s.isActive ? "active" : "suspended", // You may want to improve this mapping
  };
}

const StudentsPage = () => {
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [addExcelModalOpen, setAddExcelModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Get all cohorts
  const { cohorts } = useGetCohorts();

  // Fetch all students for all cohorts/tracks
  const { students: allOnChainStudents, isLoading: isLoadingStudents, error: studentsError } = useGetStudentsForCohorts(cohorts);
  // Map on-chain students to table format
  const mappedStudents = useMemo(() => {
    // Map cohortId to cohort name for fast lookup
    const cohortIdToName: Record<string, string> = {};
    for (const cohort of cohorts) {
      cohortIdToName[String(cohort.id)] = cohort.name;
    }
    return allOnChainStudents.map((s) => mapStudentDetailsToStudent(s, cohortIdToName[String(s.cohort)] || `Cohort ${s.cohort}`));
  }, [allOnChainStudents, cohorts]);

  // Debug: log students
  console.log('On-chain students:', allOnChainStudents);

  // Filtered students for search and tab
  const filteredStudents = useMemo(() => {
    return mappedStudents.filter((student) => {
      const matchesTab =
        selectedTab === "all" ? true : student.status === selectedTab;
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.cohort.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [mappedStudents, selectedTab, searchTerm]);

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
        <div className="flex gap-2">
          <Button
            size="lg"
            className="flex text-base h-[44px] w-[130px] gap-1 items-center"
            onClick={() => setAddStudentModalOpen(true)}
          >
            Add new
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex text-base h-[44px] w-[150px] gap-1 items-center"
            onClick={() => setAddExcelModalOpen(true)}
          >
            Add via Excel
          </Button>
        </div>
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

      {/* Loading and Error States */}
      {isLoadingStudents && (
        <div className="flex justify-center items-center py-8">
          <span className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-2"></span>
          <span className="text-gray-700">Loading students from chain...</span>
        </div>
      )}
      {studentsError && (
        <div className="text-red-600 text-center py-2 font-medium">{studentsError}</div>
      )}

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
      <AddStudentsExcelModal
        isOpen={addExcelModalOpen}
        setIsOpen={setAddExcelModalOpen}
      />
    </div>
  );
};

export default StudentsPage; 