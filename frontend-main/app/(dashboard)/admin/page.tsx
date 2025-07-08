"use client";
import AdminStats from "@/components/admin/AdminStats";
import React from "react";
import { useUserRole } from "@/lib/hooks/useUserRole";
import { useAccount } from "wagmi";
import { useGetAdminUsername } from "@/lib/hooks/useAdminUsernameFacet";
// import { GraduationCap, BookOpen, UserCog } from "lucide-react";

export const greetUser = () => {
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    return `Good morning `;
  }
  if (currentHour < 18) {
    return `Good afternoon`;
  }
  return `Good evening`;
};

const AdminDashboard = () => {
  const { isAdmin, isSuperAdmin, isLoading: roleLoading } = useUserRole();
  const { address } = useAccount();
  const { data: adminUsername, isLoading: usernameLoading } =
    useGetAdminUsername(isAdmin && !isSuperAdmin ? address : undefined);

  const greeting = greetUser();
  let namePart = null;
  if (roleLoading || (isAdmin && !isSuperAdmin && usernameLoading)) {
    namePart = (
      <span className="font-semibold pl-1 text-gray-400">Loading...</span>
    );
  } else if (isSuperAdmin) {
    namePart = null;
  } else if (isAdmin && !isSuperAdmin) {
    const usernameStr = typeof adminUsername === "string" ? adminUsername : "";
    namePart = (
      <span className="font-semibold pl-1">{usernameStr || "No username"}</span>
    );
  }

  return (
    <div className="px-4 w-full flex flex-col gap-6 py-2">
      <div className="">
        <h3 className="text-base md:text-xl font-semibold text-grey-800">
          {greeting}
          <span className="inline md:hidden leading-none tracking-tighter">
            <br />
          </span>
          <span className="">
             {namePart}
          </span>
          
          &nbsp; 👋🏾.
        </h3>

        <p className="text-gray-500 mt-1 font-medium">
          Here&apos;s an overview of your Blockfuse labs performance and key
          metrics.
        </p>
      </div>

      <div className="w-full">
        <AdminStats />
      </div>

      {/* <div className="flex w-full gap-4">
        <div className="h-[400px] w-1/3 bg-white rounded-xl"></div>
        <div className="h-[400px] w-2/3 bg-white rounded-xl"></div>

      </div>       */}
    </div>
  );
};

export default AdminDashboard;
