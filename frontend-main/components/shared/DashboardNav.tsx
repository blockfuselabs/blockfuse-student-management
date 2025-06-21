"use client";
import React from "react";
import Bell from "./icons/Bell";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Copy, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAccount } from "wagmi";


const DashboardNav = () => {
  const { address } = useAccount();
  const truncateAddress = (addr?: string) => {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  };
  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Wallet address copied to clipboard!");
    } else {
      toast.error("No wallet address to copy.");
    }
  };

  return (
    <nav className="w-full sticky top-0 py-3.5 border-b border-black/10 bg-white px-8 flex items-center justify-between">
      <p className="text-gray-500 text-xl font-medium">Dashboard</p>

      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
          <Bell />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-1">
              <div className="h-7 w-7 overflow-hidden  rounded-full relative">
                <Image
                  src="https://img.freepik.com/free-vector/hand-drawn-nft-style-ape-illustration_23-2149611030.jpg?semt=ais_hybrid&w=740"
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-gray-500">{truncateAddress(address)}</p>
              <ChevronDown className="text-gray-600 text-sm"  />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Profile</p>
                <p className="text-xs leading-none text-muted-foreground">
                {truncateAddress(address)}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={copyToClipboard}>
              <Copy className="mr-2 h-4 w-4" />
              <span>Copy Address</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default DashboardNav;
