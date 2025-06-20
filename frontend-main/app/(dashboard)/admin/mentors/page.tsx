"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/shared/Table";
import { AddMentorModal } from "@/components/modals/AddMentorModal";
import { Mentor, mentorColumns } from "@/components/tables/StudentColumns";

const mentorsData: Mentor[] = [
  {
    id: "1",
    name: "John Mentor",
    email: "john.mentor@example.com",
    cohort: "Web Development 2024",
    status: "active",
  },
  {
    id: "2",
    name: "Jane Guide",
    email: "jane.guide@example.com",
    cohort: "Mobile Development 2024",
    status: "inactive",
  },
  {
    id: "3",
    name: "Sam Coach",
    email: "sam.coach@example.com",
    cohort: "Data Science 2024",
    status: "active",
  },
];

const statusTabs = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const MentorsPage = () => {
  const [addMentorModalOpen, setAddMentorModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMentors = mentorsData.filter((mentor) => {
    const matchesTab =
      selectedTab === "all" ? true : mentor.status === selectedTab;
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.cohort.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-6 h-screen bg-white rounded-xl">
      <div className="flex w-full justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Mentors Management
          </h1>
          <p className="text-gray-400 mt-1">
            Add, organize, and manage mentors by status.
          </p>
        </div>
        <Button
          size="lg"
          className="flex text-base h-[44px] w-[130px] gap-1 items-center"
          onClick={() => setAddMentorModalOpen(true)}
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
          className="ml-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-0 text-sm w-64 bg-gray-50"
        />
      </div>

      <div className="mt-2 w-full">
        <Table
          data={filteredMentors}
          columns={mentorColumns}
          title=""
          searchable={false}
          exportable={false}
        />
      </div>

      <AddMentorModal
        isOpen={addMentorModalOpen}
        setIsOpen={setAddMentorModalOpen}
      />
    </div>
  );
};

export default MentorsPage; 