import JobCard from "./JobCard";
import ApplicationHistory from "./ApplicationHistory";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { calculateProfileCompletion } from "@/lib/profileProgress";
import { useStudentProfile, useRecommendedJobs } from "@/hooks/useStudentData";
import { useSelector } from "react-redux";
import { selectAuth } from "@/store/authSlice";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentHome() {
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);

  const { data: profileData, isLoading: isProfileLoading } = useStudentProfile();
  const { data: recommendedJobs, isLoading: isJobsLoading } = useRecommendedJobs();

  const { completionPercentage } = calculateProfileCompletion(profileData || {});

  const userName = user?.name || "Student";

  const [appliedJobs, setAppliedJobs] = useState([]);
  const [isAppliedJobsLoading, setIsAppliedJobsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadAppliedJobs = async () => {
      setIsAppliedJobsLoading(true);
      try {
        const { apiFetch } = await import("@/lib/api");
        const res = await apiFetch("/job/get-applied-jobs");
        if (mounted) {
          setAppliedJobs(res?.applications || []);
        }
      } catch (err) {
        console.error("Failed to load applied jobs", err);
        if (mounted) setAppliedJobs([]);
      } finally {
        if (mounted) setIsAppliedJobsLoading(false);
      }
    };
    loadAppliedJobs();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col flex-1 bg-gray-50">
      {/* This header is now part of StudentDashboardLayout, removing from here */}
      {/* <header className="bg-white shadow-sm p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {userName}!</h1>
        <div className="flex items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50">
                <Lightbulb className="h-5 w-5" />
                Tips
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-white p-4 rounded-lg shadow-lg border border-purple-100">
              <h4 className="font-bold text-lg text-purple-700 mb-2">Pro Tips for Students</h4>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>💡 Complete your profile to get personalized job recommendations.</li>
                <li>🚀 Regularly check new job postings in the 'View Jobs' section.</li>
                <li>📝 Keep your resume updated for quick applications.</li>
                <li>⭐ Apply to jobs that best match your skills and desired roles.</li>
              </ul>
            </PopoverContent>
          </Popover>
        </div>
      </header> */}

      <main className="flex-1 p-6">

        {/* Recommended Jobs Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#000]" >Recommended for You</h2>
            <Button onClick={() => navigate("/student/jobs")} className="bg-[#072442] hover:bg-[#336193]/90 text-white">
              View All Jobs
            </Button>
          </div>
          {isJobsLoading ? (
            <p className="text-sm text-muted-foreground">Loading jobs...</p>
          ) : recommendedJobs?.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  type={job.type}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No recommended jobs right now. Check back soon or view all jobs.
            </p>
          )}
        </div>

        {/* Recent Applications Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#000] mb-6">Recent Applications</h2>
          {isAppliedJobsLoading ? (
            <p className="text-sm text-muted-foreground">Loading applications...</p>
          ) : appliedJobs?.length ? (
            <div className="space-y-4">
              {appliedJobs.slice(0, 3).map((app) => (
                <Card key={app.application_id || app.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{app.job_title || "Job"}</h4>
                      <p className="text-sm text-muted-foreground">
                        {app.company_name || app.company || "Company"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Applied {app.applied_at ? new Date(app.applied_at).toDateString() : ""}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant="secondary"
                        className={
                          String(app.application_status || app.status || "pending").toLowerCase() === "reviewed"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : String(app.application_status || app.status || "pending").toLowerCase() === "applied"
                              ? "bg-orange-100 text-orange-800 border-orange-200"
                              : String(app.application_status || app.status || "pending").toLowerCase() === "interview"
                                ? "bg-green-100 text-green-800 border-green-200"
                                : String(app.application_status || app.status || "pending").toLowerCase() === "accepted"
                                  ? "bg-green-100 text-green-800 border-green-200"
                                  : String(app.application_status || app.status || "pending").toLowerCase() === "rejected"
                                    ? "bg-red-100 text-red-800 border-red-200"
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                        }
                      >
                        {app.application_status || app.status || "Pending"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/jobs/${app.job_id || app.jobId || app.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No applications yet. Start applying to jobs to see them here.
            </p>
          )}
        </div>

        {/* Application History - This will be on a separate route */}
        {/* <ApplicationHistory /> */}
      </main>
    </div>
  );
}
