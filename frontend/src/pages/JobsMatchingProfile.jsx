import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, Briefcase, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobCard from "@/components/JobCard";
import { selectAuth } from "@/store/authSlice";

export default function JobsMatchingProfile() {
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentBranch, setStudentBranch] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProfileAndJobs = async () => {
      try {
        setLoading(true);
        const { apiFetch } = await import("@/lib/api");

        // Load student profile to infer academic branch
        try {
          const profileRes = await apiFetch("/student/profile", {
            method: "GET",
          });
          const branch =
            profileRes?.profile?.branch ||
            profileRes?.profile?.department ||
            "";
          if (mounted && branch) setStudentBranch(branch);
        } catch {
          // Profile might not be completed yet – fall back to user payload
          const branchFromUser =
            user?.branch || user?.department || user?.course || "";
          if (mounted && branchFromUser) setStudentBranch(branchFromUser);
        }

        const jobsRes = await apiFetch("/job/get-all-jobs-student", {
          method: "GET",
        });
        if (mounted && jobsRes?.jobs) {
          setJobs(jobsRes.jobs);
        }
      } catch (err) {
        console.error("Failed to load matching jobs", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfileAndJobs();

    return () => {
      mounted = false;
    };
  }, [user]);

  const normalizedBranch = useMemo(() => {
    if (!studentBranch) return "";
    return String(studentBranch).trim();
  }, [studentBranch]);

  const matchingJobs = useMemo(() => {
    if (!jobs.length) return [];
    if (!normalizedBranch) return jobs;

    const normalize = (val) =>
      String(val || "")
        .toLowerCase()
        .replace(/engineering/g, "engg")
        .replace(/&/g, "and")
        .replace(/\s+/g, " ")
        .trim();

    const target = normalize(normalizedBranch);

    return jobs.filter((job) => {
      const rawBranches =
        job.allowed_branches ||
        job.branches ||
        job.branch ||
        job.allowedBranches ||
        "";

      const list = Array.isArray(rawBranches)
        ? rawBranches
        : String(rawBranches)
            .split(",")
            .map((b) => b.trim())
            .filter(Boolean);

      if (!list.length) return true; // jobs without branch restriction stay visible

      return list.some((b) => normalize(b) === target);
    });
  }, [jobs, normalizedBranch]);

  const headingBranchLabel =
    normalizedBranch || "Your Branch / Specialization";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <Button
            variant="ghost"
            className="gap-2 px-0 text-slate-700 hover:text-slate-900 hover:bg-transparent dark:text-slate-200"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
              Jobs Matching Your Profile
            </h1>
            <p className="text-slate-600 dark:text-slate-300 flex items-center gap-2 text-sm md:text-base">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              Showing opportunities applicable for{" "}
              <span className="font-semibold ml-1">{headingBranchLabel}</span>
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl bg-white/80 px-3 py-2 shadow-sm border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700">
            <div className="h-9 w-9 rounded-lg bg-blue-600/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600 dark:text-cyan-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Personalized
              </p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {matchingJobs.length} opportunities
              </p>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
                <div className="h-8 w-8 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-sm">Loading opportunities for you…</p>
              </div>
            </div>
          ) : matchingJobs.length ? (
            matchingJobs.map((job) => (
              <JobCard
                key={job._id || job.id}
                id={job._id || job.id}
                title={job.job_title || job.title || "Job"}
                company={job.company_name || job.company}
                location={job.location || "Location not specified"}
                type={job.job_type || job.type || "Job"}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
              <p className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1">
                No perfect matches yet
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                Complete your student profile and keep checking back as alumni
                post new roles.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/student/profile")}
              >
                Update my profile
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


