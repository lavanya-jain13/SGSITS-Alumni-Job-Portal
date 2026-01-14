import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import JobCard from "@/components/JobCard";
import JobFilters from "@/components/JobFilters";

const defaultBranches = [
  "Computer Science",
  "Information Technology",
  "Electronics and Telecommunication",
  "Electronics and Instrumentation",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Industrial and Production",
  "Biomedical Engineering",
];

export default function Jobs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [branchOptions, setBranchOptions] = useState([]);
  const [filters, setFilters] = useState({
    branches: [],
    jobTypes: [],
    workModes: [],
    stipendBands: [],
    skills: [],
  });
  const navigate = useNavigate();
  const { search } = useLocation();
  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const { apiFetch } = await import("@/lib/api");
        const res = await apiFetch("/job/get-all-jobs-student", { method: "GET" });
        if (mounted && res && res.jobs) setJobs(res.jobs);
        if (mounted && res && res.jobs) {
          const all = new Set();
          res.jobs.forEach((job) => {
            const raw =
              job.allowed_branches ||
              job.branches ||
              job.branch ||
              job.allowedBranches ||
              "";
            const list = Array.isArray(raw)
              ? raw
              : String(raw)
                  .split(",")
                  .map((b) => b.trim())
                  .filter(Boolean);
            list.forEach((b) => all.add(b));
          });
          // always include the full default list
          defaultBranches.forEach((b) => all.add(b));
          setBranchOptions(Array.from(all));
        }
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  // sync with ?search= from header navigation
  React.useEffect(() => {
    const params = new URLSearchParams(search);
    setSearchQuery(params.get("search") || "");
  }, [search]);

  const filteredJobs = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();

    const hasActiveFilters =
      term ||
      filters.branches.length ||
      filters.jobTypes.length ||
      filters.workModes.length ||
      filters.stipendBands.length ||
      filters.skills.length;

    const normalizeBranch = (val) =>
      String(val || "")
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/engineering/g, "engg")
        .replace(/\s+/g, " ")
        .trim();

    const toArray = (value) =>
      !value
        ? []
        : Array.isArray(value)
        ? value
        : String(value)
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean);

    const withinStipend = (job) => {
      if (!filters.stipendBands.length) return true;
      const buckets = {
        u25: { min: 0, max: 25000 },
        "25-50": { min: 25000, max: 50000 },
        "50-100": { min: 50000, max: 100000 },
        "1-3l": { min: 100000, max: 300000 },
        "3-6l": { min: 300000, max: 600000 },
        "6l+": { min: 600000, max: Number.POSITIVE_INFINITY },
      };

      const nums = [];
      const pushNum = (val) => {
        const n = Number(String(val || "").replace(/[^0-9.]/g, ""));
        if (!Number.isNaN(n) && n > 0) nums.push(n);
      };
      pushNum(job.min_ctc);
      pushNum(job.max_ctc);
      pushNum(job.stipend);
      // try parsing salary_range like "5 LPA - 8 LPA"
      if (job.salary_range) {
        String(job.salary_range)
          .split(/[\-\u2013\u2014]/)
          .forEach((part) => {
            const lower = part.toLowerCase();
            const num = Number((lower.match(/(\d+(\.\d+)?)/) || [])[1]);
            if (!Number.isNaN(num)) {
              // assume LPA if mentions lpa/lakh, else treat as direct number
              const scaled =
                lower.includes("lpa") || lower.includes("lakh") || lower.includes("lac")
                  ? num * 100000
                  : num;
              nums.push(scaled);
            }
          });
      }
      if (!nums.length) return true;
      const jobMin = Math.min(...nums);
      const jobMax = Math.max(...nums);

      const overlaps = (bucket) =>
        jobMax >= bucket.min && jobMin <= bucket.max;

      return filters.stipendBands.some((id) => {
        const bucket = buckets[id];
        if (!bucket) return true;
        return overlaps(bucket);
      });
    };

    const parseExperienceYears = (text) => {
      const str = String(text || "").toLowerCase();
      if (!str) return null; // missing => treat as no match when filter is active

      const isMonths = str.includes("month");
      const toYears = (n) => (isMonths ? n / 12 : n);

      if (str.includes("fresher") || str.includes("entry")) {
        return { min: 0, max: 1 };
      }

      const nums = (str.match(/(\d+(\.\d+)?)/g) || []).map((n) => toYears(Number(n)));
      if (nums.length === 1) {
        const val = nums[0];
        if (str.includes("+") || str.includes("plus") || str.includes("above")) {
          return { min: val, max: 100 };
        }
        return { min: 0, max: val };
      }
      if (nums.length >= 2) {
        const [a, b] = nums;
        return { min: Math.min(a, b), max: Math.max(a, b) };
      }
      return null;
    };

    const matchBranches = (job) => {
      if (!filters.branches.length) return true;
      const allowedRaw = toArray(job.allowed_branches || job.branches || job.branch);
      if (!allowedRaw.length) return true; // if job has no restriction, don't filter it out

      const allowed = allowedRaw.map(normalizeBranch);
      return filters.branches.some((b) => allowed.includes(normalizeBranch(b)));
    };

    const matchJobType = (job) => {
      if (!filters.jobTypes.length) return true;
      const jt = (job.job_type || job.jobType || job.type || "").toLowerCase();
      return filters.jobTypes.some((t) => jt.includes(t.toLowerCase()));
    };

    const normalizeMode = (val) =>
      String(val || "")
        .toLowerCase()
        .replace(/[^a-z]/g, ""); // strip spaces, hyphens, punctuation

    const matchWorkMode = (job) => {
      if (!filters.workModes.length) return true;
      const wmRaw = job.work_mode || job.workMode || job.mode || "";
      const wm = normalizeMode(wmRaw);
      const locHint = normalizeMode(job.location);

      // if no job has a mode at all, don't hide everything
      const anyJobHasMode = jobs.some(
        (j) => j && normalizeMode(j.work_mode || j.workMode || j.mode || "")
      );
      if (!anyJobHasMode) return true;

      if (!wm && !locHint) return false; // if we do have data elsewhere, require a hint

      return filters.workModes.some((m) => {
        const target = normalizeMode(m);
        return (
          (wm && (wm === target || wm.includes(target))) ||
          (locHint && locHint.includes(target))
        );
      });
    };

    const parseSkills = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) {
        return value.map((s) =>
          typeof s === "object" && s?.name ? s.name : s
        );
      }
      const str = String(value);
      try {
        const parsed = JSON.parse(str);
        if (Array.isArray(parsed)) {
          return parsed.map((s) =>
            typeof s === "object" && s?.name ? s.name : s
          );
        }
      } catch (e) {
        /* ignore */
      }
      return str.split(/[,;\n]+/);
    };

    const normalizeSkill = (s) =>
      String(s || "")
        .toLowerCase()
        .replace(/[^a-z0-9\+\#\.]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const matchSkills = (job) => {
      if (!filters.skills.length) return true;
      const rawSkills = job.skills_required || job.skills || job.requiredSkills;
      const skillsList = parseSkills(rawSkills)
        .map(normalizeSkill)
        .filter(Boolean);

      const text = `${job.job_title || job.title || ""} ${
        job.job_description || job.description || ""
      } ${rawSkills || ""}`;
      const textNormalized = normalizeSkill(text);

      // If none of the jobs have any skills data at all, don't filter everything out
      const anyJobHasSkills = jobs.some((j) =>
        parseSkills(j?.skills_required || j?.skills || j?.requiredSkills).length
      );
      if (!anyJobHasSkills) return true;

      return filters.skills.some((s) => {
        const target = normalizeSkill(s);
        if (!target) return false;
        const hitList = skillsList.some(
          (js) => js.includes(target) || target.includes(js)
        );
        const hitText = textNormalized.includes(target);
        return hitList || hitText;
      });
    };

    const filtered = hasActiveFilters
      ? jobs.filter((job) => {
          const title = (job.job_title || job.title || "").toLowerCase();
          const company = (job.company_name || job.company || "").toLowerCase();
          const location = (job.location || "").toLowerCase();
          const skillsText = (job.skills_required || job.skills || "").toLowerCase();
          const searchMatch =
            !term ||
            title.includes(term) ||
            company.includes(term) ||
            location.includes(term) ||
            skillsText.includes(term);

          return (
            searchMatch &&
            withinStipend(job) &&
            matchBranches(job) &&
            matchJobType(job) &&
            matchWorkMode(job) &&
            matchSkills(job)
          );
        })
      : jobs;

    const toDate = (val) => {
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };

    const toNumber = (val) => {
      const n = Number(String(val || "").replace(/[^0-9.]/g, ""));
      return isNaN(n) ? null : n;
    };

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "soonest": {
          const da = toDate(a.application_deadline);
          const db = toDate(b.application_deadline);
          if (!da && !db) return 0;
          if (!da) return 1;
          if (!db) return -1;
          return da - db;
        }
        case "stipend-high": {
          const aMax = toNumber(a.max_ctc) || toNumber(a.stipend) || 0;
          const bMax = toNumber(b.max_ctc) || toNumber(b.stipend) || 0;
          return bMax - aMax;
        }
        case "stipend-low": {
          const aMin = toNumber(a.min_ctc) || toNumber(a.stipend) || 0;
          const bMin = toNumber(b.min_ctc) || toNumber(b.stipend) || 0;
          return aMin - bMin;
        }
        case "newest":
        default: {
          const ca = toDate(a.created_at) || toDate(a.updated_at);
          const cb = toDate(b.created_at) || toDate(b.updated_at);
          if (!ca && !cb) return 0;
          if (!ca) return 1;
          if (!cb) return -1;
          return cb - ca;
        }
      }
    });

    return sorted;
  }, [jobs, searchQuery, filters, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    // filtering is live; form prevents page reload
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () =>
    setFilters({
      branches: [],
      jobTypes: [],
      workModes: [],
      stipendBands: [],
      skills: [],
    });

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
          <form className="flex gap-4 max-w-2xl" onSubmit={handleSearch}>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/70 focus:bg-white/20"
              />
            </div>
            <Button type="submit" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 flex-shrink-0`}>
            <JobFilters
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
              branchOptions={branchOptions}
            />
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
                  {filteredJobs.length} opportunities found
                  {searchQuery ? ` for "${searchQuery}"` : ""}
                </p>
              </div>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="soonest">Deadline Soon</SelectItem>
                  <SelectItem value="stipend-high">Highest Stipend</SelectItem>
                  <SelectItem value="stipend-low">Lowest Stipend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Jobs Grid */}
            <div className="grid gap-6">
              {filteredJobs.map((job) => (
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
