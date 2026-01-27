import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { calculateProfileCompletion } from "@/lib/profileProgress";
import ApplicationHistory from "./ApplicationHistory"; // Ensure this is styled correctly
import { Button } from "@/components/ui/button";

// 🔧 Normalize skills from backend → always array of { name }
const normalizeSkills = (skills) => {
  if (!skills) return [];

  if (Array.isArray(skills)) {
    return skills
      .map((s) => {
        if (typeof s === "string") return { name: s };
        if (s && typeof s === "object" && s.name) return { name: s.name };
        return null;
      })
      .filter(Boolean);
  }

  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name }));
  }

  return [];
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    student_id: "",
    branch: "",
    grad_year: "",
    resumeUploaded: false,
    experiences: [],
    skills: [],
    summary: "",
    desiredRoles: [],
  });

  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  useEffect(() => {
    const loadExtras = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        const extrasKey = storedUser?.id
          ? `student_profile_extras_${storedUser.id}`
          : "student_profile_extras";
        const raw = localStorage.getItem(extrasKey);
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    };

    const loadProfile = async () => {
      try {
        const { apiFetch } = await import("@/lib/api");
        const res = await apiFetch("/student/profile");
        const profile = res?.profile || {};
        const extras = loadExtras();

        setProfileData((prev) => ({
          ...prev,
          name: profile.name || user?.name || "",
          student_id: profile.student_id || "",
          branch: profile.branch || "",
          grad_year: profile.grad_year || "",
          skills: normalizeSkills(profile.skills),
          experiences: Array.isArray(profile.experiences)
            ? profile.experiences
            : [],
          resumeUploaded: !!profile.resume_url,
          desiredRoles: extras.desiredRoles || [],
          summary: profile.proficiency || "",
        }));
      } catch (err) {
        console.error("Failed to load profile for dashboard", err);
      }
    };

    const loadJobs = async () => {
      setJobsLoading(true);
      try {
        const { apiFetch } = await import("@/lib/api");
        const res = await apiFetch("/job/get-all-jobs-student");
        const jobs = res?.jobs || [];
        const mapped = jobs.map((job) => ({
          id: job.id || job.job_id || job.jobId,
          title: job.job_title || job.title || "Job",
          company:
            job.company_name ||
            job.company ||
            job.company_website ||
            "Company",
          location: job.location || "Location",
          type: job.job_type || job.type || "Job",
        }));
        setRecommendedJobs(mapped);
      } catch (err) {
        console.error("Failed to load recommended jobs", err);
        setRecommendedJobs([]);
      } finally {
        setJobsLoading(false);
      }
    };

    loadProfile();
    loadJobs();
  }, [user]);

  const { completionPercentage } = calculateProfileCompletion(profileData);

  const firstInitial = (profileData.name || "S").trim().charAt(0).toUpperCase();

  const getPillColor = (type) => {
    const lowerType = (type || "").toLowerCase();
    if (lowerType.includes("full-time")) return "bg-[#e0e7ff] text-[#4338ca]"; // Blue for Full-time
    if (lowerType.includes("internship")) return "bg-[#e0e7ff] text-[#4338ca]"; // Blue for Internship
    if (lowerType.includes("part-time")) return "bg-[#fefce8] text-[#a16207]"; // Yellow for Part-time
    if (lowerType.includes("contract")) return "bg-[#f0f9ff] text-[#0369a1]"; // Light blue for Contract
    return "bg-gray-100 text-gray-800"; // Default
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900 flex">
      {/* Sidebar */}
      <aside className="w-[280px] bg-[#072442] text-white flex flex-col pt-8 pb-4">
        <div className="flex items-center gap-3 px-6 mb-8">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold">
            {firstInitial}
          </div>
          <div>
            <h2 className="text-lg font-bold">JobPortal</h2>
            <p className="text-xs text-white/70">Student Dashboard</p>
          </div>
        </div>

        <nav className="flex-1 px-6">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => navigate("/student/profile")}
                className="flex items-center w-full p-3 rounded-xl text-white/90 bg-white/10 font-medium transition-colors hover:bg-white/20"
              >
                <span className="w-5 h-5 mr-3 flex items-center justify-center">📝</span> Complete Profile
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/jobs")}
                className="flex items-center w-full p-3 rounded-xl text-white/70 hover:bg-white/10 transition-colors"
              >
                <span className="w-5 h-5 mr-3 flex items-center justify-center">💼</span> View Jobs
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  const el = document.getElementById("recent-applications-section");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="flex items-center w-full p-3 rounded-xl text-white/70 hover:bg-white/10 transition-colors"
              >
                <span className="w-5 h-5 mr-3 flex items-center justify-center">🕒</span> Recent Applications
              </button>
            </li>
          </ul>
        </nav>

        <div className="px-6 mt-auto text-xs text-white/70">
            <p className="leading-snug">
              Track your progress and discover new opportunities.
            </p>
          </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Welcome Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#072442]">Welcome back, {profileData.name || "John"}! 👋</h1>
              <p className="text-slate-500 text-base mt-1">Track your progress and discover new opportunities.</p>
            </div>
            <Button
              variant="outline"
              className="rounded-full border-gray-300 text-gray-700 hover:bg-gray-100 text-sm py-2 px-4"
              onClick={() => navigate("/jobs")}
            >
              View All Jobs
            </Button>
          </div>
        </section>

        {/* Recommended for You Jobs - First Screenshot Layout */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold text-slate-800">Recommended for You</h2>
            <Button variant="ghost" className="text-[#072442] hover:bg-[#072442]/5 text-sm" onClick={() => navigate("/jobs/matching")}>
              View All Jobs →
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {jobsLoading ? (
              <div className="col-span-full text-center text-slate-500 py-10">Loading recommended jobs...</div>
            ) : recommendedJobs.length ? (
              recommendedJobs.slice(0, 4).map((job) => (
                <div key={job.id} className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between border border-gray-200">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1 flex items-center">
                        <span className="w-4 h-4 mr-2">🏢</span>
                        {job.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-2 flex items-center">
                        <span className="w-4 h-4 mr-2">💼</span> {job.company}
                    </p>
                    <div className="flex items-center text-xs text-slate-400">
                      <span className="mr-1">📍</span> {job.location}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className={`text-[11px] font-medium px-3 py-1 rounded-full ${getPillColor(job.type)}`}>
                      {job.type}
                    </span>
                    <Button
                      size="sm"
                      className="rounded-full bg-[#072442] hover:bg-[#072442]/90 text-white text-xs px-4"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-slate-500 py-10">No recommended jobs right now.</div>
            )}
          </div>
        </section>

        {/* Recent Applications - Second Screenshot Layout */}
        <section id="recent-applications-section">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-semibold text-slate-800">Recent Applications</h2>
            <Button variant="ghost" className="text-[#072442] hover:bg-[#072442]/5 text-sm" onClick={() => navigate("/applications")}>
              View All →
            </Button>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
             <ApplicationHistory />
          </div>
        </section>
      </main>
    </div>
  );
}