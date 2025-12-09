import { useEffect, useState } from "react";
import { Users, Building2 } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { UserManagement } from "@/components/admin/UserManagement";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        apiClient.adminStats(),
        apiClient.adminUsers(),
      ]);

      setStats(statsRes || {});
      const normalizedUsers = [
        ...(usersRes?.students || []).map((u) => ({
          id: u.user_id,
          name: u.name,
          role: "student",
          status: u.status || "approved",
          email: u.email,
        })),
        ...(usersRes?.alumni || []).map((u) => ({
          id: u.user_id,
          name: u.name,
          role: "alumni",
          status: u.status || "pending",
          email: u.email,
          companyId: u.company_id,
          companyName: u.company_name,
          companyStatus: u.company_status,
        })),
      ];
      setUsers(normalizedUsers);
    } catch (err) {
      toast({
        title: "Failed to load admin data",
        description: err.message || "Unable to fetch dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveAlumni = async (userId) => {
    try {
      await apiClient.adminVerifyAlumni(userId, "approved");
      toast({ title: "Alumni approved" });
      await loadData();
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
      await apiClient.adminDeleteUser(userId);
      toast({ title: "User removed" });
      await loadData();
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err.message || "Could not delete user.",
        variant: "destructive",
      });
    }
  };

  const handlePromote = async (userId) => {
    try {
      await apiClient.adminPromoteUser(userId);
      toast({ title: "User promoted to admin" });
      await loadData();
    } catch (err) {
      toast({
        title: "Promote failed",
        description: err.message || "Could not promote user.",
        variant: "destructive",
      });
    }
  };

  const studentCount = stats?.studentsCount ?? 0;
  const alumniCount = stats?.alumniCount ?? 0;
  const approvedCompanies = stats?.approvedCompanies ?? 0;

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
          users={users}
          loading={loading}
          onApproveAlumni={handleApproveAlumni}
          onDeleteUser={handleDeleteUser}
          onPromoteUser={handlePromote}
        />
      </div>
    </div>
  );
}
