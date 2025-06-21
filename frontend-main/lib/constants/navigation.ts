import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCog,
  Settings,
  Shield,
  BookOpen,
  Calendar,
  FileText,
  BarChart3,
  User,
  LogOut,
  CheckCircle,
} from "lucide-react";

export const adminRoutes = {
  general: [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Cohorts",
      href: "/admin/cohorts",
      icon: GraduationCap,
    },
    {
      title: "Students",
      href: "/admin/students",
      icon: Users,
    },
    {
      title: "Mentors",
      href: "/admin/mentors",
      icon: UserCog,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
    {
      title: "Admins",
      href: "/admin/admins",
      icon: Shield,
    },
  ],
  management: [
    {
      title: "Attendance",
      href: "/admin/attendance",
      icon: CheckCircle,
    },
    {
      title: "Courses",
      href: "/admin/courses",
      icon: BookOpen,
    },
    {
      title: "Schedule",
      href: "/admin/schedule",
      icon: Calendar,
    },
    {
      title: "Reports",
      href: "/admin/reports",
      icon: FileText,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
  ],
  bottom: [
    {
      title: "Profile",
      href: "/admin/profile",
      icon: User,
    },
    {
      title: "Logout",
      href: "/admin/logout",
      icon: LogOut,
    },
  ],
};

export const studentRoutes = {
  // Student routes will be added here
  general: [],
  management: [],
  bottom: [
    {
      title: "Profile",
      href: "/admin/profile",
      icon: User,
    },
    {
      title: "Logout",
      href: "/admin/logout",
      icon: LogOut,
    },
  ],
};
