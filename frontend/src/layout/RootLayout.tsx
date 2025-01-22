// RootLayout.jsx
import { Outlet } from "react-router";
import Header from "./Header";
import SideBar from "./SideBar";

const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* header */}
      <Header />
      
      <div className="flex flex-1">
        {/* sidebar */}
        <SideBar />
        
        {/* content */}
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
