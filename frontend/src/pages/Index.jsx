import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  Network,
  Briefcase,
  Calendar,
  Users,
  BriefcaseBusiness,
  GraduationCap,
  Laptop,
  Building2,
} from "lucide-react";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/authSlice";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api";

// ✅ Import the enhanced, consistent Header and Footer components
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
// Note: You must ensure the PublicHeader and PublicFooter files
// contain the code blocks we finalized in the previous steps.

const Index = () => {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [loadingFeaturedJobs, setLoadingFeaturedJobs] = useState(true);

  const { isAuthenticated, user } = useSelector(selectAuth);

  // Top companies (static for display)
  const topCompanies = [
    { name: "Amazon", icon: Building2 },
    { name: "Google", icon: Building2 },
    { name: "Microsoft", icon: Building2 },
    { name: "Meta", icon: Building2 },
    { name: "Netflix", icon: Building2 },
    { name: "Apple", icon: Building2 },
    { name: "Adobe", icon: Building2 },
    { name: "Salesforce", icon: Building2 },
  ];

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const res = await apiClient.getAllCompaniesPublic();
        if (res?.companies) {
          setCompanies(res.companies);
        }
      } catch (err) {
        console.error("Failed to load companies", err);
      } finally {
        setLoadingCompanies(false);
      }
    };
    loadCompanies();
  }, []);

  // Fetch featured jobs for the landing page
  useEffect(() => {
    const loadFeaturedJobs = async () => {
      setLoadingFeaturedJobs(true);
      try {
        const res = await apiClient.getFeaturedJobsPublic();
        if (res?.jobs) {
          setFeaturedJobs(res.jobs);
        }
      } catch (err) {
        console.error("Failed to load featured jobs", err);
      } finally {
        setLoadingFeaturedJobs(false);
      }
    };
    loadFeaturedJobs();
  }, []);

  // Helper to get job type badge color
  const getJobTypeBadge = (jobType) => {
    const type = (jobType || "").toLowerCase();
    if (type.includes("intern") || type === "internship") {
      return { label: "INTERNSHIP", className: "bg-sky-500" };
    }
    if (type.includes("project")) {
      return { label: "PROJECT", className: "bg-violet-500" };
    }
    return { label: "JOB", className: "bg-emerald-500" };
  };

  // Helper to parse branches/skills
  const parseTags = (tags) => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    try {
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return String(tags)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
  };

  // --- Feature Data ---
  const features = [
    {
      icon: Network,
      title: "Global Alumni Network",
      description:
        "Instantly connect with over 10,000 SGSITS alumni worldwide for mentorship and collaboration.",
    },
    {
      icon: Briefcase,
      title: "Exclusive Job Board",
      description:
        "Access curated job and internship opportunities shared directly by alumni companies and recruiters.",
    },
    {
      icon: Calendar,
      title: "Event & Seminar Hub",
      description:
        "Stay informed about college reunions, workshops, and exclusive alumni professional development seminars.",
    },
    {
      icon: Users,
      title: "Mentorship Program",
      description:
        "Get personalized career guidance from experienced alumni in your desired industry or field.",
    },
  ];

  const featuredOpportunities = [
    {
      id: 1,
      title: "Senior Software Engineer",
      badge: "JOB",
      badgeVariant: "bg-emerald-500",
      company: "Amazon",
      mode: "Full-time · On-site",
      tags: ["CSE", "IT", "AI"],
    },
    {
      id: 2,
      title: "UI/UX Designer",
      badge: "INTERNSHIP",
      badgeVariant: "bg-sky-500",
      company: "Design Studio",
      mode: "Internship · Hybrid",
      tags: ["CSE", "IT", "Design"],
    },
    {
      id: 3,
      title: "Data Scientist",
      badge: "JOB",
      badgeVariant: "bg-emerald-500",
      company: "Analytics Pro",
      mode: "Full-time · Remote",
      tags: ["CSE", "AI", "Mathematics"],
    },
    {
      id: 4,
      title: "Backend Developer",
      badge: "INTERNSHIP",
      badgeVariant: "bg-sky-500",
      company: "API Solutions",
      mode: "Internship · Remote",
      tags: ["CSE", "IT"],
    },
    {
      id: 5,
      title: "Alumni Portal Enhancement",
      badge: "PROJECT",
      badgeVariant: "bg-violet-500",
      company: "SGSITS",
      mode: "Capstone · Hybrid",
      tags: ["CSE", "IT", "AI"],
    },
    {
      id: 6,
      title: "Machine Learning Engineer",
      badge: "JOB",
      badgeVariant: "bg-emerald-500",
      company: "Google",
      mode: "Full-time · On-site",
      tags: ["CSE", "AI", "Mathematics"],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* 1. ✅ Replaced inline header with the consistent PublicHeader component */}
      <PublicHeader />

      <main className="flex-grow">
        {/* ✅ Hero Section - More dramatic and inviting */}
        <section
          className="py-16 md:py-24 bg-cover bg-center relative overflow-hidden"
          style={{ backgroundImage: "url('/images/sgsits-campus-day.jpg')" }}
        >
          <div className="absolute inset-0 bg-black/60"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6 text-white leading-tight">
                <span className="font-sans font-black tracking-tight">
                  Bridge Your Career with the
                </span>{" "}
                <span className="text-cyan-400 font-sans font-black tracking-tight">
                  SGSITS Alumni
                </span>{" "}
                <span className="font-sans font-black tracking-tight">
                  Network
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto">
                Discover live jobs, internships, and alumni-led projects
                tailored for SGSITS students and graduates.
              </p>

              {/* Button Group - Prominent and action-oriented s */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="xl"
                  className="text-lg py-4 px-8 bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-300"
                  asChild
                >
                  <Link to="/signup/student">
                    Explore Opportunities
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>

                <Button
                  variant="secondary"
                  size="xl"
                  className="text-lg py-4 px-8 bg-gray-800 text-white hover:bg-gray-700 shadow-lg transition-all duration-300"
                  asChild
                >
                  <Link to="/signup/alumni">
                    Create Profile
                    <Users className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ✅ Features Section - Value Proposition */}
        <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
              Your Next{" "}
              <span className="text-blue-600 dark:text-cyan-400">
                Career Step
              </span>{" "}
              Starts Here
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-16 max-w-3xl mx-auto">
              We provide the essential tools and connections to bridge the gap
              between academic life and professional success.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card
                  key={index}
                  className="transform hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-blue-500/20 dark:border-cyan-400/20 hover:border-blue-500 dark:hover:border-cyan-400 hover:ring-2 hover:ring-blue-100 dark:hover:ring-cyan-900"
                >
                  <CardHeader className="flex flex-col items-center space-y-3">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-cyan-400">
                      <feature.icon className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-xl font-bold pt-2">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 dark:text-gray-400 text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* --- Visual separation --- */}
        <div className="max-w-7xl mx-auto">
          <hr className="border-gray-200 dark:border-gray-800" />
        </div>

        {/* ✅ Featured Opportunities Section */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-white via-slate-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold tracking-wide dark:bg-cyan-900/40 dark:text-cyan-200 mb-3">
                <BriefcaseBusiness className="w-3 h-3" />
                FEATURED OPPORTUNITIES
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                Live{" "}
                <span className="text-blue-600 dark:text-cyan-400">
                  Opportunities
                </span>{" "}
                from Alumni
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Updated in real time. Apply before positions close.
              </p>
            </div>

            {loadingFeaturedJobs ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                Loading exciting opportunities...
              </div>
            ) : featuredJobs.length === 0 ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                No featured opportunities available at the moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6 mb-8">
                {featuredJobs.map((job) => {
                  const badge = getJobTypeBadge(job.job_type);
                  const tags = parseTags(
                    job.allowed_branches || job.skills_required,
                  );
                  return (
                    <Card
                      key={job.id}
                      className="border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-lg transition-all duration-200"
                    >
                      <CardContent className="p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                              {job.job_title}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide text-white ${badge.className}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-cyan-400 dark:hover:text-cyan-300 text-left"
                            onClick={() =>
                              navigate(`/company/${job.company_id}`)
                            }
                          >
                            {job.company_name}
                          </button>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                            <Laptop className="w-4 h-4 text-gray-400" />
                            {job.work_mode || job.location || "Not specified"}
                          </p>
                          {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-3 min-w-[96px]">
                          <Button
                            size="sm"
                            className="px-5 bg-blue-600 hover:bg-blue-700 text-white dark:bg-cyan-500 dark:hover:bg-cyan-600 shadow-sm"
                            onClick={() => {
                              const target = `/jobs/${job.id}`;
                              const role = (user?.role || "").toLowerCase();

                              if (!isAuthenticated || role !== "student") {
                                navigate("/login", {
                                  state: { from: { pathname: target } },
                                });
                                return;
                              }

                              navigate(target);
                            }}
                          >
                            Apply
                          </Button>
                          <p className="hidden md:flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                            <GraduationCap className="w-3 h-3" />
                            Alumni referred
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col items-center gap-4">
              <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-gray-900 dark:text-slate-300">
                Page{" "}
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold ml-1">
                  1
                </span>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-500 text-xs font-medium dark:bg-slate-800 dark:text-slate-300">
                  2
                </span>
              </div>
              <Button
                variant="link"
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold dark:text-cyan-400 dark:hover:text-cyan-300"
                asChild
              >
                <Link to="/jobs/matching">
                  See more matching jobs
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ✅ Top Companies Section */}
        <section className="py-16 md:py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 md:mb-14">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">
                Top Companies by{" "}
                <span className="text-blue-600 dark:text-cyan-400">
                  SGSITS Alumni
                </span>
              </h2>
              <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Where our alumni are hiring from.
              </p>
            </div>

            {/* Top Companies Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
              {topCompanies.map((company, idx) => {
                // Find matching company from real data if available
                const realCompany = companies.find(
                  (c) => c.name.toLowerCase() === company.name.toLowerCase(),
                );
                const companyId = realCompany?.id;

                return (
                  <Card
                    key={idx}
                    className="border border-slate-200 dark:border-slate-800 hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      if (companyId) {
                        navigate(`/company/${companyId}`);
                      }
                    }}
                  >
                    <CardContent className="p-4 flex flex-col items-center justify-center space-y-2 min-h-[100px]">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <company.icon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white text-center">
                        {company.name}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Marquee Section with Real Companies */}
            {!loadingCompanies && companies.length > 0 && (
              <div className="mt-8">
                <div className="bg-blue-600 dark:bg-cyan-600 text-white py-4 px-6 rounded-lg overflow-hidden relative">
                  <div className="flex items-center gap-6 animate-marquee whitespace-nowrap">
                    <span className="font-semibold text-sm">Live Jobs</span>
                    {companies.map((company, idx) => (
                      <Link
                        key={company.id || idx}
                        to={`/company/${company.id}`}
                        className="text-sm hover:underline cursor-pointer"
                      >
                        {company.name} • {company.activeJobs} Active{" "}
                        {company.activeJobs === 1 ? "Job" : "Jobs"}
                      </Link>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {companies.map((company, idx) => (
                      <Link
                        key={`dup-${company.id || idx}`}
                        to={`/company/${company.id}`}
                        className="text-sm hover:underline cursor-pointer"
                      >
                        {company.name} • {company.activeJobs} Active{" "}
                        {company.activeJobs === 1 ? "Job" : "Jobs"}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ✅ CTA Section - Elegant and Focused */}
        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Card with subtle background and strong shadow */}
            <Card className="shadow-2xl dark:shadow-blue-900/30 bg-white dark:bg-gray-900 border-2 border-blue-500/20 dark:border-cyan-500/20">
              <CardHeader className="pb-8">
                <CardTitle className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
                  Ready to Start Your Journey?
                </CardTitle>
                <CardDescription className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Join thousands of SGSITS students and alumni who are already
                  building successful careers through our trusted platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="xl"
                    className="text-lg py-6 px-8 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
                    asChild
                  >
                    <Link to="/signup">
                      Create Your Account
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="xl"
                    className="text-lg py-6 px-8 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    asChild
                  >
                    <Link to="/login">Sign In</Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground dark:text-gray-500">
                  Free to join • Exclusive to the SGSITS community • Secure and
                  private
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* 2. ✅ Replaced inline footer with the consistent PublicFooter component */}
      <PublicFooter />
    </div>
  );
};

export default Index;
