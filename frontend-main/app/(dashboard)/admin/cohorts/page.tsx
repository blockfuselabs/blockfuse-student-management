"use client";

import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { Table } from "@/components/shared/Table";
import { AddCohorModal } from "@/components/modals/AddCohortModal";
import { Cohort, cohortcolumns } from "@/components/tables/CohortsColums";

// Sample data
const data: Cohort[] = [
  {
    id: "1",
    name: "Web Development 2024",
    startDate: "2024-01-15",
    endDate: "2024-07-15",
    students: 25,
    status: "active",
  },
  {
    id: "2",
    name: "Mobile Development 2024",
    startDate: "2024-02-01",
    endDate: "2024-08-01",
    students: 20,
    status: "upcoming",
  },
  {
    id: "3",
    name: "Data Science 2024",
    startDate: "2024-03-01",
    endDate: "2024-09-01",
    students: 15,
    status: "upcoming",
  },
];

const CohortsPage = () => {
  const [addCohortModalOpen, setAddCohortModal] = useState(false);
  return (
    <div className="p-6 h-screen bg-white rounded-xl">
      <div className="flex w-full justify-between items-center">
        <div className="">
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Cohorts Management
          </h1>
          <p className="text-gray-400 mt-1">
            Create, organize, and manage student cohorts.
          </p>
        </div>

        <Button
          size="lg"
          className="flex text-base h-[44px] w-[130px] gap-1 items-center"
          onClick={() => setAddCohortModal(true)}
        >
          Add new
        </Button>
      </div>

      <div className="mt-7 w-full">
        <Table
          data={data}
          columns={cohortcolumns}
          title=""
          searchable={false}
          exportable={false}
        />
      </div>

      <AddCohorModal
        isOpen={addCohortModalOpen}
        setIsOpen={setAddCohortModal}
      />
    </div>
  );
};

export default CohortsPage;
