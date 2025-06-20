'use client'
import Image from "next/image";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminRoutes } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

const DashboardSidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-[16%] px-5 py-6 h-full bg-[#121113] border-r border-black/10 flex flex-col">
      {/* Logo and Title Section */}
      <div className="flex items-center gap-2 mb-8">
        <Image src="/images/logo-two.svg" alt="" height={60} width={60} />
        <div className="flex flex-col">
          <h1 className="text- bg-gradient-to-r from-[#DE24FF] to-[#DE24FF] bg-clip-text text-transparent font-medium">
            Blockfuse Labs
          </h1>
          <div>
            <span className="py-0.5 mt-0.5 px-3 text-[10px] bg-[#DE24FF]/20 text-[#DE24FF] border border-[#DE24FF] rounded-full ">
              Super Admin
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 flex flex-col gap-6 px-1 mt-8">
        {/* General Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-100 mb-2 px-2">General</h3>
          <div className="space-y-1">
            {adminRoutes.general.map((item) => {
              const isActive = pathname === item.href || 
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
                  <item.icon className={cn("w-4 h-4", isActive && "text-white")} />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Management Section */}
        <div>
          <h3 className="text-sm font-semibold text-gray-200 mb-2 px-2">Management</h3>
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
                  <item.icon className={cn("w-4 h-4", isActive && "text-white")} />
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
          {adminRoutes.bottom.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-2 py-2 text-sm rounded-md transition-colors",
                  "hover:bg-white/10 text-gray-300",
                  isActive && "bg-white/10 text-white font-medium",
                  item.title === "Logout" && "text-red-400 hover:bg-red-500/10 hover:text-red-300"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4",
                  isActive && "text-white",
                  item.title === "Logout" && "text-red-400"
                )} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
