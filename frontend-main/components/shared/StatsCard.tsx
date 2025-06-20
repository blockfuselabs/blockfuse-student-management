import { ArrowDown, ArrowUp } from "lucide-react";
import React from "react";

type Props = {
  title: string;
  value: string | number;
  growth: "up" | "down";
  percentage: number;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
};

const StatisticsCard = ({ 
  title, 
  value, 
  growth, 
  percentage, 
  // icon,
  iconBgColor = "#F0F9FC",
  // iconColor = "#0209CC"
}: Props) => {
  return (
    <div className="w-full border border-[#eff1f4] bg-white rounded-[10px] px-4 py-4 flex flex-col">
      <p className="text-xs font-medium text-gray-600"> {title} </p>
      <h2 className="text-[22px] font-bold">{value} </h2>

      <div className="w-full flex justify-between items-end">
        <div className="flex gap-2 items-center">
          {growth == "up" ? (
            <span className="w-[50px] h-[22px] bg-[#EBFFF5] rounded-[30px] border border-[#009C51] text-[#009C51] flex gap-1 items-center justify-center text-[10px]">
              <ArrowUp size={12} />
              {percentage}%
            </span>
          ) : (
            <span className="w-[50px] h-[22px] bg-[#FFEBEB] rounded-[30px] border border-[#C20000] text-[#C20000] flex gap-1 items-center justify-center text-[10px]">
              <ArrowDown size={12} />
              {percentage}%
            </span>
          )}

          <span className="text-text-300 text-[10px]">Vs last month</span>
        </div>

        <div 
          className="h-12 w-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconBgColor }}
        >
        {/* {icon} */}
        </div>
      </div>
    </div>
  );
};

export default StatisticsCard;
