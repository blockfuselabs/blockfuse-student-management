import DashboardNav from "@/components/shared/DashboardNav";
import DashboardSidebar from "@/components/shared/DashboardSidebar";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
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

export default layout;
