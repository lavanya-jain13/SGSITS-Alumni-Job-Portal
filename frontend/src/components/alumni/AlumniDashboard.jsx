import { Building2, Users, Briefcase, Eye } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { TopApplicants } from "./TopApplicants";
import { QuickAccess } from "./QuickAccess";
import "../../alumni.css"; // Keep if you have other alumni-specific styles
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/authSlice";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

const AlumniDashboard = () => {
  const { user } = useSelector(selectAuth);
  const displayName =
    user?.name ||
    (user?.email ? user.email.split("@")[0] : "Alumni");
  const [metrics, setMetrics] = useState({
    jobsPosted: 0,
    applications: 0,
    companyViews: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await apiClient.getMyJobs();
        const jobs = data?.jobs || [];
        const jobsPosted = jobs.length;
        const applications = jobs.reduce(
          (acc, job) => acc + (Number(job.applicant_count) || 0),
          0
        );
        // Company views not available in backend; leave as 0 for now.
        setMetrics({
          jobsPosted,
          applications,
          companyViews: 0,
          loading: false,
        });
      } catch (_err) {
        setMetrics((prev) => ({ ...prev, loading: false }));
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="alumni-theme space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {displayName}</h1>
        <p className="text-muted-foreground">
          Manage your job postings and connect with talented SGSITS students.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <MetricCard
          title="Jobs Posted"
          value={metrics.loading ? "…" : metrics.jobsPosted}
          change={null}
          icon={Briefcase}
          description="Active + closed"
        />
        <MetricCard
          title="Applications Received"
          value={metrics.loading ? "…" : metrics.applications}
          change={null}
          icon={Users}
          description="This month"
        />
        <MetricCard
          title="Company Views"
          value={metrics.loading ? "…" : metrics.companyViews}
          change={null}
          icon={Eye}
          description="Profile visits"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart and Applicants */}
        <div className="space-y-6 lg:col-span-2">
          <TopApplicants />
        </div>

        {/* Quick Access Sidebar */}
        <div className="space-y-6 bg-sidebar-alumni p-4 rounded-lg">
          <QuickAccess />
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;
