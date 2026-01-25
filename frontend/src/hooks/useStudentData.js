import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

// 🔧 Normalize skills from backend → always array of { name }
const normalizeSkills = (skills) => {
  if (!skills) return [];

  // If it's already an array (new format)
  if (Array.isArray(skills)) {
    return skills
      .map((s) => {
        if (typeof s === "string") return { name: s };
        if (s && typeof s === "object" && s.name) return { name: s.name };
        return null;
      })
      .filter(Boolean);
  }

  // If it's a comma-separated string (old format)
  if (typeof skills === "string") {
    return skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name }));
  }

  return [];
};

// Helper to load profile extras from localStorage
const loadStudentProfileExtras = () => {
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

const STUDENT_PROFILE_QUERY_KEY = "studentProfile";
const RECOMMENDED_JOBS_QUERY_KEY = "recommendedJobs";

export function useStudentProfile() {
  return useQuery({
    queryKey: [STUDENT_PROFILE_QUERY_KEY],
    queryFn: async () => {
      const res = await apiFetch("/student/profile");
      const profile = res?.profile || {};
      const extras = loadStudentProfileExtras();

      return {
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
      };
    },
  });
}

export function useRecommendedJobs() {
  return useQuery({
    queryKey: [RECOMMENDED_JOBS_QUERY_KEY],
    queryFn: async () => {
      const res = await apiFetch("/job/get-all-jobs-student");
      const jobs = res?.jobs || [];
      return jobs.map((job) => ({
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
    },
  });
}

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

const normalizeBranch = (val) =>
  String(val || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/engineering/g, "engg")
    .replace(/\s+/g, " ")
    .trim();

export function useAllJobs() {
  return useQuery({
    queryKey: ["allJobs"],
    queryFn: async () => {
      const res = await apiFetch("/job/get-all-jobs-student", { method: "GET" });
      return res?.jobs || [];
    },
  });
}

export function useBranches() {
  const { data: jobs } = useAllJobs();
  return useMemo(() => {
    const all = new Set();
    if (jobs) {
      jobs.forEach((job) => {
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
    }
    defaultBranches.forEach((b) => all.add(b));
    return Array.from(all).sort();
  }, [jobs]);
}
