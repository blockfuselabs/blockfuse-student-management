"use client";
import DashboardNav from "@/components/shared/DashboardNav";
import DashboardSidebar from "@/components/shared/DashboardSidebar";
import React, { useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { Loader2 } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const { isConnected } = useAccount();
  const router = useRouter();
  const isMounted = useIsMounted();

  useEffect(() => {
    // Handle immediate disconnection
    if (isMounted && !isConnected) {
      router.push("/login");
      return;
    }
  }, [isMounted, isConnected, router]);

  // Show loading while checking authentication
  if (!isMounted) {
    console.log("Showing loading state");
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-br from-[#800895] to-[#a015b9] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Welcome to Blockfuse Labs
          </h2>
          <p className="text-gray-600">Setting up your admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not connected
  if (!isConnected) {
    console.log("Not rendering dashboard - not connected");
    return null;
  }

  console.log("Rendering admin dashboard");
  return (
    <main className="w-full h-screen overflow-hidden flex animate-in fade-in duration-500 slide-in-from-bottom-4">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-h-full overflow-auto bg-white">
        <DashboardNav />
        <div className="flex-1 bg-[#F8F9FD] p-6">{children}</div>
      </div>
    </main>
  );
};

export default Layout;
