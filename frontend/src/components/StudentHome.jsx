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

export default function StudentHome() {
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);

  const { data: profileData, isLoading: isProfileLoading } = useStudentProfile();
  const { data: recommendedJobs, isLoading: isJobsLoading } = useRecommendedJobs();

  const { completionPercentage } = calculateProfileCompletion(profileData || {});

  const userName = user?.name || "Student";

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
            <h2 className="text-2xl font-semibold text-[#4A148C]">Recommended for You</h2>
            <Button onClick={() => navigate("/student/jobs")} className="bg-[#4A148C] hover:bg-[#4A148C]/90 text-white">
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

        {/* Application History - This will be on a separate route */}
        {/* <ApplicationHistory /> */}
      </main>
    </div>
  );
}
