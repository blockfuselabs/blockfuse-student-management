import { useState } from "react";
import { NavLink } from "react-router";
// assets
import { LayoutDashboard, Settings, User, FileText } from "lucide-react";

const SideBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Dummy navigation array
  const navItems = [
    { name: "Dashboard", icon: <LayoutDashboard size="30" />, path: "/" },
    { name: "Profile", icon: <User size="30" />, path: "/profile" },
    { name: "Documents", icon: <FileText size="30" />, path: "/documents" },
  ];

  return (
    <div className="px-[30px] flex items-center gap-1">
      {/* Sidebar */}
      <div
        className={`${
          isExpanded ? "w-[200px]" : "w-[70px]"
        } h-[750px] py-[50px] bg-[#233255] border border-[#F6AD2B] rounded-tl-[50px] rounded-tr-[50px] flex flex-col items-center transition-all duration-300`}
      >
        <div className="flex flex-col gap-8 px-4">
          {navItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                `flex items-center gap-3 cursor-pointer ${
                  isActive
                    ? "text-[#FFBF4D]"
                    : "text-white hover:text-[#FFBF4D]"
                }`
              }
            >
              <div>{item.icon}</div>
              {isExpanded && (
                <span className="text-lg font-medium">{item.name}</span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Settings Icon at the Bottom */}
        <div className="mt-auto px-4">
          <NavLink
            to="/settings"
            className={({ isActive }: { isActive: boolean }) =>
              `flex items-center gap-3 cursor-pointer ${
                isActive ? "text-[#FFBF4D]" : "text-white hover:text-[#FFBF4D]"
              }`
            }
          >
            <div>e
              <Settings size="30" />
            </div>
            {isExpanded && (
              <span className="text-lg font-medium">Settings</span>
            )}
          </NavLink>
        </div>
      </div>

      {/* Clickable Small Div */}
      <div
        className="w-[6px] h-[100px] bg-white hover:bg-[#FFBF4D] border-[1px] border-gray-[#23325517] rounded-[50px] hover:scale-105 cursor-pointer transition-all duration-300"
        style={{ boxShadow: "0px 0px 10px 0px #23325517" }}
        onClick={() => setIsExpanded(!isExpanded)}
      ></div>
    </div>
  );
};

export default SideBar;
