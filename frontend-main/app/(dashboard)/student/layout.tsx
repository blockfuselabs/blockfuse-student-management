import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

type Props = {
  children: React.ReactNode;
};

const layout = ({ children }: Props) => {
  return (
    <div className="flex justify-center  h-screen">
      <div className="max-w-5xl w-full h-full p-6">
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-2">
            <Image src="/images/logo-two.svg" alt="" height={45} width={45} />
            <div className="">
              <h4 className="text-[#9434EA] font-medium">BlockfuseLabs</h4>
              <p className="text-[10px] py-0.5 px-1 text-center bg-[#9434EA]/20 rounded-xl text-[#9434EA]">
                Student Portal
              </p>
            </div>
          </div>

          <Button>Disconnect wallet</Button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default layout;
