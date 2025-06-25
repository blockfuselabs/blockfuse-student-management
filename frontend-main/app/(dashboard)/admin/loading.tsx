import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <LoadingSpinner showLogo message="Loading dashboard..." />
    </div>
  );
} 