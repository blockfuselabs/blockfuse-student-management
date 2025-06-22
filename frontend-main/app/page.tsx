"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Users,
  Shield,
  Clock,
  TrendingUp,
  ArrowRight,
  Database,
  Lock,
} from "lucide-react";

export default function Home() {
  const router = useRouter();

  const features = [
    {
      icon: <GraduationCap className="h-6 w-6" />,
      title: "Student Management",
      description:
        "Comprehensive student profiles with blockchain-verified credentials",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Cohort Organization",
      description:
        "Organize students by cohorts and tracks (Web2/Web3) seamlessly",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Attendance Tracking",
      description:
        "Real-time attendance logging with immutable blockchain records",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Role-Based Access",
      description: "Secure access control for admins, staff, and students",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Performance Analytics",
      description: "Track student progress and performance metrics",
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Blockchain Security",
      description: "Decentralized data storage with enhanced security",
    },
  ];

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundImage: 'url("/auth-bg.jpeg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-slate-900/40" />

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500" />

      {/* Main Content */}
      <div className="relative z-10 h-screen flex flex-col">
        {/* Header */}
        <header className="flex-1 flex flex-col justify-center items-center text-center px-4">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-8">
            <Lock className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-white/80">
              Blockchain-Powered Education Management
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Blockfuse Labs
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            The next-generation student management system designed for modern
            educational institutions. Built on blockchain technology for
            transparency, security, and efficiency.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => router.push("/login")}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold rounded-full backdrop-blur-sm"
            >
              Learn More
            </Button>
          </div>
        </header>

        {/* Features Grid */}
        <section className="flex-1 flex flex-col justify-center px-4 py-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-8">
            Powerful Features for Modern Education
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:transform hover:scale-105"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-3 w-fit mb-3">
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/70 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-6 text-center">
          <div className="border-t border-white/10 pt-4">
            <p className="text-white/60">
              © 2024 Blockfuse Labs. All rights reserved. |
              <span className="text-blue-400 ml-1">
                Powered by Blockchain Technology
              </span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
