import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import JobCard from "@/components/JobCard";
import JobFilters from "@/components/JobFilters";

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const { apiFetch } = await import("@/lib/api");
        const res = await apiFetch("/job/get-all-jobs-student", { method: "GET" });
        if (mounted && res && res.jobs) setJobs(res.jobs);
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-primary text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-4">Find Your Perfect Opportunity</h1>
          <p className="text-primary-foreground/80 mb-6">
            Discover internships, jobs, and projects tailored for SGSITS students
          </p>
          
          {/* Search Bar */}
          <div className="flex gap-4 max-w-2xl">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
              />
            </div>
            <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 flex-shrink-0`}>
            <JobFilters />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Controls Bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
                <p className="text-muted-foreground">
                  {jobs.length} opportunities found
                </p>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="soonest">Deadline Soon</SelectItem>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="stipend-high">Highest Stipend</SelectItem>
                  <SelectItem value="stipend-low">Lowest Stipend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active Filters */}
            <div className="flex items-center gap-2 mb-6">
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Frontend Development
                <button className="ml-2 hover:bg-primary/20 rounded-full p-0.5">×</button>
              </Badge>
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Remote
                <button className="ml-2 hover:bg-primary/20 rounded-full p-0.5">×</button>
              </Badge>
              <Button variant="link" className="text-muted-foreground p-0 h-auto">
                Clear all filters
              </Button>
            </div>

            {/* Jobs Grid */}
            <div className="grid gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job._id || job.id}
                  id={job._id || job.id}
                  title={job.job_title || job.title || "Job"}
                  company={job.company_name || job.company}
                  location={job.location || "Location not specified"}
                  type={job.job_type || job.type || "Job"}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
