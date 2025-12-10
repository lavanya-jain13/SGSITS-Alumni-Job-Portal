// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Checkbox } from "@/components/ui/checkbox";
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Filter, Plus, MoreHorizontal, Eye, Edit, Pause, X, Trash2 } from "lucide-react";

// const mockJobs = [
//   {
//     id: "1",
//     title: "Senior Software Engineer",
//     company: "TechCorp Inc.",
//     type: "Job",
//     location: "Mumbai, Maharashtra",
//     applyBy: "15 Jan 2024",
//     status: "Accepting",
//     applicantCount: 15
//   },
//   {
//     id: "2", 
//     title: "Full Stack Developer",
//     company: "DataSystems Ltd.",
//     type: "Job",
//     location: "Pune, Maharashtra",
//     applyBy: "25 Jan 2024",
//     status: "Not Accepting",
//     applicantCount: 22
//   },
//   {
//     id: "3",
//     title: "UI/UX Design Intern",
//     company: "TechCorp Inc.",
//     type: "Internship",
//     location: "Hyderabad, Telangana",
//     applyBy: "5 Feb 2024",
//     status: "Accepting",
//     applicantCount: 18
//   }
// ];

// const companies = ["TechCorp Inc.", "DataSystems Ltd.", "InnovateLabs", "StartupHub"];
// const jobTypes = ["Job", "Internship"];
// const locations = ["Mumbai, Maharashtra", "Pune, Maharashtra", "Hyderabad, Telangana", "Bangalore, Karnataka"];
// const statuses = ["Accepting", "Not Accepting", "Paused"];

// export function ActivePostings() {
//   const navigate = useNavigate();
//   const [selectedCompanies, setSelectedCompanies] = useState(["TechCorp Inc.", "DataSystems Ltd."]);
//   const [selectedJobTypes, setSelectedJobTypes] = useState(["Job", "Internship"]);
//   const [selectedLocations, setSelectedLocations] = useState([]);
//   const [selectedStatuses, setSelectedStatuses] = useState([]);
//   const [showFilters, setShowFilters] = useState(true);

//   const filteredJobs = mockJobs.filter(job => {
//     return (selectedCompanies.length === 0 || selectedCompanies.includes(job.company)) &&
//            (selectedJobTypes.length === 0 || selectedJobTypes.includes(job.type)) &&
//            (selectedLocations.length === 0 || selectedLocations.includes(job.location)) &&
//            (selectedStatuses.length === 0 || selectedStatuses.includes(job.status));
//   });

//   const activeFiltersCount = [selectedCompanies, selectedJobTypes, selectedLocations, selectedStatuses]
//     .filter(filter => filter.length > 0).length;

//   const clearAllFilters = () => {
//     setSelectedCompanies([]);
//     setSelectedJobTypes([]);
//     setSelectedLocations([]);
//     setSelectedStatuses([]);
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Accepting": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
//       case "Not Accepting": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
//       case "Paused": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
//       default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center justify-between">
//         <div>
//           <div className="flex items-center space-x-2">
//             <h1 className="text-2xl font-bold text-foreground">Active Postings</h1>
//             {activeFiltersCount > 0 && (
//               <Badge variant="secondary" className="text-xs">
//                 {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
//               </Badge>
//             )}
//           </div>
//           <p className="text-muted-foreground mt-1">
//             Showing {filteredJobs.length} of {mockJobs.length} job postings
//           </p>
//         </div>
//         <Button 
//           className="bg-primary hover:bg-primary/90"
//           onClick={() => navigate("/alumni/post-job")}
//         >
//           <Plus className="h-4 w-4 mr-2" />
//           Post New Job
//         </Button>
//       </div>

