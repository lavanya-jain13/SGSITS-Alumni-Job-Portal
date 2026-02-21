import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Building2, 
  Users,  
  ExternalLink,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/authSlice";

export default function PublicCompanyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [company, setCompany] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 8;

  const { isAuthenticated, user } = useSelector(selectAuth);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) {
        toast({
          title: "No company selected",
          description: "Please select a company to view.",
          variant: "destructive",
        });
        navigate("/", { replace: true });
        return;
      }
      setLoading(true);
      try {
        const data = await apiClient.getCompanyByIdPublic(id);
        setCompany(data?.company);
      } catch (error) {
        toast({
          title: "Failed to load company",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [id, navigate, toast]);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!id) return;
      setJobsLoading(true);
      try {
        // Fetch all jobs first (or implement proper pagination on backend)
        const res = await apiClient.getCompanyJobsPublic(id, 1, 100);
        if (res?.jobs) {
          setCompanyJobs(res.jobs);
        }
      } catch (error) {
        console.error("Failed to load company jobs", error);
      } finally {
        setJobsLoading(false);
      }
    };
    if (company) {
      fetchJobs();
    }
  }, [id, company]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Loading company...
        </div>
        <PublicFooter />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        <PublicHeader />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          Company not found or not available.
        </div>
        <PublicFooter />
      </div>
    );
  }

  // Get first office location for display
  const primaryLocation = company.office_location || "Location not specified";
  const locationParts = primaryLocation.split(",").map(s => s.trim());
  const displayLocation = locationParts.length > 1 
    ? `${locationParts[0]}, ${locationParts[1]}` 
    : primaryLocation;

  // Truncate about text
  const aboutText = company.about || "No description added yet.";
  const shouldTruncate = aboutText.length > 200;
  const displayedAbout = showFullAbout || !shouldTruncate ? aboutText : aboutText.substring(0, 200) + "...";

  // Get job type badge color
  const getJobTypeBadge = (jobType) => {
    const type = (jobType || "").toLowerCase();
    if (type.includes("intern") || type === "internship") {
      return { label: "INTERNSHIP", className: "bg-sky-500 text-white" };
    }
    if (type.includes("project")) {
      return { label: "PROJECT", className: "bg-violet-500 text-white" };
    }
    return { label: "JOB", className: "bg-emerald-500 text-white" };
  };

  // Parse branches/skills
  const parseBranches = (branches) => {
    if (!branches) return [];
    if (Array.isArray(branches)) return branches;
    try {
      const parsed = JSON.parse(branches);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return String(branches).split(",").map(b => b.trim()).filter(Boolean);
    }
  };

  const totalPages = Math.ceil((companyJobs.length || 0) / jobsPerPage);
  const paginatedJobs = companyJobs.slice((currentPage - 1) * jobsPerPage, currentPage * jobsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <PublicHeader />
      
      <main className="flex-1">
        {/* Hero Section with Background Image */}
        <div className="relative w-full h-[400px] md:h-[450px] overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1950&q=80')"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60" />
          </div>

          {/* Content */}
          <div className="relative z-10 container mx-auto px-6 pt-8 pb-6 h-full flex flex-col">
            {/* Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-white hover:bg-white/10 mb-6 self-start"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>

            {/* Company Logo and Info */}
            <div className="flex flex-col md:flex-row md:items-end gap-6 mt-auto">
              {/* Logo Card */}
              <div className="w-24 h-24 md:w-28 md:h-28 bg-white rounded-lg shadow-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-12 h-12 md:w-16 md:h-16 text-gray-700" />
              </div>

              {/* Company Details */}
              <div className="flex-1 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold">{company.name}</h1>
                  <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-blue-400" />
                </div>
                <p className="text-base md:text-lg text-gray-200 mb-3">
                  {company.industry || "Software Development"} • {displayLocation} • Alumni Company
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-200">
                  <Users className="w-4 h-4" />
                  <span>SGSITS Alumni owns this</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                {company.website && (
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white text-gray-900 hover:bg-gray-100"
                    onClick={() => window.open(company.website, "_blank")}
                  >
                    Visit Website
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                )}
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    const jobsSection = document.getElementById("jobs-section");
                    jobsSection?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  View All Jobs
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* About the Company Section */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              About the Company
            </h2>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base md:text-lg">
                {displayedAbout}
              </p>
              {shouldTruncate && (
                <button
                  onClick={() => setShowFullAbout(!showFullAbout)}
                  className="mt-4 text-blue-600 dark:text-cyan-400 hover:underline flex items-center gap-1 text-sm font-medium"
                >
                  {showFullAbout ? "See less" : "See more"}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFullAbout ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
          </section>

          {/* Company Information Section */}
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Company Information
            </h2>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
              <div className="space-y-4">
                {company.founded_year && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Founded</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{company.founded_year}</span>
                  </div>
                )}
                {company.company_size && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Company Size</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{company.company_size}</span>
                  </div>
                )}
                {company.office_location && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Office Location</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{company.office_location}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Website</span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 dark:text-cyan-400 hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                {company.linkedin && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">LinkedIn</span>
                    <a
                      href={company.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 dark:text-cyan-400 hover:underline"
                    >
                      {company.linkedin}
                    </a>
                  </div>
                )}
                {company.twitter && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Twitter</span>
                    <a
                      href={company.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-600 dark:text-cyan-400 hover:underline"
                    >
                      {company.twitter}
                    </a>
                  </div>
                )}
              </div>

              {company.company_culture && (
                <div className="pt-5 mt-5 border-t border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Company Culture
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">
                    {company.company_culture}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Jobs Posted by Company Section */}
          <section id="jobs-section" className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Jobs Posted by {company.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Showing opportunities shared by SGSITS alumni at {company.name}
            </p>

            {jobsLoading ? (
              <div className="text-center py-12 text-gray-500">Loading jobs...</div>
            ) : paginatedJobs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No active job openings at the moment.
              </div>
            ) : (
              <>
                {/* Jobs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {paginatedJobs.map((job) => {
                    const badge = getJobTypeBadge(job.job_type);
                    const branches = parseBranches(job.allowed_branches);
                    const shortDescription = (job.job_description || "")
                      .substring(0, 120)
                      .replace(/\n/g, " ")
                      .trim() + (job.job_description?.length > 120 ? "..." : "");

                    return (
                      <Card
                        key={job.id}
                        className="border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all duration-200"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white flex-1 pr-2">
                              {job.job_title || "Job Title"}
                            </h3>
                            <Badge className={`${badge.className} text-xs font-semibold px-2.5 py-0.5`}>
                              {badge.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                            {shortDescription || "No description available."}
                          </p>
                          {branches.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {branches.slice(0, 4).map((branch, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
                                >
                                  {branch}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              onClick={() => {
                                const target = `/jobs/${job.id}`;
                                const role = (user?.role || "").toLowerCase();

                                if (!isAuthenticated) {
                                  navigate("/login", {
                                    state: { from: { pathname: target } },
                                  });
                                  return;
                                }

                                if (role !== "student") {
                                  toast({
                                    title: "Only students can apply for jobs.",
                                    variant: "destructive",
                                  });
                                  return;
                                }

                                navigate(target);
                              }}
                            >
                              Apply
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                      ←
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={currentPage === page ? "bg-blue-600 text-white" : ""}
                      >
                        {page}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    >
                      →
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
