"use client";
import React, { useState, useEffect } from "react";
import { useUserRole } from "@/lib/hooks/useUserRole";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { CONTRACT_ADDRESS } from "@/lib/contract/address";

const TestPage = () => {
  const isMounted = useIsMounted();
  const { address, isConnected } = useAccount();
  const {
    isAdmin,
    isStudent,
    isSuperAdmin,
    userType,
    studentData,
    isLoading,
    error,
  } = useUserRole();

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">
            Diamond Contract Test Page
          </h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Diamond Contract Test Page</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Contract Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Contract Address:</strong> {CONTRACT_ADDRESS}
            </p>
            <p>
              <strong>Contract Type:</strong> Diamond Pattern
            </p>
            <p>
              <strong>Network:</strong> Sepolia Testnet
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="space-y-2">
            <p>
              <strong>Connected:</strong> {isConnected ? "Yes" : "No"}
            </p>
            <p>
              <strong>Address:</strong> {address || "Not connected"}
            </p>
          </div>
          <div className="mt-4">
            <ConnectButton />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Role Information</h2>
          <div className="space-y-2">
            <p>
              <strong>Loading:</strong> {isLoading ? "Yes" : "No"}
            </p>
            <p>
              <strong>Is Admin:</strong> {isAdmin ? "Yes" : "No"}
            </p>
            <p>
              <strong>Is Super Admin:</strong> {isSuperAdmin ? "Yes" : "No"}
            </p>
            <p>
              <strong>Is Student:</strong> {isStudent ? "Yes" : "No"}
            </p>
            <p>
              <strong>User Type:</strong> {userType}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {studentData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Student Data</h2>
            <div className="space-y-2">
              <p>
                <strong>First Name:</strong> {studentData.firstname}
              </p>
              <p>
                <strong>Last Name:</strong> {studentData.lastname}
              </p>
              <p>
                <strong>Username:</strong> {studentData.username}
              </p>
              <p>
                <strong>Track:</strong> {studentData.track}
              </p>
              <p>
                <strong>Cohort:</strong> {studentData.cohort}
              </p>
              <p>
                <strong>Is Active:</strong>{" "}
                {studentData.isActive ? "Yes" : "No"}
              </p>
              <p>
                <strong>Final Score:</strong>{" "}
                {studentData.finalScore.toString()}
              </p>
              <p>
                <strong>Student Address:</strong> {studentData.studentAddress}
              </p>
            </div>
          </div>
        )}

        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p>
            <strong>Note:</strong> Check the browser console for detailed debug
            information from the useUserRole hook.
          </p>
          <p className="mt-2">
            <strong>Diamond Pattern:</strong> This contract uses the Diamond
            pattern where all functions are called on the main Diamond contract
            address, not individual facet addresses.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
