import React from "react";
import { Loader2 } from "lucide-react";

// Use Next.js Image for logo if needed
// import Image from "next/image";

interface LoadingSpinnerProps {
 message?: string;
 children?: React.ReactNode;
 showLogo?: boolean;
 className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
 message = "Loading...",
 children,
 showLogo = false,
 className = "",
}) => {
 return (
  <div className={`flex flex-col items-center justify-center py-8 ${className}`}>
   {showLogo && (
    <img
     src="/images/logo-two.svg"
     alt="BlockFuse Logo"
     className="w-16 h-16 mb-4 animate-pulse"
    />
   )}
   <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
   <div className="text-gray-700 text-base font-medium">
    {children ? children : message}
   </div>
  </div>
 );
};

export default LoadingSpinner; 