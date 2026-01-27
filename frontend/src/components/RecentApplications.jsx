import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ApplicationCard from "./ApplicationCard";

export default function RecentApplications() {
  const navigate = useNavigate();

  // Placeholder data for recent applications
  const recentApplications = [
    {
      id: "1",
      jobTitle: "Backend Developer",
      company: "CodeCraft Solutions",
      location: "Bangalore, India",
      appliedDate: "2026-01-25",
      status: "Reviewed",
      jobType: "Full-time",
      statusMessage: "Your application has been reviewed by the hiring team. You will be notified shortly about the next steps.",
    },
    {
      id: "2",
      jobTitle: "UI/UX Designer",
      company: "Design Hub",
      location: "Mumbai, India",
      appliedDate: "2026-01-22",
      status: "Applied",
      jobType: "Internship",
    },
    {
      id: "3",
      jobTitle: "Software Engineer I",
      company: "TechCorp",
      location: "Pune, India",
      appliedDate: "2026-01-20",
      status: "Interview",
      jobType: "Full-time",
      lastUpdated: "2026-01-24",
      statusMessage: "You have been shortlisted for an interview. Please check your email for scheduling details.",
    },
    {
      id: "4",
      jobTitle: "Frontend Developer",
      company: "WebFlow Inc",
      location: "Hyderabad, India",
      appliedDate: "2026-01-17",
      status: "Applied",
      jobType: "Full-time",
    },
  ];

  const onViewDetails = (application) => {
    console.log("View details for application:", application.id);
    // Navigate to a detailed application page or open a modal
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Recent Applications</h2>
        <Button onClick={() => navigate("/student/applications")} className="bg-[#072442] hover:bg-[#072442]/90 text-white">
          View All
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentApplications.map((application) => (
          <ApplicationCard
            key={application.id}
            application={application}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </div>
  );
}
