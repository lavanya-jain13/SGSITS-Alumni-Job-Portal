import { Users, Building2 } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { UserManagement } from "@/components/admin/UserManagement";

export default function AdminDashboard() {
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
            value="92"
            icon={Building2}
            variant="success"
          />
          <StatCard
            title="Student Users"
            value="1,240"
            icon={Users}
            variant="default"
          />
          <StatCard
            title="Alumni Users"
            value="860"
            icon={Users}
            variant="default"
          />
        </div>

        {/* User Management Section */}
        <UserManagement />
      </div>
    </div>
  );
}
