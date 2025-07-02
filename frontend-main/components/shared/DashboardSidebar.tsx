"use client";
import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminRoutes } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useUserRole } from "@/lib/hooks/useUserRole";

const DashboardSidebar = () => {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const { isConnecting: wagmiIsConnecting } = useAccount();
  const isLoading = wagmiIsConnecting;
  const {
    isSuperAdmin,
    isAdmin,
    isStudent,
    isLoading: roleLoading,
  } = useUserRole();

  return (
    <div className="w-[16%] px-5 py-6 h-full border-r border-black/10 flex flex-col relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/image2.jpg')",
        }}
      />

      {/* Black Tint Overlay */}
      <div className="absolute inset-0 bg-[#121113]/95" />

      {/* Content - positioned relative to appear above background */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Logo and Title Section */}
        <div className="flex items-center gap-2 mb-8">
          <Image src="/images/logo-two.svg" alt="" height={60} width={60} />
          <div className="flex flex-col">
            <h1 className="text- bg-gradient-to-r from-[#DE24FF] to-[#DE24FF] bg-clip-text text-transparent font-medium">
              Blockfuse Labs
            </h1>
            <div>
              {roleLoading ? (
                <span className="py-0.5 mt-0.5 px-3 text-[10px] bg-gray-200 text-gray-600 border border-gray-300 rounded-full flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin inline-block mr-1" />{" "}
                  Loading...
                </span>
              ) : isSuperAdmin ? (
                <span className="py-0.5 mt-0.5 px-3 text-[10px] bg-[#DE24FF]/20 text-[#DE24FF] border border-[#DE24FF] rounded-full ">
                  Super Admin
                </span>
              ) : isAdmin ? (
                <span className="py-0.5 mt-0.5 px-3 text-[10px] bg-blue-200 text-blue-700 border border-blue-400 rounded-full ">
                  Admin
                </span>
              ) : isStudent ? (
                <span className="py-0.5 mt-0.5 px-3 text-[10px] bg-green-200 text-green-700 border border-green-400 rounded-full ">
                  Student
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 flex flex-col gap-6 px-1 mt-8">
          {/* General Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-100 mb-2 px-2">
              General
            </h3>
            <div className="space-y-1">
              {adminRoutes.general.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname?.includes(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors",
                      "hover:bg-white/10 text-gray-300",
                      isActive && "bg-white/10 text-white font-medium"
                    )}
                  >
                    <item.icon
                      className={cn("w-4 h-4", isActive && "text-white")}
                    />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Management Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-2 px-2">
              Management
            </h3>
            <div className="space-y-1">
              {adminRoutes.management.map((item) => {
                const isActive = pathname?.includes(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors",
                      "hover:bg-white/10 text-gray-300",
                      isActive && "bg-white/10 text-white font-medium"
                    )}
                  >
                    <item.icon
                      className={cn("w-4 h-4", isActive && "text-white")}
                    />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto pt-6 border-t border-gray-800">
          <div className="space-y-1">
            <ConnectButton.Custom>
              {({ account, openAccountModal, openConnectModal, mounted }) => {
                const connected = mounted && account;
                return (
                  <button
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    disabled={isLoading}
                    onClick={connected ? openAccountModal : openConnectModal}
                    className={`
                      w-full py-3 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 transform
                      ${
                        isLoading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r  from-[#9537EA] to-[#9537EA] hover:from-[#800895] hover:to-[#a015b9]hover:scale-105 hover:shadow-xl active:scale-95"
                      }
                      text-white shadow-lg
                      ${
                        isHovered && !isLoading
                          ? "shadow-2xl shadow-blue-500/25"
                          : ""
                      }
                    `}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                          <span>
                            {wagmiIsConnecting
                              ? "Connecting..."
                              : "Checking Role..."}
                          </span>
                        </>
                      ) : connected ? (
                        <span>{account?.displayName ?? "Wallet"}</span>
                      ) : (
                        <span>Connect Wallet</span>
                      )}
                    </div>
                  </button>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
