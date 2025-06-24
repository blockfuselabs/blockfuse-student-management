"use client";
import { Providers } from "./provider";
import { Toaster } from "@/components/ui/toaster";

export default function AppClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      {children}
      <Toaster />
    </Providers>
  );
}