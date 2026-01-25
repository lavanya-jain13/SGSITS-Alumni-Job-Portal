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

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);

  const { data: profileData, isLoading: isProfileLoading } = useStudentProfile();
  const { data: recommendedJobs, isLoading: isJobsLoading } = useRecommendedJobs();

  const { completionPercentage } = calculateProfileCompletion(profileData || {});

  const userName = user?.name || user?.email || "Student";

  return (
    <div className="flex flex-col flex-1 bg-gray-50">
      <header className="bg-white shadow-sm p-6 flex items-center justify-between">
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
      </header>

      <main className="flex-1 p-6">
        {/* Profile Progress Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#4A148C]">Your Profile Progress</h2>
            <Button
              onClick={() => navigate("/student/profile")}
              className="bg-[#4A148C] hover:bg-[#4A148C]/90 text-white"
            >
              Complete Profile
            </Button>
          </div>
          <p className="text-gray-600 mb-2">
            Complete your profile to unlock more opportunities and gain badges!
          </p>
          <div className="flex items-center mb-4">
            <span className="text-2xl font-bold text-[#4A148C] mr-4">
              {completionPercentage}%
            </span>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2 text-gray-700">Tasks to Complete</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  {profileData?.resumeUploaded ? "✅" : "⭕"} Upload your resume
                </li>
                <li>
                  {profileData?.experiences?.length > 0 ? "✅" : "⭕"} Fill out work experience
                </li>
                <li>
                  {profileData?.skills?.length >= 3 ? "✅" : "⭕"} Add 3 key skills
                </li>
                <li>
                  {profileData?.summary ? "✅" : "⭕"} Write a professional summary
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2 text-gray-700">Your Badges</h3>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                    ⭐
                  </div>
                  <p className="text-xs mt-1 text-gray-600">Profile Pioneer</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                    🔍
                  </div>
                  <p className="text-xs mt-1 text-gray-600">Skill Seeker</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Jobs Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-[#4A148C]">Recommended for You</h2>
            <Button onClick={() => navigate("/jobs")} variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
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

        {/* Application History */}
        <ApplicationHistory />
      </main>
    </div>
  );
}