//       {/* Filters */}
//       <Card>
//         <CardContent className="pt-6">
//           <div className="flex items-center justify-between mb-4">
//             <Button
//               variant="ghost"
//               onClick={() => setShowFilters(!showFilters)}
//               className="text-sm font-medium"
//             >
//               <Filter className="h-4 w-4 mr-2" />
//               Advanced Filters
//             </Button>
//             {activeFiltersCount > 0 && (
//               <Button
//                 variant="ghost"
//                 onClick={clearAllFilters}
//                 className="text-sm text-muted-foreground hover:text-foreground"
//               >
//                 <X className="h-4 w-4 mr-1" />
//                 Clear All Filters
//               </Button>
//             )}
//           </div>

//           {showFilters && (
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               {/* Companies */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-foreground">Companies</label>
//                 <div className="text-xs text-muted-foreground mb-2">
//                   {selectedCompanies.length} selected
//                 </div>
//                 <div className="space-y-2 max-h-32 overflow-y-auto">
//                   {companies.map((company) => (
//                     <div key={company} className="flex items-center space-x-2">
//                       <Checkbox
//                         id={`company-${company}`}
//                         checked={selectedCompanies.includes(company)}
//                         onCheckedChange={(checked) => {
//                           if (checked) {
//                             setSelectedCompanies([...selectedCompanies, company]);
//                           } else {
//                             setSelectedCompanies(selectedCompanies.filter(c => c !== company));
//                           }
//                         }}
//                       />
//                       <label
//                         htmlFor={`company-${company}`}
//                         className="text-sm cursor-pointer"
//                       >
//                         {company}
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//                 {selectedCompanies.length > 0 && (
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => setSelectedCompanies([])}
//                     className="text-xs text-muted-foreground h-8"
//                   >
//                     Clear all companies filters
//                   </Button>
//                 )}
//               </div>

//               {/* Job Types */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-foreground">Job Types</label>
//                 <div className="text-xs text-muted-foreground mb-2">
//                   {selectedJobTypes.length} selected
//                 </div>
//                 <div className="space-y-2">
//                   {jobTypes.map((type) => (
//                     <div key={type} className="flex items-center space-x-2">
//                       <Checkbox
//                         id={`type-${type}`}
//                         checked={selectedJobTypes.includes(type)}
//                         onCheckedChange={(checked) => {
//                           if (checked) {
//                             setSelectedJobTypes([...selectedJobTypes, type]);
//                           } else {
//                             setSelectedJobTypes(selectedJobTypes.filter(t => t !== type));
//                           }
//                         }}
//                       />
//                       <label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
//                         {type}
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//                 {selectedJobTypes.length > 0 && (
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => setSelectedJobTypes([])}
//                     className="text-xs text-muted-foreground h-8"
//                   >
//                     Clear all job types filters
//                   </Button>
//                 )}
//               </div>

//               {/* Locations */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-foreground">Locations</label>
//                 <div className="text-xs text-muted-foreground mb-2">
//                   {selectedLocations.length} selected
//                 </div>
//                 <div className="space-y-2">
//                   {locations.map((location) => (
//                     <div key={location} className="flex items-center space-x-2">
//                       <Checkbox
//                         id={`location-${location}`}
//                         checked={selectedLocations.includes(location)}
//                         onCheckedChange={(checked) => {
//                           if (checked) {
//                             setSelectedLocations([...selectedLocations, location]);
//                           } else {
//                             setSelectedLocations(selectedLocations.filter(l => l !== location));
//                           }
//                         }}
//                       />
//                       <label htmlFor={`location-${location}`} className="text-sm cursor-pointer">
//                         {location}
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//                 {selectedLocations.length > 0 && (
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => setSelectedLocations([])}
//                     className="text-xs text-muted-foreground h-8"
//                   >
//                     Clear all locations filters
//                   </Button>
//                 )}
//               </div>

