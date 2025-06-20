"use client";
import AdminStats from "@/components/admin/AdminStats";
import React from "react";
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
  return (
    <div className="px-4 w-full flex flex-col gap-6 py-2">
      <div className="">

      <h3 className="text-base md:text-xl font-semibold text-grey-800">
        {greetUser()},
        <span className="inline md:hidden leading-none tracking-tighter">
          <br />
        </span>
        <span className="font-semibold pl-1">Scarface.eth</span>&nbsp; 👋🏾.
      </h3>

      <p className="text-gray-500 mt-1 font-medium">
        Here&apos;s an overview of your Blockfuse labs performance and key metrics.
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
