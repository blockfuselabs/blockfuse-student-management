"use client";

import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/shared/Table";
import { AddAdminModal } from "@/components/modals/AddAdminModal";
import { Admin, adminColumns } from "@/components/tables/StudentColumns";
import { useGetAdmins } from "@/lib/hooks/useGetAdmins";
import { RefreshCw } from "lucide-react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const statusTabs = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

const AdminsPage = () => {
  const [addAdminModalOpen, setAddAdminModalOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch admins from blockchain
  const {
    admins: blockchainAdmins,
    isLoading,
    error,
  } = useGetAdmins(refreshKey);

  console.log(blockchainAdmins);

  // Transform blockchain data to match our Admin type
  const adminsData: Admin[] = blockchainAdmins.map((admin, index) => ({
    id: index.toString(),
    address: admin.address,
    isActive: admin.isActive,
  }));

  const filteredAdmins = adminsData.filter((admin) => {
    const matchesTab =
      selectedTab === "all"
        ? true
        : selectedTab === "active"
        ? admin.isActive
        : selectedTab === "inactive"
        ? !admin.isActive
        : true;

    const matchesSearch = admin.address
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  // Refresh function
  const handleRefresh = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  // Handle admin added
  const handleAdminAdded = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  // Handle admin removed
  const handleAdminRemoved = useCallback(() => {
    handleRefresh();
  }, [handleRefresh]);

  if (error) {
    return (
      <div className="p-6 h-screen bg-white rounded-xl">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Error Loading Admins
            </h2>
            <p className="text-gray-600">{error}</p>
            <Button onClick={handleRefresh} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-screen bg-white rounded-xl">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="flex w-full justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">
            Admins Management
          </h1>
          <p className="text-gray-400 mt-1">
            Add, organize, and manage admins by status.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="lg"
            variant="outline"
            className="flex text-base h-[44px] w-[44px] gap-1 items-center"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            size="lg"
            className="flex text-base h-[44px] w-[130px] gap-1 items-center"
            onClick={() => setAddAdminModalOpen(true)}
          >
            Add new
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
                ${
                  selectedTab === tab.value
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
        <input
          type="text"
          placeholder="Search by wallet address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="ml-auto px-4 py-2 border rounded-lg focus:outline-none focus:ring-0 text-sm w-64 bg-gray-50"
        />
      </div>

      <div className="mt-2 w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
              <p className="text-gray-600">Loading admins...</p>
            </div>
          </div>
        ) : (
          <Table
            data={filteredAdmins}
            columns={adminColumns(handleAdminRemoved)}
            title=""
            searchable={false}
            exportable={false}
          />
        )}
      </div>

      <AddAdminModal
        isOpen={addAdminModalOpen}
        setIsOpen={setAddAdminModalOpen}
        onAdminAdded={handleAdminAdded}
      />
    </div>
  );
};

export default AdminsPage;
