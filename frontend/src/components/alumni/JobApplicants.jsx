// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Progress } from "@/components/ui/progress";
// import { Search, Filter, Eye, Download, MessageSquare, X, ArrowLeft } from "lucide-react";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { useNavigate } from "react-router-dom";

// const applicantsData = [
//   {
//     id: 1,
//     name: "Jane Smith",
//     class: "Class of 2024",
//     branch: "Information Technology",
//     applicationTime: "9 Jan 2024, 07:45 pm",
//     skillMatch: 92,
//     skills: ["Java", "Spring Boot", "MySQL"],
//     status: "Shortlisted",
//     statusColor: "bg-green-100 text-green-800"
//   },
//   {
//     id: 2,
//     name: "Mike Wilson",
//     class: "Class of 2024", 
//     branch: "Information Technology",
//     applicationTime: "6 Jan 2024, 05:00 pm",
//     skillMatch: 88,
//     skills: ["Python", "Django", "AWS"],
//     status: "Interviewing",
//     statusColor: "bg-blue-100 text-blue-800"
//   },
//   {
//     id: 3,
//     name: "John Doe",
//     class: "Class of 2024",
//     branch: "Computer Science",
//     applicationTime: "10 Jan 2024, 04:00 pm", 
//     skillMatch: 85,
//     skills: ["Python", "Django", "JavaScript"],
//     status: "Submitted",
//     statusColor: "bg-yellow-100 text-yellow-800"
//   },
//   {
//     id: 4,
//     name: "Bob Johnson",
//     class: "Class of 2024", 
//     branch: "Computer Science",
//     applicationTime: "8 Jan 2024, 02:50 pm",
//     skillMatch: 78,
//     skills: ["JavaScript", "Node.js", "MongoDB"],
//     status: "Submitted", 
//     statusColor: "bg-yellow-100 text-yellow-800"
//   }
// ];

// export function JobApplicants() {
//   const navigate = useNavigate();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedBranches, setSelectedBranches] = useState([]);
//   const [selectedStatus, setSelectedStatus] = useState("");
//   const [sortBy, setSortBy] = useState("relevance");
  
//   const branches = ["Computer Science", "Information Technology"];
//   const statuses = ["Shortlisted", "Interviewing", "Submitted"];

//   const filteredApplicants = applicantsData.filter(applicant => {
//     const matchesSearch = applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          applicant.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
//     const matchesBranch = selectedBranches.length === 0 || selectedBranches.includes(applicant.branch);
//     const matchesStatus = !selectedStatus || applicant.status === selectedStatus;
    
//     return matchesSearch && matchesBranch && matchesStatus;
//   });

//   const addBranchFilter = (branch) => {
//     if (!selectedBranches.includes(branch)) {
//       setSelectedBranches([...selectedBranches, branch]);
//     }
//   };

//   const removeBranchFilter = (branch) => {
//     setSelectedBranches(selectedBranches.filter(b => b !== branch));
//   };

//   const clearAllFilters = () => {
//     setSelectedBranches([]);
//     setSelectedStatus("");
//     setSearchTerm("");
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-4">
//           <Button variant="ghost" size="sm" onClick={() => navigate('/alumni')}>
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back
//           </Button>
//           <div>
//             <h1 className="text-2xl font-bold">Job Applicants</h1>
//             <p className="text-muted-foreground">
//               Senior Software Engineer at TechCorp Inc. • Showing {filteredApplicants.length} of {applicantsData.length} applicants
//             </p>
//           </div>
//         </div>
//         <Button variant="outline" onClick={clearAllFilters}>
//           <X className="h-4 w-4 mr-2" />
//           Clear All
//         </Button>
//       </div>

//       {/* Filters */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="flex items-center space-x-2">
//             <Filter className="h-5 w-5" />
//             <span>Search & Filters</span>
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           {/* Search */}
//           <div className="relative">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//             <Input
//               placeholder="Search by name, branch, or skills..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="pl-10"
//             />
//           </div>

