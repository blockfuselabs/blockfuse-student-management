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

    // Only proceed if mounted, connected, role loading is complete, and we haven't checked yet
    if (isMounted && isConnected && !roleLoading && !hasCheckedRole) {
      setHasCheckedRole(true);

      if (!isAdmin && !isSuperAdmin) {
        router.push("/unauthorized");
      } else if(isAdmin || isSuperAdmin) {
         router.push("/admin");
      }
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
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Loading...
          </h2>
          <p className="text-gray-600">Checking authentication</p>
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
    <main className="w-full h-screen overflow-hidden flex">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-h-full overflow-auto bg-white">
        <DashboardNav />
        <div className="flex-1 bg-[#F8F9FD] p-6">{children}</div>
      </div>
    </main>
  );
};

export default Layout;
