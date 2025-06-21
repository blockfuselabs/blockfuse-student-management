"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDisconnect } from "wagmi";
import { Loader2 } from "lucide-react";

const LogoutPage = () => {
 const { disconnect } = useDisconnect();
 const router = useRouter();

 useEffect(() => {
  const handleLogout = async () => {
   try {
    // Disconnect the wallet
    disconnect();

    // Small delay to ensure disconnect is processed
    setTimeout(() => {
     // Redirect to login page
     router.push("/login");
    }, 500);
   } catch (error) {
    console.error("Error during logout:", error);
    // Redirect to login page even if there's an error
    router.push("/login");
   }
  };

  handleLogout();
 }, [disconnect, router]);

 return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
   <div className="text-center">
    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
    <h2 className="text-xl font-semibold text-gray-800 mb-2">Logging out...</h2>
    <p className="text-gray-600">Disconnecting wallet and redirecting to login</p>
   </div>
  </div>
 );
};

export default LogoutPage; 