//           {/* Filter Row */}
//           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//             <div>
//               <label className="text-sm font-medium mb-2 block">Sort By</label>
//               <Select value={sortBy} onValueChange={setSortBy}>
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="relevance">Relevance (Skill Match)</SelectItem>
//                   <SelectItem value="date">Application Date</SelectItem>
//                   <SelectItem value="name">Name</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <label className="text-sm font-medium mb-2 block">Branches</label>
//               <Select onValueChange={addBranchFilter}>
//                 <SelectTrigger>
//                   <SelectValue placeholder={selectedBranches.length ? `${selectedBranches.length} selected` : "Select branches..."} />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {branches.map(branch => (
//                     <SelectItem key={branch} value={branch}>{branch}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <label className="text-sm font-medium mb-2 block">Status</label>
//               <Select value={selectedStatus} onValueChange={setSelectedStatus}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select status..." />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {statuses.map(status => (
//                     <SelectItem key={status} value={status}>{status}</SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div>
//               <label className="text-sm font-medium mb-2 block">Skills</label>
//               <Select>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select skills..." />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="java">Java</SelectItem>
//                   <SelectItem value="python">Python</SelectItem>
//                   <SelectItem value="javascript">JavaScript</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Active Filters */}
//           {selectedBranches.length > 0 && (
//             <div className="flex flex-wrap gap-2">
//               {selectedBranches.map(branch => (
//                 <Badge key={branch} variant="secondary" className="flex items-center space-x-1">
//                   <span>{branch}</span>
//                   <X className="h-3 w-3 cursor-pointer" onClick={() => removeBranchFilter(branch)} />
//                 </Badge>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Applicants Table */}
//       <Card>
//         <CardContent className="p-0">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Student Name</TableHead>
//                 <TableHead>Branch</TableHead>
//                 <TableHead>Application Time</TableHead>
//                 <TableHead>Skill Match</TableHead>
//                 <TableHead>Skills</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredApplicants.map((applicant) => (
//                 <TableRow key={applicant.id}>
//                   <TableCell className="font-medium">
//                     <div className="flex items-center space-x-3">
//                       <Avatar className="h-8 w-8">
//                         <AvatarImage src={`/api/placeholder/32/32`} />
//                         <AvatarFallback>{applicant.name.charAt(0)}</AvatarFallback>
//                       </Avatar>
//                       <div>
//                         <div className="font-medium">{applicant.name}</div>
//                         <div className="text-sm text-muted-foreground">{applicant.class}</div>
//                       </div>
//                     </div>
//                   </TableCell>
//                   <TableCell>{applicant.branch}</TableCell>
//                   <TableCell className="text-sm">{applicant.applicationTime}</TableCell>
//                   <TableCell>
//                     <div className="flex items-center space-x-2">
//                       <Progress value={applicant.skillMatch} className="w-16" />
//                       <span className="text-sm font-medium">{applicant.skillMatch}%</span>
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <div className="flex flex-wrap gap-1">
//                       {applicant.skills.map((skill, index) => (
//                         <Badge key={index} variant="outline" className="text-xs">
//                           {skill}
//                         </Badge>
//                       ))}
//                     </div>
//                   </TableCell>
//                   <TableCell>
//                     <Badge className={applicant.statusColor}>
//                       {applicant.status}
//                     </Badge>
//                   </TableCell>
//                   <TableCell>
//                     <div className="flex items-center space-x-2">
//                       <Button variant="ghost" size="sm">
//                         <Eye className="h-4 w-4" />
//                         <span className="ml-1 hidden sm:inline">View</span>
//                       </Button>
//                       <Button variant="ghost" size="sm">
//                         <Download className="h-4 w-4" />
//                         <span className="ml-1 hidden sm:inline">Resume</span>
//                       </Button>
//                       <Button variant="ghost" size="sm">
//                         <MessageSquare className="h-4 w-4" />
//                         <span className="ml-1 hidden sm:inline">Message</span>
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Search, Filter, Eye, Download, X, ArrowLeft, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

