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
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";

const statusColors = {
  reviewed: "bg-[#e0e7ff] text-[#4338ca]", // Blue
  applied: "bg-[#ffedd5] text-[#c05621]",    // Orange
  interview: "bg-[#ccfbf1] text-[#047857]",  // Mint Green
  accepted: "bg-[#dcfce7] text-[#16a34a]",   // Green
  rejected: "bg-[#fee2e2] text-[#ef4444]",   // Red
  pending: "bg-[#f3f4f6] text-[#6b7280]",    // Gray
};

export default function ApplicationHistory({ compact = false }) {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadApplications = async () => {
      setLoading(true);
      try {
        const res = await apiClient.getAppliedJobs();
        if (!mounted) return;
        setApplications(res?.applications || []);
      } catch (err) {
        console.error("Failed to load applications", err);
        if (mounted) setApplications([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadApplications();
    return () => {
      mounted = false;
    };
  }, []);

  const handleView = (app) => {
    const jobId = app.job_id || app.jobId || app.id;
    if (jobId) navigate(`/jobs/${jobId}`);
  };

  const displayApplications = compact ? applications.slice(0, 4) : applications; // Show only 4 in compact mode

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-sm text-slate-500">Loading applications...</p>
      ) : displayApplications.length === 0 ? (
        <p className="text-sm text-slate-500">No applications yet.</p>
      ) : (
        displayApplications.map((app) => (
          <div
            key={app.application_id || app.id}
            className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 text-lg">
                📄
              </div>
              <div>
                <h4 className="font-medium text-sm text-slate-900">
                  {app.job_title || "Job Title"}
                </h4>
                <p className="text-xs text-slate-600">
                  {app.company_name || app.company || "Company"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Applied{" "}
                  {app.applied_at
                    ? new Date(app.applied_at).toDateString()
                    : ""}
                </p>
              </div>
            </div>
            <Badge
              className={`text-[10px] font-semibold px-3 py-1 rounded-full ${
                statusColors[
                  String(
                    app.application_status || app.status || "pending"
                  ).toLowerCase()
                ] || statusColors.pending
              }`}
            >
              {String(app.application_status || app.status || "Pending")
                .charAt(0)
                .toUpperCase() +
                String(app.application_status || app.status || "Pending").slice(
                  1,
                )}
            </Badge>
          </div>
        ))
      )}
    </div>
  );
}
