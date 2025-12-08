import { useState } from "react";
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
  Clock,
  Download,
  Trash2
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";

const mockPostings = [
  {
    id: "1",
    title: "Software Engineer Intern",
    company: "TechCorp Solutions",
    type: "Internship",
    status: "Approved",
    applications: 45,
    salary: "₹25,000 - ₹30,000/month",
    location: "Indore, MP",
    postedDate: "2024-09-15",
    deadline: "2024-10-15",
    flagged: false,
    branches: ["CSE", "IT"]
  },
  {
    id: "2",
    title: "ML Engineer - Full Stack",
    company: "InnovateLabs",
    type: "Full-time",
    status: "Pending",
    applications: 0,
    salary: "₹8,00,000 - ₹12,00,000/year",
    location: "Bangalore, KA",
    postedDate: "2024-09-18",
    deadline: "2024-11-01",
    flagged: false,
    branches: ["CSE", "IT", "ECE"]
  },
  {
    id: "3",
    title: "Data Scientist",
    company: "DataDriven Analytics",
    type: "Full-time", 
    status: "Featured",
    applications: 78,
    salary: "₹10,00,000 - ₹15,00,000/year",
    location: "Pune, MH",
    postedDate: "2024-09-10",
    deadline: "2024-10-25",
    flagged: false,
    branches: ["CSE", "IT", "ME"]
  },
  {
    id: "4",
    title: "Suspicious High Pay Role",
    company: "SuspiciousTech Inc",
    type: "Full-time",
    status: "Rejected", 
    applications: 12,
    salary: "₹50,00,000/year",
    location: "Unknown",
    postedDate: "2024-09-17",
    deadline: "2024-09-20",
    flagged: true,
    branches: ["CSE"]
  },
  {
    id: "5",
    title: "Product Manager",
    company: "Microsoft India",
    type: "Full-time",
    status: "Approved",
    applications: 156,
    salary: "₹18,00,000 - ₹25,00,000/year", 
    location: "Hyderabad, TS",
    postedDate: "2024-09-05",
    deadline: "2024-10-05",
    flagged: false,
    branches: ["MBA", "CSE", "IT"]
  },
  {
    id: "6",
    title: "Frontend Developer",
    company: "StartupXYZ",
    type: "Part-time",
    status: "Expired",
    applications: 23,
    salary: "₹40,000 - ₹60,000/month",
    location: "Remote",
    postedDate: "2024-08-15",
    deadline: "2024-09-15",
    flagged: false,
    branches: ["CSE", "IT"]
  }
];

export default function PostingsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [postings, setPostings] = useState(mockPostings);

  const exportToCSV = () => {
    const csvContent = [
      ["ID", "Title", "Company", "Type", "Status", "Applications", "Salary", "Location", "Posted Date", "Deadline", "Branches"],
      ...filteredPostings.map(posting => [
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
        posting.branches.join("; ")
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `job-postings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredPostings = postings.filter(posting => {
    const matchesSearch = posting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         posting.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         posting.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handlePostingAction = (postingId, action) => {
    if (action === "delete") {
      setPostings(prevPostings => prevPostings.filter(posting => posting.id !== postingId));
    }
  };

  const flaggedCount = postings.filter(p => p.flagged).length;
  const totalApplications = postings.reduce((sum, p) => sum + p.applications, 0);

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Job Postings Management</h1>
          <p className="text-muted-foreground">Review and manage job postings with moderation controls</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Postings"
          value="134"
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
              {filteredPostings.map((posting) => (
                <TableRow key={posting.id} className={`hover:bg-muted/50 ${posting.flagged ? 'bg-destructive/5' : ''}`}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-foreground">{posting.title}</div>
                        {posting.flagged && (
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {posting.type}
                        </Badge>
                        <div className="text-xs text-muted-foreground">{posting.salary}</div>
                      </div>
                      <div className="flex gap-1">
                        {posting.branches.map(branch => (
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
                      <div className="text-sm text-muted-foreground">{posting.location}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div>Posted: {posting.postedDate}</div>
                      <div className={posting.deadline < "2024-09-20" ? "text-destructive font-medium" : "text-muted-foreground"}>
                        Deadline: {posting.deadline}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-semibold">{posting.applications}</span>
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
