"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/lib/hooks/useUserRole";
import { useIsMounted } from "@/lib/hooks/useIsMounted";
import { Loader2 } from "lucide-react";
import { useDisconnect } from "wagmi";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const isMounted = useIsMounted();
  const { isStudent, isLoading: roleLoading } = useUserRole();
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

      // Only redirect if user is not a student
      if (!isStudent) {
        router.push("/unauthorized");
      }
      // If user is a student, they can stay on student pages
    } else {
      console.log("Still loading or not mounted yet");
    }
  }, [isMounted, isConnected, isStudent, roleLoading, hasCheckedRole, router]);

  const handleDisconnect = () => {
    disconnect();
    router.push("/login");
  };

  // Show loading while checking authentication
  if (!isMounted || roleLoading || !hasCheckedRole) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-br from-[#800895] to-[#a015b9] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Welcome to Blockfuse Labs
          </h2>
          <p className="text-gray-600">Setting up your student portal...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isConnected || !isStudent) {
    console.log("Not rendering student dashboard - not authenticated");
    return null;
  }

  return (
    <div className="flex justify-center h-screen animate-in fade-in duration-500 slide-in-from-bottom-4">
      <div className="max-w-5xl w-full h-full p-6">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2">
            <Image src="/images/logo-two.svg" alt="" height={45} width={45} />
            <div className="">
              <h4 className="text-[#9434EA] font-medium">BlockfuseLabs</h4>
              <p className="text-[10px] py-0.5 px-1 text-center bg-[#9434EA]/20 rounded-xl text-[#9434EA]">
                Student Portal
              </p>
            </div>
          </div>

          <Button onClick={handleDisconnect}>Disconnect wallet</Button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Layout;
