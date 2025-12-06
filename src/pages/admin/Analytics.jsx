import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  FileText, 
  Eye,
  Download,
  Calendar,
  Target,
  Activity
} from "lucide-react";

// Analytics state (driven from backend)
import React from "react";

const nowMonth = (d) => new Date(d).toLocaleString(undefined, { month: 'short', year: 'numeric' });


export default function Analytics() {
  const [loading, setLoading] = React.useState(true);
  const [keyMetrics, setKeyMetrics] = React.useState({ totalUsers: 0, activeCompanies: 0, jobPostings: 0, uniqueApplicants: 0, applications: 0 });

  const [registrationData, setRegistrationData] = React.useState([]);
  const [jobApplicationData, setJobApplicationData] = React.useState([]);
  const [companyData, setCompanyData] = React.useState([]);
  const [engagementData, setEngagementData] = React.useState([]);
  const [topPerformingJobs, setTopPerformingJobs] = React.useState([]);
  const [recentActivities, setRecentActivities] = React.useState([]);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const { apiFetch } = await import("@/lib/api");

        // Fetch students and alumni (includes created_at)
        const studentsResp = await apiFetch(`/search/students?limit=1000`);
        const alumniResp = await apiFetch(`/search/alumni?limit=1000`);

        const students = studentsResp?.data || [];
        const alumni = alumniResp?.data || [];

        // Total users
        const totalUsers = students.length + alumni.length;

        // Registrations per month (group)
        const regMap = {};
        for (const s of students) {
          const key = nowMonth(s.created_at || s.createdAt || new Date());
          regMap[key] = regMap[key] || { month: key, students: 0, alumni: 0 };
          regMap[key].students += 1;
        }
        for (const a of alumni) {
          const key = nowMonth(a.created_at || a.createdAt || new Date());
          regMap[key] = regMap[key] || { month: key, students: 0, alumni: 0 };
          regMap[key].alumni += 1;
        }

        const registration = Object.values(regMap).sort((a, b) => new Date(a.month) - new Date(b.month));

        // Company distribution by industry using alumni+company
        const industryMap = {};
        for (const a of alumni) {
          if (a.industry) industryMap[a.industry] = (industryMap[a.industry] || 0) + 1;
        }
        const companyChart = Object.entries(industryMap).map(([name, value], i) => ({ name, value, color: ["#8884d8","#82ca9d","#ffc658","#ff7300","#00ff88"][i % 5] }));

        // Jobs and top performing jobs
        const jobsResp = await apiFetch(`/admin/jobs`);
        const jobs = jobsResp || [];

        // For each job, fetch applicants and compute counts
        let totalApplications = 0;
        const applicantFreq = {}; // date -> count
        const jobApplicants = [];
        const uniqueUserIds = new Set();

        for (const job of jobs) {
          try {
            const viewRes = await apiFetch(`/job/view-applicants/${job.job_id}`);
            const applicants = viewRes?.applicants || [];
            totalApplications += applicants.length;
            jobApplicants.push({ id: job.job_id, title: job.job_title, company: job.company_name, applications: applicants.length });

            for (const ap of applicants) {
              const key = new Date(ap.applied_at).toISOString().split('T')[0];
              applicantFreq[key] = (applicantFreq[key] || 0) + 1;
              uniqueUserIds.add(ap.student_user_id || ap.user_id || ap.student_userId || ap.userId);
            }
          } catch (err) {
            console.error("Failed to fetch applicants for job", job.job_id, err);
          }
        }

        // Top performing jobs
        jobApplicants.sort((a, b) => b.applications - a.applications);

        // Weekly chart - last 7 days
        const last7 = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split('T')[0];
          last7.push({ day: d.toLocaleDateString(undefined, { weekday: 'short' }), applications: applicantFreq[key] || 0 });
        }

        // engagement: monthly aggregated applications
        const monthly = {};
        for (const [date, c] of Object.entries(applicantFreq)) {
          const month = new Date(date).toLocaleString(undefined,{month:'short',year:'numeric'});
          monthly[month] = (monthly[month] || 0) + c;
        }
        const engagement = Object.entries(monthly).map(([date, count]) => ({ date, pageViews: count, uniqueVisitors: count })).sort((a,b) => new Date(a.date)-new Date(b.date));

        // Unique applicants
        const uniqueApplicants = new Set();
        for (const job of jobApplicants) {
          // not easily available; we can compute from applicants data earlier but we didn't store per user id; re-query all jobs
        }

        // Fetch recent activities from new jobs and new alumni
        const recent = [];
        for (const job of jobs.slice(0,5)) {
          recent.push({ time: job.job_created_at || job.created_at, action: 'New job posting', details: `${job.job_title} at ${job.company_name}`, type: 'job' });
        }
        for (const a of alumni.slice(0,5)) {
          recent.push({ time: a.created_at, action: 'Alumni registration', details: `${a.name} (${a.grad_year})`, type: 'user' });
        }

        if (!mounted) return;

        setKeyMetrics({ totalUsers, activeCompanies: companyChart.length, jobPostings: jobs.length, uniqueApplicants: uniqueUserIds.size, applications: totalApplications });
        setRegistrationData(registration);
        setCompanyData(companyChart);
        setJobApplicationData(last7);
        setTopPerformingJobs(jobApplicants.slice(0,5));
        setEngagementData(engagement);
        setRecentActivities(recent);
      } catch (err) {
        console.error("Analytics load error", err);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);
  const exportAnalytics = () => {
    const csvRows = [
      ["Metric", "Value", "Period"],
      ["Total Users", keyMetrics.totalUsers || 0, "All Time"],
      ["Active Companies", keyMetrics.activeCompanies || 0, "Current"],
      ["Job Postings", keyMetrics.jobPostings || 0, "All Time"],
      ["Applications", keyMetrics.applications || 0, "All Time"],
      ["Unique Applicants", keyMetrics.uniqueApplicants || 0, "All Time"],
    ];
    const csvContent = csvRows.map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 space-y-6">
      {loading && (
        <div className="text-sm text-muted-foreground">Loading analytics from server...</div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor platform performance and user engagement
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="1year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportAnalytics} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{keyMetrics?.totalUsers ?? '—'}</div>
            <div className="flex items-center text-xs text-success">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.3% from last month
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{keyMetrics?.activeCompanies ?? '—'}</div>
            <div className="flex items-center text-xs text-success">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.7% from last month
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Job Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{keyMetrics?.applications ?? '—' }</div>
            <div className="flex items-center text-xs text-success">
              <TrendingUp className="h-3 w-3 mr-1" />
              +24.1% from last month
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">{keyMetrics?.uniqueApplicants ?? '—'}</div>
            <div className="flex items-center text-xs text-destructive">
              <TrendingDown className="h-3 w-3 mr-1" />
              -3.2% from last month
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Registration Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={registrationData}> 
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="alumni" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="students" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="faculty" stackId="1" stroke="#ffc658" fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Company Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={companyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {companyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Weekly Job Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobApplicationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applications" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Platform Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="pageViews" stroke="#8884d8" strokeWidth={2} />
                <Line type="monotone" dataKey="uniqueVisitors" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="space-y-1">
                    <div className="font-medium">{job.title}</div>
                    <div className="text-sm text-muted-foreground">{job.company}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-semibold">{job.applications} apps</div>
                    <div className="text-sm text-muted-foreground">{job.views} views</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className={`w-2 h-2 mt-2 rounded-full ${
                    activity.type === 'job' ? 'bg-primary' :
                    activity.type === 'user' ? 'bg-success' :
                    activity.type === 'company' ? 'bg-warning' :
                    activity.type === 'email' ? 'bg-info' :
                    'bg-muted-foreground'
                  }`} />
                  <div className="space-y-1 flex-1">
                    <div className="font-medium">{activity.action}</div>
                    <div className="text-sm text-muted-foreground">{activity.details}</div>
                    <div className="text-xs text-muted-foreground">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversion Rates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Application Rate</span>
              <Badge variant="secondary">23.4%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Interview Rate</span>
              <Badge variant="secondary">8.7%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Hiring Rate</span>
              <Badge variant="secondary">2.3%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Platform Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">System Uptime</span>
              <Badge className="bg-success text-success-foreground">99.9%</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Response Time</span>
              <Badge variant="secondary">142ms</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Error Rate</span>
              <Badge className="bg-success text-success-foreground">0.01%</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Satisfaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Overall Rating</span>
              <Badge className="bg-success text-success-foreground">4.8/5</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Feature Requests</span>
              <Badge variant="secondary">23</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Bug Reports</span>
              <Badge className="bg-success text-success-foreground">2</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}