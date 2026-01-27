import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ApplicationCard from "./ApplicationCard"; // Assuming this component exists

export default function RecentApplications() {
  const navigate = useNavigate();

  // Placeholder data for recent applications
  const recentApplications = [
    {
      id: "1",
      title: "Backend Developer",
      company: "CodeCraft Solutions",
      timeAgo: "2 days ago",
      status: "Reviewed",
    },
    {
      id: "2",
      title: "UI/UX Designer",
      company: "Design Hub",
      timeAgo: "5 days ago",
      status: "Applied",
    },
    {
      id: "3",
      title: "Software Engineer I",
      company: "TechCorp",
      timeAgo: "7 days ago",
      status: "Interview",
    },
    {
      id: "4",
      title: "Frontend Developer",
      company: "WebFlow Inc",
      timeAgo: "10 days ago",
      status: "Applied",
    },
  ];

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-white">Recent Applications</h2>
        <Button onClick={() => navigate("/student/applications")} className="bg-[#4A148C] hover:bg-[#4A148C]/90 text-white">
          View All
        </Button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentApplications.map((application) => (
          <ApplicationCard
            key={application.id}
            id={application.id}
            title={application.title}
            company={application.company}
            timeAgo={application.timeAgo}
            status={application.status}
          />
        ))}
      </div>
    </div>
  );
}
