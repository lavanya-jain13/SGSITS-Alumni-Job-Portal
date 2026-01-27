// import { useEffect, useState } from "react";
// import Header from "./Header";
// import JobCard from "./JobCard";
// import ApplicationHistory from "./ApplicationHistory";
// import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router-dom";
// import { calculateProfileCompletion } from "@/lib/profileProgress";

// // 🔧 Normalize skills from backend → always array of { name }
// const normalizeSkills = (skills) => {
//   if (!skills) return [];

//   // If it's already an array (new format)
//   if (Array.isArray(skills)) {
//     return skills
//       .map((s) => {
//         if (typeof s === "string") return { name: s };
//         if (s && typeof s === "object" && s.name) return { name: s.name };
//         return null;
//       })
//       .filter(Boolean);
//   }

//   // If it's a comma-separated string (old format)
//   if (typeof skills === "string") {
//     return skills
//       .split(",")
//       .map((s) => s.trim())
//       .filter(Boolean)
//       .map((name) => ({ name }));
//   }

//   return [];
// };

// export default function StudentDashboard() {
//   const navigate = useNavigate();

//   // ✅ Profile data state
//   const [profileData, setProfileData] = useState({
//     name: "",
//     student_id: "",
//     branch: "",
//     grad_year: "",
//     resumeUploaded: false,
//     experiences: [],
//     skills: [],
//     summary: "",
//     desiredRoles: [],
//   });

//   const [recommendedJobs, setRecommendedJobs] = useState([]);
//   const [jobsLoading, setJobsLoading] = useState(false);

//   useEffect(() => {
//     const loadExtras = () => {
//       try {
//         // scope by logged-in user to avoid bleeding data across sessions
//         const user = JSON.parse(localStorage.getItem("user") || "{}");
//         const extrasKey = user?.id
//           ? `student_profile_extras_${user.id}`
//           : "student_profile_extras";
//         const raw = localStorage.getItem(extrasKey);
//         return raw ? JSON.parse(raw) : {};
//       } catch {
//         return {};
//       }
//     };

//     const loadProfile = async () => {
//       try {
//         const { apiFetch } = await import("@/lib/api");
//         const res = await apiFetch("/student/profile");
//         const profile = res?.profile || {};
//         const extras = loadExtras();

//         setProfileData((prev) => ({
//           ...prev,
//           name: profile.name || "",
//           student_id: profile.student_id || "",
//           branch: profile.branch || "",
//           grad_year: profile.grad_year || "",
//           // ✅ use normalizer instead of .split()
//           skills: normalizeSkills(profile.skills),
//           experiences: Array.isArray(profile.experiences)
//             ? profile.experiences
//             : [],
//           resumeUploaded: !!profile.resume_url,
//           desiredRoles: extras.desiredRoles || [],
//           summary: profile.proficiency || "",
//         }));
//       } catch (err) {
//         console.error("Failed to load profile for dashboard", err);
//         // Stay on dashboard even if unauthenticated or fetch fails
//       }
//     };

//     loadProfile();
//     const loadJobs = async () => {
//       setJobsLoading(true);
//       try {
//         const { apiFetch } = await import("@/lib/api");
//         const res = await apiFetch("/job/get-all-jobs-student");
//         const jobs = res?.jobs || [];
//         // map backend fields to JobCard props
//         const mapped = jobs.map((job) => ({
//           id: job.id || job.job_id || job.jobId,
//           title: job.job_title || job.title || "Job",
//           company:
//             job.company_name ||
//             job.company ||
//             job.company_website ||
//             "Company",
//           location: job.location || "Location",
//           type: job.job_type || job.type || "Job",
//         }));
//         setRecommendedJobs(mapped);
//       } catch (err) {
//         console.error("Failed to load recommended jobs", err);
//         setRecommendedJobs([]);
//       } finally {
//         setJobsLoading(false);
//       }
//     };
//     loadJobs();
//   }, [navigate]);

//   const { completionPercentage } = calculateProfileCompletion(profileData);

//   return (
//     <div className="min-h-screen bg-background">
//       <Header />

//       <main className="max-w-7xl mx-auto p-6">
//         {/* 🔹 Profile Progress Section */}
//         <div className="bg-white shadow rounded-lg p-6 mb-8">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-semibold">Your Profile Progress</h2>
//             {/* ✅ Fixed navigation path */}
//             <Button
//               onClick={() => navigate("/student/profile")}
//               className="bg-[#023859] hover:bg-[#023859]/90"
//             >
//               Complete Profile
//             </Button>
//           </div>

//           <p className="text-gray-600 mb-2">
//             Complete your profile to unlock more opportunities and gain badges!
//           </p>

