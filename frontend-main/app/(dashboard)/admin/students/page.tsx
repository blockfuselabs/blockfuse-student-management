"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/shared/Table";
import { AddStudentModal } from "@/components/modals/AddStudentModal";
import { AddStudentsExcelModal } from "@/components/modals/AddStudentsExcelModal";
import { AddScoreModal } from "@/components/modals/AddScoreModal";
import { Student, studentColumns } from "@/components/tables/StudentColumns";
import { useGetCohorts } from "@/lib/hooks/useGetCohorts";
import {
  useGetStudentsForCohorts,
  StudentDetails,
} from "@/lib/hooks/useGetStudents";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw } from "lucide-react";
import { ReplaceStudentWalletModal } from "@/components/modals/ReplaceStudentWalletModal";

const statusTabs = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Graduated", value: "graduated" },
  { label: "Evicted", value: "evicted" },
  { label: "Suspended", value: "suspended" },
];

const trackOptions = [
  { label: "All Tracks", value: "all" },
  { label: "Web2", value: "0" },
  { label: "Web3", value: "1" },
];

// Helper to map on-chain studentDetails to Student table type
function mapStudentDetailsToStudent(
  s: StudentDetails,
  cohortName: string
): Student {
  // Map track number to label
  const trackLabel =
    s.track === 0 ? "web2" : s.track === 1 ? "web3" : `Track ${s.track}`;
  return {
    id: s.studentAddress,
    name: `${s.firstname} ${s.lastname}`,
    email: trackLabel, // Show track instead of email
    cohort: cohortName,
    status: s.isActive ? "active" : "suspended", // You may want to improve this mapping
    finalScore: Number(s.finalScore), // Convert bigint to number
  };
}

