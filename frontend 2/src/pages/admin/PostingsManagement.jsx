import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  AlertTriangle,
  FileText,
  Users,
  Download,
  Trash2,
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function PostingsManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPostings();
  }, []);

  const loadPostings = async () => {
    setLoading(true);
    try {
      const data = await apiClient.adminJobs();
      const normalized = (data || []).map((job) => {
        const branches = Array.isArray(job.allowed_branches)
          ? job.allowed_branches
          : typeof job.allowed_branches === "string"
          ? job.allowed_branches
              .split(",")
              .map((b) => b.trim())
              .filter(Boolean)
          : [];

        const status = (job.job_status || job.status || "").toLowerCase();

        return {
          id: job.job_id || job.id,
          title: job.job_title || "Untitled role",
          company: job.company_name || "Unknown company",
          type: job.job_type || "Not specified",
          status: job.job_status || job.status || "pending",
          applications: Number(job.applications_count ?? 0),
          salary: job.salary_range || "Not provided",
          location: job.location || "Not specified",
          postedDate: job.job_created_at
            ? job.job_created_at.split("T")[0]
            : "N/A",
          deadline: job.application_deadline
            ? job.application_deadline.split("T")[0]
            : "N/A",
          flagged: status === "paused" || status === "rejected",
          branches,
        };
      });

      setPostings(normalized);
    } catch (err) {
      toast({
        title: "Failed to load jobs",
        description: err.message || "Unable to fetch job postings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      [
        "ID",
        "Title",
        "Company",
        "Type",
        "Status",
        "Applications",
        "Salary",
        "Location",
        "Posted Date",
        "Deadline",
        "Branches",
      ],
      ...filteredPostings.map((posting) => [
        posting.id,
        posting.title,
        posting.company,
        posting.type,
        posting.status,
        posting.applications.toString(),
        posting.salary,
        posting.location,
        posting.postedDate,
        posting.deadline,
        posting.branches.join("; "),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-postings-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredPostings = postings.filter((posting) => {
    const matchesSearch =
      posting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      posting.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      posting.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handlePostingAction = async (postingId, action) => {
    if (action === "delete") {
      try {
        await apiClient.adminDeleteJob(postingId);
        setPostings((prevPostings) =>
          prevPostings.filter((posting) => posting.id !== postingId)
        );
        toast({ title: "Job removed" });
      } catch (err) {
        toast({
          title: "Delete failed",
          description: err.message || "Could not delete job.",
          variant: "destructive",
        });
      }
    }
  };

  const flaggedCount = postings.filter((p) => p.flagged).length;
  const totalApplications = postings.reduce(
    (sum, p) => sum + p.applications,
    0
  );

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Job Postings Management
          </h1>
          <p className="text-muted-foreground">
            Review and manage job postings with moderation controls
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Postings"
          value={postings.length.toString()}
          icon={FileText}
          variant="default"
        />
        <StatCard
          title="Flagged Content"
          value={flaggedCount.toString()}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Total Applications"
          value={totalApplications.toString()}
          icon={Users}
          variant="success"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Moderation Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
          <div className="flex gap-4 items-center flex-wrap">
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by title, company, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Postings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Job Postings Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Details</TableHead>
                <TableHead>Company & Location</TableHead>
                <TableHead>Dates & Deadline</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && postings.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    Loading job postings...
                  </TableCell>
                </TableRow>
              )}

              {!loading && filteredPostings.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No job postings found.
                  </TableCell>
                </TableRow>
              )}

              {filteredPostings.map((posting) => (
                <TableRow
                  key={posting.id}
                  className={`hover:bg-muted/50 ${
                    posting.flagged ? "bg-destructive/5" : ""
                  }`}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-foreground">
                          {posting.title}
                        </div>
                        {posting.flagged && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          {posting.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {posting.type}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {posting.salary}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {posting.branches.map((branch) => (
                          <Badge key={branch} variant="secondary" className="text-xs">
                            {branch}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{posting.company}</div>
                      <div className="text-sm text-muted-foreground">
                        {posting.location}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>Posted: {posting.postedDate}</div>
                      <div className="text-muted-foreground">
                        Deadline: {posting.deadline}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">
                        {posting.applications}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePostingAction(posting.id, "delete")}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