//           {/* Progress Bar */}
//           <div className="flex items-center mb-4">
//             <span className="text-2xl font-bold text-[#023859] mr-4">
//               {completionPercentage}%
//             </span>
//             <div className="w-full bg-gray-200 rounded-full h-2">
//               <div
//                 className="h-2 rounded-full bg-[#023859]"
//                 style={{ width: `${completionPercentage}%` }}
//               />
//             </div>
//           </div>

//           {/* Tasks + Badges */}
//           <div className="grid md:grid-cols-2 gap-6">
//             {/* Tasks */}
//             <div>
//               <h3 className="font-medium mb-2">Tasks to Complete</h3>
//               <ul className="space-y-2 text-sm">
//                 <li>
//                   {profileData.resumeUploaded ? "✅" : "⭕"} Upload your resume
//                 </li>
//                 <li>
//                   {profileData.experiences.length > 0 ? "✅" : "⭕"} Fill out work
//                   experience
//                 </li>
//                 <li>
//                   {profileData.skills.length >= 3 ? "✅" : "⭕"} Add 3 key skills
//                 </li>
//                 <li>
//                   {profileData.summary ? "✅" : "⭕"} Write a professional
//                   summary
//                 </li>
//               </ul>
//             </div>

//             {/* Badges */}
//             <div>
//               <h3 className="font-medium mb-2">Your Badges</h3>
//               <div className="flex gap-6">
//                 <div className="text-center">
//                   <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
//                     ⭐
//                   </div>
//                   <p className="text-xs mt-1">Profile Pioneer</p>
//                 </div>
//                 <div className="text-center">
//                   <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
//                     🔍
//                   </div>
//                   <p className="text-xs mt-1">Skill Seeker</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Recommended Jobs Section */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-semibold">Recommended for You</h2>
//             <Button onClick={() => navigate("/jobs")} variant="outline">
//               View All Jobs
//             </Button>
//           </div>
//           {jobsLoading ? (
//             <p className="text-sm text-muted-foreground">Loading jobs...</p>
//           ) : recommendedJobs.length ? (
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//               {recommendedJobs.map((job) => (
//                 <JobCard
//                   key={job.id}
//                   id={job.id}
//                   title={job.title}
//                   company={job.company}
//                   location={job.location}
//                   type={job.type}
//                 />
//               ))}
//             </div>
//           ) : (
//             <p className="text-sm text-muted-foreground">
//               No recommended jobs right now. Check back soon or view all jobs.
//             </p>
//           )}
//         </div>

