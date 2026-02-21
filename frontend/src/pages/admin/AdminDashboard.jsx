import { StatCard } from "@/components/admin/StatCard";
import { UserManagement } from "@/components/admin/UserManagement";
import { Building2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useAdminStats,
  useAdminUsers,
  useApproveAlumni,
  useDeleteUser,
  usePromoteUser,
} from "@/hooks/useAdminData";

export default function AdminDashboard() {
  const { toast } = useToast();

  const { data: stats, isLoading: isLoadingStats, isError: isErrorStats } = useAdminStats();
  const { data: users, isLoading: isLoadingUsers, isError: isErrorUsers } = useAdminUsers();

  const approveAlumniMutation = useApproveAlumni();
  const deleteUserMutation = useDeleteUser();
  const promoteUserMutation = usePromoteUser();

  const handleApproveAlumni = async (userId) => {
    try {
      await approveAlumniMutation.mutateAsync(userId);
      toast({ title: "Alumni approved" });
    } catch (err) {
      toast({
        title: "Approval failed",
        description: err.message || "Could not approve alumni.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast({ title: "User removed" });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err.message || "Could not delete user.",
        variant: "destructive",
      });
    }
  };

  const studentCount = stats?.studentsCount ?? 0;
  const alumniCount = stats?.alumniCount ?? 0;
  const approvedCompanies = stats?.approvedCompanies ?? 0;

  const loading = isLoadingStats || isLoadingUsers;
  const error = isErrorStats || isErrorUsers;

  if (error) {
    toast({
      title: "Failed to load admin data",
      description: "Unable to fetch dashboard data. Please try again.",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex-1 space-y-8 p-8">
        {/* Dashboard Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage your SGSITS alumni platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Active Companies"
            value={approvedCompanies}
            icon={Building2}
            variant="success"
          />
          <StatCard
            title="Student Users"
            value={studentCount}
            icon={Users}
            variant="default"
          />
          <StatCard
            title="Alumni Users"
            value={alumniCount}
            icon={Users}
            variant="default"
          />
        </div>

        {/* User Management Section */}
        <UserManagement
          users={users || []}
          loading={loading}
          onApproveAlumni={handleApproveAlumni}
          onDeleteUser={handleDeleteUser}
        />
      </div>
    </div>
  );
}