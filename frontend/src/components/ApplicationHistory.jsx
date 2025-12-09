// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useNavigate } from "react-router-dom";

// const statusColors = {
//   reviewed: "bg-blue-100 text-blue-800 border-blue-200",
//   applied: "bg-orange-100 text-orange-800 border-orange-200",
//   interview: "bg-green-100 text-green-800 border-green-200",
//   accepted: "bg-green-100 text-green-800 border-green-200",
//   rejected: "bg-red-100 text-red-800 border-red-200",
//   pending: "bg-gray-100 text-gray-800 border-gray-200",
// };

// export default function ApplicationHistory() {
//   const navigate = useNavigate();
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     let mounted = true;
//     const loadApplications = async () => {
//       setLoading(true);
//       try {
//         const { apiFetch } = await import("@/lib/api");
//         const res = await apiFetch("/job/get-applied-jobs");
//         if (!mounted) return;
//         setApplications(res?.applications || []);
//       } catch (err) {
//         console.error("Failed to load applications", err);
//         if (mounted) setApplications([]);
//       } finally {
//         if (mounted) setLoading(false);
//       }
//     };
//     loadApplications();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   const handleView = (app) => {
//     const jobId = app.job_id || app.jobId || app.id;
//     if (jobId) navigate(`/jobs/${jobId}`);
//   };

//   return (
//     <Card className="mt-8">
//       <CardHeader>
//         <CardTitle className="text-lg font-semibold">Recent Applications</CardTitle>
//       </CardHeader>
//       <CardContent>
//         {loading ? (
//           <p className="text-sm text-muted-foreground">Loading applications...</p>
//         ) : applications.length === 0 ? (
//           <p className="text-sm text-muted-foreground">No applications yet.</p>
//         ) : (
//           <div className="space-y-4">
//             {applications.map((app) => (
//               <div
//                 key={app.application_id || app.id}
//                 className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors"
//               >
//                 <div>
//                   <h4 className="font-medium">{app.job_title || "Job"}</h4>
//                   <p className="text-sm text-muted-foreground">
//                     {app.company_name || app.company || "Company"}
//                   </p>
//                   <p className="text-xs text-muted-foreground mt-1">
//                     Applied{" "}
//                     {app.applied_at
//                       ? new Date(app.applied_at).toDateString()
//                       : ""}
//                   </p>
//                 </div>
//                 <div className="flex items-center space-x-3">
//                   <Badge
//                     variant="secondary"
//                     className={
//                       statusColors[String(app.application_status || app.status || "pending").toLowerCase()] ||
//                       "bg-gray-100 text-gray-800 border-gray-200"
//                     }
//                   >
//                     {app.application_status || app.status || "Pending"}
//                   </Badge>
//                   <Button variant="outline" size="sm" onClick={() => handleView(app)}>
//                     View
//                   </Button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const applications = [
  { id: "1", title: "Backend Developer", company: "CodeCraft Solutions", status: "Reviewed", daysAgo: 2 },
  { id: "2", title: "UI/UX Designer", company: "Design Hub", status: "Applied", daysAgo: 5 },
  { id: "3", title: "Software Engineer I", company: "TechCorp", status: "Interview", daysAgo: 7 },
];

const statusColors = {
  "Reviewed": "bg-blue-100 text-blue-800 border-blue-200",
  "Applied": "bg-orange-100 text-orange-800 border-orange-200",
  "Interview": "bg-green-100 text-green-800 border-green-200"
};

export default function ApplicationHistory() {
  const navigate = useNavigate();

  const handleView = (app) => {
    // Navigate to job details; replace with application detail route when available
    navigate(`/jobs/${app.id}`);
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent transition-colors">
              <div>
                <h4 className="font-medium">{app.title}</h4>
                <p className="text-sm text-muted-foreground">{app.company}</p>
                <p className="text-xs text-muted-foreground mt-1">Applied {app.daysAgo} days ago</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge variant="secondary" className={statusColors[app.status]}>
                  {app.status}
                </Badge>
                <Button variant="outline" size="sm" onClick={() => handleView(app)}>
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
