"use client";
import DashboardNav from "@/components/shared/DashboardNav";
import DashboardSidebar from "@/components/shared/DashboardSidebar";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/lib/hooks/useUserRole";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { Loader2 } from "lucide-react";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const { isConnected } = useAccount();
  const router = useRouter();
  const isMounted = useIsMounted();
  const { isAdmin, isSuperAdmin, isLoading: roleLoading } = useUserRole();
  const [hasCheckedRole, setHasCheckedRole] = useState(false);

  // Reset hasCheckedRole when wallet disconnects
  useEffect(() => {
    if (!isConnected && hasCheckedRole) {
      setHasCheckedRole(false);
    }
  }, [isConnected, hasCheckedRole]);

  useEffect(() => {
    // Handle immediate disconnection
    if (isMounted && !isConnected) {
      router.push("/login");
      return;
    }

    // Only proceed if mounted, connected, and role loading is complete
    if (isMounted && isConnected && !roleLoading) {
      // If we haven't checked role yet, set the flag
      if (!hasCheckedRole) {
        setHasCheckedRole(true);
      }

      // Only redirect if user is not an admin or super admin
      if (!isAdmin && !isSuperAdmin) {
        router.push("/unauthorized");
      }
      // If user is admin or super admin, they can stay on admin pages
      // No need to redirect to /admin since they're already in admin layout
    } else {
      console.log("Still loading or not mounted yet");
    }
  }, [
    isMounted,
    isConnected,
    isAdmin,
    isSuperAdmin,
    roleLoading,
    hasCheckedRole,
    router,
  ]);

  // Show loading while checking authentication
  if (!isMounted || roleLoading || !hasCheckedRole) {
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

  // Don't render dashboard if not authenticated
  if (!isConnected || (!isAdmin && !isSuperAdmin)) {
    console.log("Not rendering dashboard - not authenticated");
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