//               {/* Status */}
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-foreground">Status</label>
//                 <div className="space-y-2">
//                   {statuses.map((status) => (
//                     <div key={status} className="flex items-center space-x-2">
//                       <Checkbox
//                         id={`status-${status}`}
//                         checked={selectedStatuses.includes(status)}
//                         onCheckedChange={(checked) => {
//                           if (checked) {
//                             setSelectedStatuses([...selectedStatuses, status]);
//                           } else {
//                             setSelectedStatuses(selectedStatuses.filter(s => s !== status));
//                           }
//                         }}
//                       />
//                       <label htmlFor={`status-${status}`} className="text-sm cursor-pointer">
//                         {status}
//                       </label>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Job Listings Table */}
//       <Card>
//         <CardContent className="p-0">
//           <Table>
//             <TableHeader>
//               <TableRow>
//                 <TableHead>Job Title</TableHead>
//                 <TableHead>Company</TableHead>
//                 <TableHead>Type</TableHead>
//                 <TableHead>Location</TableHead>
//                 <TableHead>Apply By</TableHead>
//                 <TableHead>Status</TableHead>
//                 <TableHead>Applications</TableHead>
//                 <TableHead className="w-[50px]"></TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {filteredJobs.map((job) => (
//                 <TableRow key={job.id}>
//                   <TableCell className="font-medium">{job.title}</TableCell>
//                   <TableCell>{job.company}</TableCell>
//                   <TableCell>
//                     <Badge variant="outline" className="text-xs">
//                       {job.type}
//                     </Badge>
//                   </TableCell>
//                   <TableCell>{job.location}</TableCell>
//                   <TableCell>{job.applyBy}</TableCell>
//                   <TableCell>
//                     <Badge className={`text-xs ${getStatusColor(job.status)}`}>
//                       {job.status}
//                     </Badge>
//                   </TableCell>
//                   <TableCell>
//                     <span className="text-sm text-muted-foreground">
//                       {job.applicantCount} applicants
//                     </span>
//                   </TableCell>
//                   <TableCell>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                           <MoreHorizontal className="h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end" className="w-48">
//                         <DropdownMenuItem>
//                           <Eye className="h-4 w-4 mr-2" />
//                           View Applicants
//                         </DropdownMenuItem>
//                         <DropdownMenuItem>
//                           <Edit className="h-4 w-4 mr-2" />
//                           Edit Job Posting
//                         </DropdownMenuItem>
//                         <DropdownMenuItem>
//                           <Pause className="h-4 w-4 mr-2" />
//                           Pause Applications
//                         </DropdownMenuItem>
//                         <DropdownMenuItem className="text-destructive">
//                           <X className="h-4 w-4 mr-2" />
//                           Close Job Posting
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
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
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { Filter, Plus, MoreHorizontal, Edit, Pause, X, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

export function ActivePostings() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [companiesMap, setCompaniesMap] = useState({});
  const [defaultCompanyName, setDefaultCompanyName] = useState("My Company");
  const [loading, setLoading] = useState(true);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const companies = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.company).filter(Boolean))),
    [jobs]
  );
  const jobTypes = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.type).filter(Boolean))),
    [jobs]
  );
  const locations = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.location).filter(Boolean))),
    [jobs]
  );
  const statuses = useMemo(
    () => Array.from(new Set(jobs.map((job) => job.status).filter(Boolean))),
    [jobs]
  );

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const [companiesRes, jobsRes] = await Promise.all([
          apiClient.getMyCompanies(),
          apiClient.getMyJobs(),
        ]);

        const map = {};
        (companiesRes?.companies || []).forEach((c) => {
          map[c.id] = c.name || c.company_name || "My Company";
        });
        setCompaniesMap(map);
        const fallbackName =
          Object.values(map)[0] || "My Company";
        setDefaultCompanyName(fallbackName);

        const normalized = (jobsRes?.jobs || []).map((job) => ({
          id: job.id,
          title: job.job_title,
          companyId: job.company_id,
          company:
            job.company_name ||
            map[job.company_id] ||
            job.company ||
            defaultCompanyName,
          type: job.job_type || "Job",
          location: job.location || "—",
          applyBy: job.application_deadline
            ? new Date(job.application_deadline).toLocaleDateString()
            : "—",
          status:
            job.status === "active"
              ? "Accepting"
              : job.status === "paused"
              ? "Paused"
              : job.status || "—",
          applicantCount: job.applicant_count || 0,
        }));
        setJobs(normalized);
      } catch (error) {
        toast({
          title: "Failed to load jobs",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();

    if (location.state?.refreshJobs) {
      // Clear the state flag to avoid repeated reloads
      navigate(location.pathname, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, location.state?.refreshJobs]);

  const filteredJobs = jobs.filter((job) => {
    return (
      (selectedCompanies.length === 0 || selectedCompanies.includes(job.company)) &&
      (selectedJobTypes.length === 0 || selectedJobTypes.includes(job.type)) &&
      (selectedLocations.length === 0 || selectedLocations.includes(job.location)) &&
      (selectedStatuses.length === 0 || selectedStatuses.includes(job.status))
    );
  });

  const activeFiltersCount = [selectedCompanies, selectedJobTypes, selectedLocations, selectedStatuses]
    .filter(filter => filter.length > 0).length;

  const clearAllFilters = () => {
    setSelectedCompanies([]);
    setSelectedJobTypes([]);
    setSelectedLocations([]);
    setSelectedStatuses([]);
  };

  const selectAllFilters = () => {
    setSelectedCompanies([...companies]);
    setSelectedJobTypes([...jobTypes]);
    setSelectedLocations([...locations]);
    setSelectedStatuses([...statuses]);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Accepting": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Not Accepting": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Paused": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handlePause = async (jobId) => {
    setUpdatingId(jobId);
    try {
      await apiClient.updateJob(jobId, { status: "paused" });
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: "Paused" } : job
        )
      );
      toast({ title: "Posting paused" });
    } catch (error) {
      toast({
        title: "Failed to pause posting",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResume = async (jobId) => {
    setUpdatingId(jobId);
    try {
      await apiClient.updateJob(jobId, { status: "active" });
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId ? { ...job, status: "Accepting" } : job
        )
      );
      toast({ title: "Posting resumed" });
    } catch (error) {
      toast({
        title: "Failed to resume posting",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (jobId) => {
    setUpdatingId(jobId);
    try {
      await apiClient.updateJob(jobId, { status: "closed" });
      setJobs((prev) => prev.filter((job) => job.id !== jobId));
      toast({ title: "Posting closed" });
    } catch (error) {
      toast({
        title: "Failed to close posting",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleEdit = (jobId) => {
    navigate(`/alumni/post-job?id=${jobId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-foreground">Active Postings</h1>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Showing {filteredJobs.length} of {jobs.length} job postings
          </p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => navigate("/alumni/post-job")}
        >
          <Plus className="h-4 w-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm font-medium"
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={selectAllFilters}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Select All Filters
              </Button>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearAllFilters}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Companies */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Companies</label>
                {companies.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No companies available</p>
                ) : (
                  <>
                    <div className="text-xs text-muted-foreground mb-2">
                      {selectedCompanies.length} selected
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {companies.map((company) => (
                        <div key={company} className="flex items-center space-x-2">
                          <Checkbox
                            id={`company-${company}`}
                            checked={selectedCompanies.includes(company)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCompanies([...selectedCompanies, company]);
                              } else {
                                setSelectedCompanies(selectedCompanies.filter(c => c !== company));
                              }
                            }}
                          />
                          <label
                            htmlFor={`company-${company}`}
                            className="text-sm cursor-pointer"
                          >
                            {company}
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedCompanies.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCompanies([])}
                        className="text-xs text-muted-foreground h-8"
                      >
                        Clear all companies filters
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Job Types */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Job Types</label>
                {jobTypes.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No job types available</p>
                ) : (
                  <>
                    <div className="text-xs text-muted-foreground mb-2">
                      {selectedJobTypes.length} selected
                    </div>
                    <div className="space-y-2">
                      {jobTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={selectedJobTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedJobTypes([...selectedJobTypes, type]);
                              } else {
                                setSelectedJobTypes(selectedJobTypes.filter(t => t !== type));
                              }
                            }}
                          />
                          <label htmlFor={`type-${type}`} className="text-sm cursor-pointer">
                            {type}
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedJobTypes.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedJobTypes([])}
                        className="text-xs text-muted-foreground h-8"
                      >
                        Clear all job types filters
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Locations */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Locations</label>
                {locations.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No locations available</p>
                ) : (
                  <>
                    <div className="text-xs text-muted-foreground mb-2">
                      {selectedLocations.length} selected
                    </div>
                    <div className="space-y-2">
                      {locations.map((location) => (
                        <div key={location} className="flex items-center space-x-2">
                          <Checkbox
                            id={`location-${location}`}
                            checked={selectedLocations.includes(location)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedLocations([...selectedLocations, location]);
                              } else {
                                setSelectedLocations(selectedLocations.filter(l => l !== location));
                              }
                            }}
                          />
                          <label htmlFor={`location-${location}`} className="text-sm cursor-pointer">
                            {location}
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedLocations.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedLocations([])}
                        className="text-xs text-muted-foreground h-8"
                      >
                        Clear all locations filters
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Status</label>
                {statuses.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No statuses available</p>
                ) : (
                  <>
                    <div className="text-xs text-muted-foreground mb-2">
                      {selectedStatuses.length} selected
                    </div>
                    <div className="space-y-2">
                      {statuses.map((status) => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={selectedStatuses.includes(status)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedStatuses([...selectedStatuses, status]);
                              } else {
                                setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                              }
                            }}
                          />
                          <label htmlFor={`status-${status}`} className="text-sm cursor-pointer">
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                    {selectedStatuses.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedStatuses([])}
                        className="text-xs text-muted-foreground h-8"
                      >
                        Clear all status filters
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Listings Table */}
      <Card>
        <div className="relative max-h-[600px] overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="sticky top-0 bg-card z-20 border-b">
              <tr className="border-b">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-card">Job Title</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-card">Company</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-card">Type</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-card">Location</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-card">Apply By</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-card">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-card">Applications</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground bg-card w-[50px]"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-muted-foreground">
                    Loading jobs...
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-muted-foreground">
                    No job postings found.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="border-b transition-colors hover:bg-muted/50 cursor-pointer">
                    <td
                      className="p-4 align-middle font-medium"
                      onClick={() => navigate(`/alumni/job/${job.id}`)}
                    >
                      {job.title}
                    </td>
                    <td className="p-4 align-middle" onClick={() => navigate(`/alumni/job/${job.id}`)}>
                      {job.company}
                    </td>
                    <td className="p-4 align-middle" onClick={() => navigate(`/alumni/job/${job.id}`)}>
                      <Badge variant="outline" className="text-xs">
                        {job.type}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle" onClick={() => navigate(`/alumni/job/${job.id}`)}>
                      {job.location}
                    </td>
                    <td className="p-4 align-middle" onClick={() => navigate(`/alumni/job/${job.id}`)}>
                      {job.applyBy}
                    </td>
                    <td className="p-4 align-middle" onClick={() => navigate(`/alumni/job/${job.id}`)}>
                      <Badge className={`text-xs ${getStatusColor(job.status)}`}>
                        {job.status}
                      </Badge>
                    </td>
                    <td className="p-4 align-middle">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/alumni/applications?jobId=${job.id}`);
                        }}
                        className="text-sm text-primary hover:underline"
                      >
                        {job.applicantCount} applicants
                      </button>
                    </td>
                    <td className="p-4 align-middle">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onSelect={() => handleEdit(job.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Job Posting
                        </DropdownMenuItem>
                        {job.status === "Paused" ? (
                          <DropdownMenuItem
                            disabled={updatingId === job.id}
                            onSelect={() => handleResume(job.id)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Resume Applications
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            disabled={updatingId === job.id}
                            onSelect={() => handlePause(job.id)}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            Pause Applications
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          disabled={updatingId === job.id}
                          onSelect={() => handleDelete(job.id)}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Close Job Posting
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
