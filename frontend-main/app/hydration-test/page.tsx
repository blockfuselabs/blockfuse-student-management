"use client";
import React, { useState, useEffect } from "react";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const HydrationTestPage = () => {
  const isMounted = useIsMounted();
  const { address, isConnected } = useAccount();
  const [clientTime, setClientTime] = useState<string>("Loading...");
  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount((prev) => prev + 1);
  });

  useEffect(() => {
    if (isMounted) {
      setClientTime(new Date().toLocaleTimeString());
    }
  }, [isMounted]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Hydration Test Page</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Client-Side State</h2>
          <div className="space-y-2">
            <p>
              <strong>Is Mounted:</strong> {isMounted ? "Yes" : "No"}
            </p>
            <p>
              <strong>Current Time:</strong> {clientTime}
            </p>
            <p>
              <strong>Render Count:</strong> {renderCount}
            </p>
            <p>
              <strong>Is Connected:</strong> {isConnected ? "Yes" : "No"}
            </p>
            <p>
              <strong>Address:</strong> {address || "Not connected"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Wallet Connection Test</h2>
          <div className="mb-4">
            <ConnectButton />
          </div>
          <p className="text-sm text-gray-600">
            This tests if the ConnectButton causes hydration issues.
          </p>
        </div>

        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          <p>
            <strong>Test Instructions:</strong>
          </p>
          <ul className="mt-2 list-disc list-inside">
            <li>
              If you see &quot;Loading...&quot; initially and then it changes to the
              actual values, hydration is working correctly.
            </li>
            <li>
              If you see a hydration error in the console, there&apos;s still an
              issue.
            </li>
            <li>This page should not cause any hydration mismatches.</li>
            <li>The render count should be reasonable (not infinite).</li>
          </ul>
        </div>

        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mt-4">
          <p>
            <strong>Debug Information:</strong>
          </p>
          <ul className="mt-2 list-disc list-inside">
            <li>Check browser console for any hydration warnings</li>
            <li>
              Look for &quot;Hydration failed&quot; or &quot;Text content does not match&quot;
              errors
            </li>
            <li>If you see these errors, the issue is not fully resolved</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HydrationTestPage;
