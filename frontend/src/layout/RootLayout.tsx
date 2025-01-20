// components
import { Outlet } from "react-router";
import Header from "./Header";
import SideBar from "./SideBar";

const RootLayout = () => {
  return (
    <div className="">
      {/* header */}
      <Header />

      <div className="flex gap-5">
        {/* sidebar */}
        <SideBar />

        {/* content */}
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default RootLayout;
