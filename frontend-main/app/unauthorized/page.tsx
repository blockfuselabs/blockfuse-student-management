"use client";
import React from "react";
import { ShieldOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDisconnect } from "wagmi";

const UnauthorizedPage = () => {
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const handleBackToLogin = () => {
    disconnect();
    setTimeout(() => {
      router.push("/login");
    }, 300); // Small delay to ensure disconnect
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20 max-w-md w-full flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[#800895] to-[#a015b9] rounded-2xl flex items-center justify-center mb-6 shadow-lg">
          <ShieldOff className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
          Access Denied
        </h1>
        <p className="text-gray-700 text-center mb-6">
          You have been redirected here because you are{" "}
          <span className="font-semibold text-[#800895]">
            neither a student nor an admin
          </span>
          .<br />
          If you believe this is a mistake, please contact support or try
          connecting with a different wallet.
        </p>
        <button
          onClick={handleBackToLogin}
          className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-[#9537EA] to-[#a015b9] text-white font-semibold shadow-lg hover:from-[#800895] hover:to-[#a015b9] transition-all"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