//         {/* Application History */}
//         <ApplicationHistory />
//       </main>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import Header from "./Header";
import JobCard from "./JobCard";
import ApplicationHistory from "./ApplicationHistory";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { calculateProfileCompletion } from "@/lib/profileProgress";

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

  // ✅ Profile data state
  const [profileData, setProfileData] = useState({
    name: "",
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
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const extrasKey = user?.id
          ? `student_profile_extras_${user.id}`
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
          name: profile.name || "",
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
  }, []);

  const { completionPercentage } = calculateProfileCompletion(profileData);

  const firstInitial =
    (profileData.name || "Student").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f5f6fb] text-slate-900">
      {/* Top global header stays but we visually blend with sidebar theme */}
      <Header />

      <div className="flex">
        {/* Sidebar – fixed theme #063970 */}
        <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-[#063970] text-white min-h-[calc(100vh-4rem)]">
          <div className="px-6 pt-6 pb-4 flex items-center gap-3 border-b border-white/10">
            <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center text-lg font-semibold">
              {firstInitial}
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight">
                JobPortal
              </span>
              <span className="text-xs text-white/80">Student Dashboard</span>
            </div>
          </div>

          <nav className="mt-4 px-3 space-y-1 text-sm">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-white/15 text-white font-medium"
              onClick={() => navigate("/student/profile")}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/15 text-xs">
                👤
              </span>
              <span>Complete Profile</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/85 hover:bg-white/10 transition-colors"
              onClick={() => navigate("/jobs")}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-xs">
                💼
              </span>
              <span>View Jobs</span>
            </button>

            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/85 hover:bg-white/10 transition-colors"
              onClick={() => {
                const el = document.getElementById("recent-applications");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 text-xs">
                🕒
              </span>
              <span>Recent Applications</span>
            </button>
          </nav>

          <div className="mt-auto px-5 py-4 text-xs text-white/70 border-t border-white/10">
            <p className="leading-snug">
              Keep your profile updated to receive better job recommendations
              from alumni.
            </p>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6">
          {/* Welcome banner */}
          <section className="mb-6">
            <div className="rounded-2xl bg-white shadow-lg shadow-slate-200/60 px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#063970]/90">
                  Student Dashboard
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#063970]">
                  Welcome back{profileData.name ? `, ${profileData.name}` : ""}!
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Track your progress and discover new opportunities.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="rounded-full border-[#063970]/20 text-[#063970] hover:bg-[#063970]/5 text-xs sm:text-sm"
                  onClick={() => navigate("/jobs")}
                >
                  View All Jobs
                </Button>
              </div>
            </div>
          </section>

          {/* Profile progress + actions row */}
          <section className="mb-6">
            <div className="grid lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] gap-5">
              {/* Profile completion card */}
              <div className="rounded-2xl bg-white shadow-lg shadow-slate-200/60 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Complete Profile
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Finish your profile to unlock more personalized jobs.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-full bg-[#063970] hover:bg-[#063970]/90 text-xs sm:text-sm px-4"
                    onClick={() => navigate("/student/profile")}
                  >
                    Complete Profile
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-[#063970]">
                      {completionPercentage}%
                    </span>
                    <span className="text-[11px] text-slate-500 uppercase tracking-wide">
                      Profile Complete
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="w-full h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-[#063970]"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                    <ul className="mt-3 grid sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                      <li>
                        {profileData.resumeUploaded ? "✅" : "⭕"} Upload your
                        resume
                      </li>
                      <li>
                        {profileData.experiences.length > 0 ? "✅" : "⭕"} Add
                        experience / projects
                      </li>
                      <li>
                        {profileData.skills.length >= 3 ? "✅" : "⭕"} Add at
                        least 3 skills
                      </li>
                      <li>
                        {profileData.summary ? "✅" : "⭕"} Write a short
                        summary
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Simple badges / tips card */}
              <div className="rounded-2xl bg-[#063970] text-white shadow-lg shadow-slate-300/50 p-5">
                <h3 className="text-base font-semibold mb-2">
                  Quick Tips & Badges
                </h3>
                <p className="text-xs text-white/80 mb-4">
                  Complete your profile and apply to jobs to earn badges and
                  stand out to alumni recruiters.
                </p>
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="w-11 h-11 rounded-full bg-yellow-400 flex items-center justify-center text-white text-lg font-bold">
                      ⭐
                    </div>
                    <p className="mt-1 text-[11px]">Profile Pioneer</p>
                  </div>
                  <div className="text-center">
                    <div className="w-11 h-11 rounded-full bg-white/25 flex items-center justify-center text-white text-lg font-bold">
                      🔍
                    </div>
                    <p className="mt-1 text-[11px]">Skill Seeker</p>
                  </div>
                  <div className="text-center">
                    <div className="w-11 h-11 rounded-full bg-emerald-400 flex items-center justify-center text-white text-lg font-bold">
                      ✔
                    </div>
                    <p className="mt-1 text-[11px]">First Application</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Recommended + Recent applications layout like design */}
          <section className="grid xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1.4fr)] gap-6 items-start">
            {/* Recommended Jobs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Recommended for You
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Jobs matching your profile and skills
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-[#063970] hover:bg-[#063970]/5"
                  onClick={() => navigate("/jobs/matching")}
                >
                  See more
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {jobsLoading ? (
                  <div className="col-span-full text-sm text-slate-500 py-6 text-center">
                    Loading recommendations...
                  </div>
                ) : recommendedJobs.length ? (
                  recommendedJobs.slice(0, 4).map((job) => (
                    <div
                      key={job.id}
                      className="rounded-2xl bg-white shadow-lg shadow-slate-200/70 p-4 flex flex-col justify-between border border-slate-100"
                    >
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {job.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {job.company}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-2">
                          📍 {job.location}
                        </p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-[11px] px-3 py-1 font-medium">
                          {job.type}
                        </span>
                        <Button
                          size="sm"
                          className="rounded-full bg-[#063970] hover:bg-[#063970]/90 text-xs px-4"
                          onClick={() => navigate(`/jobs/${job.id}`)}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-sm text-slate-500 py-6 text-center">
                    No recommended jobs right now. Check back soon or view all
                    jobs.
                  </div>
                )}
              </div>
            </div>

            {/* Recent Applications (reuse existing component inside card) */}
            <div id="recent-applications">
              <div className="rounded-2xl bg-white shadow-lg shadow-slate-200/70 p-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">
                  Recent Applications
                </h2>
                <p className="text-xs text-slate-500 mb-3">
                  Track your job application progress
                </p>
                {/* ApplicationHistory already renders its own inner card/list */}
                <ApplicationHistory />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