export function JobApplicants({
  backPath = "/alumni",
  detailsPath = "/alumni/applicant-details",
  heading = "Job Applicants",
  contextText,
  loadJobs,
  loadApplicants,
} = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranches, setSelectedBranches] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const branches = ["Computer Science", "Information Technology"];
  const statuses = ["pending", "accepted", "rejected", "on_hold"];

  const statusLabel = {
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Rejected",
    on_hold: "On Hold",
  };

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    on_hold: "bg-blue-100 text-blue-800",
  };

  const splitSkills = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter(Boolean).map((s) => String(s).trim());
    return String(value)
      .split(/[,|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const formatDateTime = (value) =>
    value ? new Date(value).toLocaleString() : "Not available";

  const normalizeApplicants = (rows = []) =>
    rows.map((row) => ({
      id: row.application_id,
      applicationId: row.application_id,
      name: row.student_name || row.user_email || "Unknown",
      class: row.student_grad_year ? `Grad ${row.student_grad_year}` : "N/A",
      branch: row.student_branch || "N/A",
      applicationTime: formatDateTime(row.applied_at),
      skillMatch: null,
      skills: splitSkills(row.student_skills),
      status: row.application_status || "pending",
      statusColor: statusColor[row.application_status] || "bg-gray-100 text-gray-800",
      resume_url: row.resume_url || "",
      user_email: row.user_email || "",
      user_id: row.user_id,
      job_id: row.job_id || selectedJobId,
    }));

  const fetchJobs = loadJobs || (async () => {
    const res = await apiClient.getMyJobs();
    return res?.jobs || [];
  });

  const fetchApplicants = loadApplicants || (async (jobId) => {
    const res = await apiClient.getJobApplicants(jobId);
    return res?.applicants || [];
  });

  const jobIdFromQuery = searchParams.get("jobId");

  const normalizeJobs = (list = []) =>
    (Array.isArray(list) ? list : list?.jobs || []).map((job) => ({
      ...job,
      id: job.id || job.job_id || job.jobId,
      job_title: job.job_title || job.title || "Untitled role",
    }));

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const jobList = normalizeJobs(await fetchJobs());
        setJobs(jobList);
        const initialJobId = jobIdFromQuery || jobList[0]?.id || null;
        setSelectedJobId(initialJobId);

        if (initialJobId) {
          const apps = await fetchApplicants(initialJobId);
          setApplicants(normalizeApplicants(apps));
        } else {
          setApplicants([]);
        }
      } catch (err) {
        setError(err?.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [jobIdFromQuery]);

  useEffect(() => {
    const fetchApplicantsForJob = async () => {
      if (!selectedJobId) return;
      setLoading(true);
      setError("");
      try {
        const apps = await fetchApplicants(selectedJobId);
        setApplicants(normalizeApplicants(apps));
      } catch (err) {
        setError(err?.message || "Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    if (selectedJobId) {
      fetchApplicantsForJob();
    }
  }, [selectedJobId]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter((applicant) => {
      const matchesSearch =
        applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.branch.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBranch =
        selectedBranches.length === 0 ||
        selectedBranches.includes(applicant.branch);
      const matchesStatus =
        !selectedStatus || applicant.status === selectedStatus;

      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [applicants, searchTerm, selectedBranches, selectedStatus]);

  const addBranchFilter = (branch) => {
    if (!selectedBranches.includes(branch)) {
      setSelectedBranches([...selectedBranches, branch]);
    }
  };

  const removeBranchFilter = (branch) => {
    setSelectedBranches(selectedBranches.filter(b => b !== branch));
  };

  const clearAllFilters = () => {
    setSelectedBranches([]);
    setSelectedStatus("");
    setSearchTerm("");
  };

  const updateStatus = async (applicationId, nextStatus) => {
    try {
      if (nextStatus === "accepted") {
        await apiClient.acceptJobApplication(applicationId);
      } else if (nextStatus === "rejected") {
        await apiClient.rejectJobApplication(applicationId);
      } else {
        await apiClient.holdJobApplication(applicationId);
      }
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                status: nextStatus,
                statusColor: statusColor[nextStatus] || app.statusColor,
              }
            : app
        )
      );
      toast({
        title: "Status updated",
        description: `Application marked as ${statusLabel[nextStatus] || nextStatus}.`,
      });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err?.message || "Could not update application status.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadResume = (applicant) => {
    const url = applicant.resume_url;
    if (!url) {
      toast({
        title: "Resume not available",
        description: "This applicant did not upload a resume.",
        variant: "destructive",
      });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const infoText =
    contextText ||
    (selectedJobId
      ? `${jobs.find((j) => j.id === selectedJobId)?.job_title || "Selected job"} • Showing ${
          filteredApplicants.length
        } of ${applicants.length} applications`
      : "No job selected");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(backPath)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{heading}</h1>
            <p className="text-muted-foreground">{infoText}</p>
          </div>
        </div>
        {jobs.length > 0 && (
          <Select
            value={selectedJobId || ""}
            onValueChange={(value) => setSelectedJobId(value)}
          >
            <SelectTrigger className="w-72">
              <SelectValue placeholder="Select job to view applicants" />
            </SelectTrigger>
            <SelectContent>
              {jobs.map((job) => (
                <SelectItem key={job.id} value={job.id}>
                  {job.job_title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button variant="outline" onClick={clearAllFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Search & Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, branch, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relevance">Relevance (Skill Match)</SelectItem>
                  <SelectItem value="date">Application Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Branches</label>
              <Select onValueChange={addBranchFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={selectedBranches.length ? `${selectedBranches.length} selected` : "Select branches..."} />
                </SelectTrigger>
                <SelectContent>
                  {branches.map(branch => (
                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status..." />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{statusLabel[status]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Skills</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select skills..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {selectedBranches.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedBranches.map(branch => (
                <Badge key={branch} variant="secondary" className="flex items-center space-x-1">
                  <span>{branch}</span>
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeBranchFilter(branch)} />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applicants Table */}
      <Card>
        <div className="relative max-h-[600px] overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="sticky top-0 bg-card z-20 border-b">
              <tr className="border-b">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-card">Student Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-card">Branch</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-card">Application Time</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-card">Skill Match</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-card">Skills</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-card">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-card">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">
                    Loading applications...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-destructive">
                    {error}
                  </td>
                </tr>
              ) : filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-muted-foreground">
                    No applications found.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((applicant) => (
                <tr key={applicant.id} className="border-b transition-colors hover:bg-muted/50">
                  <td className="p-4 align-middle font-medium">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={`/api/placeholder/32/32`} />
                        <AvatarFallback>{applicant.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{applicant.name}</div>
                        <div className="text-sm text-muted-foreground">{applicant.class}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle">{applicant.branch}</td>
                  <td className="p-4 align-middle text-sm">{applicant.applicationTime}</td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center space-x-2">
                      {applicant.skillMatch ? (
                        <>
                          <Progress value={applicant.skillMatch} className="w-16" />
                          <span className="text-sm font-medium">{applicant.skillMatch}%</span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    {applicant.skills?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {applicant.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </td>
                  <td className="p-4 align-middle">
                    <Badge className={applicant.statusColor}>
                      {statusLabel[applicant.status] || applicant.status}
                    </Badge>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() =>
                          navigate(detailsPath, { state: { applicant } })
                        }
                      >
                        <Eye className="h-4 w-4" />
                        <span className="ml-1 hidden sm:inline">View</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadResume(applicant)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-card z-50">
                          <DropdownMenuItem 
                            onClick={() => updateStatus(applicant.id, "accepted")}
                          >
                            Shortlist
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateStatus(applicant.id, "rejected")}
                          >
                            Reject
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => updateStatus(applicant.id, "on_hold")}
                          >
                            Hold
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
