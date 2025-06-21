'use client'
import StudentHeader from "@/components/student/StudentHeader";
import { Button } from "@/components/ui/button";
import { ScanQrCode } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useDisconnect } from "wagmi";
import { toast } from "sonner";


const StudentPage = () => {
  const [activeTab, setActiveTab] = useState("schedule");
  const router = useRouter();
  const { disconnect } = useDisconnect();

  const handleDisconnect = () => {
    try {
      disconnect();
      toast.success("Wallet disconnected successfully");
      router.push("/login");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      toast.error("Failed to disconnect wallet");
      // Still redirect to login page
      router.push("/login");
    }
  };

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2">
          <Image src="/images/logo-two.svg" alt="" height={50} width={50} />
          <div className="">
            <h4 className="text-[#9434EA]">BlockfuseLabs</h4>
            <p className="text-xs py-0.5 px-1 text-center bg-[#9434EA]/20 rounded-xl text-[#9434EA]">Student Portal</p>
          </div>
        </div>

        <Button onClick={handleDisconnect}>Disconnect wallet</Button>
      </div>

      <StudentHeader />

      <div className="mt-20 flex items-center gap-2 mb-6 border-b border-gray-200">
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none rounded-t-lg
            ${activeTab === "attendance" ? "bg-[#9434EA] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
          `}
          onClick={() => setActiveTab("attendance")}
        >
          Attendance Management
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium transition-colors focus:outline-none rounded-t-lg
            ${activeTab === "schedule" ? "bg-[#9434EA] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
          `}
          onClick={() => setActiveTab("schedule")}
        >
          Class Schedule
        </button>

      </div>

      <div className="mt-8 flex flex-col gap-6">
        {activeTab === "schedule" && (
          <div className="">
          </div>
        )}
        {activeTab === "attendance" && (
          <div className="">
            <ScanQrCode />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPage;
