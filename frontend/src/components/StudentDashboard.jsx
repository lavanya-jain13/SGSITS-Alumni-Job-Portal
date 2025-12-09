import { useEffect, useState } from "react";
import Header from "./Header";
import JobCard from "./JobCard";
import ApplicationHistory from "./ApplicationHistory";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { calculateProfileCompletion } from "@/lib/profileProgress";

const recommendedJobs = [
  { id: "1", title: "Junior Frontend Developer", company: "InnovaTech - New York, NY", location: "New York, NY", type: "Full-time" },
  { id: "2", title: "Data Analyst Intern", company: "Global Insights - Remote", location: "Remote", type: "Internship" },
  { id: "3", title: "Cloud Support Engineer", company: "CloudWorks - Seattle, WA", location: "Seattle, WA", type: "Full-time" },
  { id: "4", title: "UI/UX Designer", company: "CreativeFlow - Austin, TX", location: "Austin, TX", type: "Contract" },
  { id: "5", title: "Backend Developer", company: "CodeForge - San Francisco, CA", location: "San Francisco, CA", type: "Full-time" },
  { id: "6", title: "Software Engineering Intern", company: "Apex Solutions - Boston, MA", location: "Boston, MA", type: "Internship" },
];

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

  useEffect(() => {
    const loadExtras = () => {
      try {
        const raw = localStorage.getItem("student_profile_extras");
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
          skills: profile.skills
            ? profile.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((name) => ({ name }))
            : [],
          experiences: profile.experiences || [],
          resumeUploaded: !!profile.resume_url,
          desiredRoles: extras.desiredRoles || [],
        }));
      } catch (err) {
        console.error("Failed to load profile for dashboard", err);
        // Stay on dashboard even if unauthenticated or fetch fails
      }
    };

    loadProfile();
  }, [navigate]);

  const { completionPercentage } = calculateProfileCompletion(profileData);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="max-w-7xl mx-auto p-6">
        {/* 🔹 Profile Progress Section */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Profile Progress</h2>
            {/* ✅ Fixed navigation path */}
            <Button
              onClick={() => navigate("/student/profile")}
              className="bg-[#023859] hover:bg-[#023859]/90"
            >
              Complete Profile
            </Button>
          </div>

          <p className="text-gray-600 mb-2">
            Complete your profile to unlock more opportunities and gain badges!
          </p>

          {/* Progress Bar */}
          <div className="flex items-center mb-4">
            <span className="text-2xl font-bold text-[#023859] mr-4">
              {completionPercentage}%
            </span>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-[#023859]"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Tasks + Badges */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Tasks */}
            <div>
              <h3 className="font-medium mb-2">Tasks to Complete</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  {profileData.resumeUploaded ? "✅" : "⭕"} Upload your resume
                </li>
                <li>
                  {profileData.experiences.length > 0 ? "✅" : "⭕"} Fill out work
                  experience
                </li>
                <li>
                  {profileData.skills.length >= 3 ? "✅" : "⭕"} Add 3 key skills
                </li>
                <li>
                  {profileData.summary ? "✅" : "⭕"} Write a professional
                  summary
                </li>
              </ul>
            </div>

            {/* Badges */}
            <div>
              <h3 className="font-medium mb-2">Your Badges</h3>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">
                    ⭐
                  </div>
                  <p className="text-xs mt-1">Profile Pioneer</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold">
                    🔍
                  </div>
                  <p className="text-xs mt-1">Skill Seeker</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Jobs Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Recommended for You</h2>
            <Button onClick={() => navigate("/jobs")} variant="outline">
              View All Jobs
            </Button>
          </div>
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
        </div>

        {/* Application History */}
        <ApplicationHistory />
      </main>
    </div>
  );
}