const StudentsPage = () => {
  const [addStudentModalOpen, setAddStudentModalOpen] = useState(false);
  const [addExcelModalOpen, setAddExcelModalOpen] = useState(false);
  const [addScoreModalOpen, setAddScoreModalOpen] = useState(false);
  const [selectedStudentAddress, setSelectedStudentAddress] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCohort, setSelectedCohort] = useState<string>("all");
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [replaceWalletModalOpen, setReplaceWalletModalOpen] = useState(false);
  const [replaceWalletOldAddress, setReplaceWalletOldAddress] = useState<string>("");

  // Get all cohorts
  const { cohorts } = useGetCohorts();

  // Fetch all students for all cohorts/tracks
  const {
    students: allOnChainStudents,
    error: studentsError,
  } = useGetStudentsForCohorts(cohorts, refreshKey);

  // Map on-chain students to table format
  const mappedStudents = useMemo(() => {
    // Map cohortId to cohort name for fast lookup
    const cohortIdToName: Record<string, string> = {};
    for (const cohort of cohorts) {
      cohortIdToName[String(cohort.id)] = cohort.name;
    }
    return allOnChainStudents.map((s) =>
      mapStudentDetailsToStudent(
        s,
        cohortIdToName[String(s.cohort)] || `Cohort ${s.cohort}`
      )
    );
  }, [allOnChainStudents, cohorts]);




  // Filtered students for search, tab, cohort, and track
  const filteredStudents = useMemo(() => {
    return mappedStudents.filter((student) => {
      // Status filter
      const matchesTab =
        selectedTab === "all" ? true : student.status === selectedTab;

      // Search filter
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.cohort.toLowerCase().includes(searchTerm.toLowerCase());

      // Cohort filter
      const matchesCohort =
        selectedCohort === "all" || student.cohort === selectedCohort;

      // Track filter
      const matchesTrack =
        selectedTrack === "all" ||
        student.email === (selectedTrack === "0" ? "web2" : "web3");

      return matchesTab && matchesSearch && matchesCohort && matchesTrack;
    });
  }, [mappedStudents, selectedTab, searchTerm, selectedCohort, selectedTrack]);

  // Get unique cohort names for dropdown
  const cohortOptions = useMemo(() => {
    const uniqueCohorts = [...new Set(mappedStudents.map((s) => s.cohort))];
    return [
      { label: "All Cohorts", value: "all" },
      ...uniqueCohorts.map((cohort) => ({ label: cohort, value: cohort })),
    ];
  }, [mappedStudents]);

  // Handler for opening add score modal
  const handleAddScore = (studentAddress: string) => {
    setSelectedStudentAddress(studentAddress);
    setAddScoreModalOpen(true);
  };

  // Handler for closing add score modal
  const handleCloseAddScore = () => {
    setAddScoreModalOpen(false);
    setSelectedStudentAddress("");
  };

  const handleResetFilters = () => {
    setSelectedTab("all");
    setSearchTerm("");
    setSelectedCohort("all");
    setSelectedTrack("all");
  };

  const handleEditStudent = (studentAddress: string) => {
    setReplaceWalletOldAddress(studentAddress);
    setReplaceWalletModalOpen(true);
  };

  return (
    <div className="p-6 h-screen bg-white rounded-xl">
      <div className="flex w-full justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Students Management
          </h1>
          <p className="text-gray-400 mt-1">
            Add, organize, and manage students by status, cohort, and track.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="lg"
            variant="outline"
            className="flex text-base h-[44px] w-[44px] gap-1 items-center"
            onClick={() => setRefreshKey((k) => k + 1)}
            disabled={isLoadingStudents}
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingStudents ? "animate-spin" : ""}`} />
          </Button>
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

      {/* Filters Section */}
      <div className="mt-7 mb-4 space-y-4">
        {/* Status Tabs */}
        <div className="flex gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none
                ${selectedTab === tab.value
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
              onClick={() => setSelectedTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cohort and Track Selection */}
        <div className="flex items-center gap-4">
          {/* Cohort Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Cohort:</label>
            <Select value={selectedCohort} onValueChange={setSelectedCohort}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select cohort" />
              </SelectTrigger>
              <SelectContent>
                {cohortOptions.map((cohort) => (
                  <SelectItem key={cohort.value} value={cohort.value}>
                    {cohort.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Track Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Track:</label>
            <Select value={selectedTrack} onValueChange={setSelectedTrack}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select track" />
              </SelectTrigger>
              <SelectContent>
                {trackOptions.map((track) => (
                  <SelectItem key={track.value} value={track.value}>
                    {track.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="text"
              placeholder="Search by name, email, or cohort..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-64 bg-gray-50"
            />
          </div>

          {/* Reset Filters Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetFilters}
            className="text-sm"
          >
            Reset Filters
          </Button>
        </div>

        {/* Active Filters Display */}
        {(selectedCohort !== "all" ||
          selectedTrack !== "all" ||
          selectedTab !== "all" ||
          searchTerm) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Active filters:</span>
              {selectedCohort !== "all" && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Cohort:{" "}
                  {cohortOptions.find((c) => c.value === selectedCohort)?.label}
                </span>
              )}
              {selectedTrack !== "all" && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  Track:{" "}
                  {trackOptions.find((t) => t.value === selectedTrack)?.label}
                </span>
              )}
              {selectedTab !== "all" && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  Status: {statusTabs.find((t) => t.value === selectedTab)?.label}
                </span>
              )}
              {searchTerm && (
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  Search: &ldquo;{searchTerm}&rdquo;
                </span>
              )}
            </div>
          )}
      </div>

      {/* Loading and Error States */}

      {studentsError && (
        <div className="text-red-600 text-center py-2 font-medium">
          {studentsError}
        </div>
      )}

      {/* Results Count */}
      <div className="mb-2 text-sm text-gray-600">
        Showing {filteredStudents.length} student
        {filteredStudents.length !== 1 ? "s" : ""}
        {filteredStudents.length !== mappedStudents.length && (
          <span> of {mappedStudents.length} total</span>
        )}
      </div>

      <div className="mt-2 w-full">
        <Table
          data={filteredStudents}
          columns={studentColumns(handleAddScore, handleEditStudent)}
          title=""
          searchable={false}
          exportable={false}
          isLoading={isLoadingStudents}
          error={studentsError}
        />
      </div>

      <AddStudentModal
        isOpen={addStudentModalOpen}
        setIsOpen={setAddStudentModalOpen}
        refetchStudents={() => setRefreshKey((k) => k + 1)}
      />
      <AddStudentsExcelModal
        isOpen={addExcelModalOpen}
        setIsOpen={setAddExcelModalOpen}
      />
      <AddScoreModal
        isOpen={addScoreModalOpen}
        setIsOpen={handleCloseAddScore}
        studentAddress={selectedStudentAddress}
        refetchStudents={() => setRefreshKey((k) => k + 1)}
      />
      <ReplaceStudentWalletModal
        open={replaceWalletModalOpen}
        onClose={() => setReplaceWalletModalOpen(false)}
        oldAddress={replaceWalletOldAddress}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
};

export default StudentsPage;
