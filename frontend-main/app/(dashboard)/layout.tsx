import React from "react";

type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
  return (
    <main className="w-full h-screen overflow-hidden flex">
      {/* sidebar */}
      <div className="w-[15%] bg-white h-full border-r border-black/10"></div>

      {/* main app wrapper */}
      <div className="flex-1 flex flex-col min-h-full bg-white">
        {/* navbar */}
        <nav className="w-full h-[68px] border-b border-black/10 bg-white"></nav>
        {/* main content */}
        <div className="flex-1 p-4">
          {children}
        </div>
      </div>
    </main>
  );
};

export default layout;
