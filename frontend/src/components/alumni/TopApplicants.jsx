// import { Eye, MessageSquare, Star } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";

// const applicants = [
//   {
//     id: 1,
//     name: "John Doe",
//     degree: "Computer Science",
//     skills: ["React", "Node.js"],
//     rating: 4.8,
//     cgpa: "8.5",
//   },
//   {
//     id: 2,
//     name: "Jane Smith",
//     degree: "Computer Science", 
//     skills: ["Python", "ML"],
//     rating: 4.6,
//     cgpa: "8.2",
//   },
//   {
//     id: 3,
//     name: "Bob Johnson",
//     degree: "Information Technology",
//     skills: ["JavaScript", "React"],
//     rating: 4.4,
//     cgpa: "7.9",
//   },
// ];

// export function TopApplicants() {
//   return (
//     <Card className="gradient-card shadow-glow">
//       <CardHeader className="flex flex-row items-center justify-between">
//         <CardTitle className="text-lg font-semibold">Top Applicants</CardTitle>
//         <select className="rounded-md border border-input bg-background px-3 py-1 text-sm">
//           <option>All Postings</option>
//           <option>Software Engineer</option>
//           <option>Data Analyst</option>
//         </select>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         {applicants.map((applicant) => (
//           <div
//             key={applicant.id}
//             className="flex items-center space-x-4 rounded-lg border border-border/50 p-4 transition-all hover:bg-accent/50"
//           >
//             <Avatar className="h-12 w-12">
//               <AvatarFallback className="bg-primary/10 text-primary font-semibold">
//                 {applicant.name.split(" ").map(n => n[0]).join("")}
//               </AvatarFallback>
//             </Avatar>
            
//             <div className="flex-1 space-y-1">
//               <div className="flex items-center justify-between">
//                 <h4 className="font-medium">{applicant.name}</h4>
//                 <div className="flex items-center space-x-1">
//                   <Star className="h-4 w-4 fill-warning text-warning" />
//                   <span className="text-sm font-medium">{applicant.rating}</span>
//                 </div>
//               </div>
//               <p className="text-sm text-muted-foreground">{applicant.degree}</p>
//               <div className="flex items-center space-x-2">
//                 <span className="text-xs text-muted-foreground">CGPA: {applicant.cgpa}</span>
//                 <div className="flex space-x-1">
//                   {applicant.skills.map((skill) => (
//                     <Badge key={skill} variant="secondary" className="text-xs">
//                       {skill}
//                     </Badge>
//                   ))}
//                 </div>
//               </div>
//             </div>
            
//             <div className="flex space-x-2">
//               <Button size="sm" variant="outline">
//                 <Eye className="h-4 w-4" />
//                 <span className="ml-1 hidden sm:inline">View</span>
//               </Button>
//               <Button size="sm" variant="outline">
//                 <MessageSquare className="h-4 w-4" />
//                 <span className="ml-1 hidden sm:inline">Contact</span>
//               </Button>
//             </div>
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//   );
// }

import { useEffect, useMemo, useState } from "react";
import { Eye, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/lib/api";

const splitSkills = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map((s) => String(s).trim());
  return String(value)
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const computeMatch = (studentSkills = [], requiredSkills = []) => {
  if (!requiredSkills.length) return 0;
  const studentSet = new Set(studentSkills.map((s) => s.toLowerCase()));
  const requiredSet = requiredSkills.map((s) => s.toLowerCase());
  const hits = requiredSet.filter((s) => studentSet.has(s)).length;
  return Math.round((hits / requiredSet.length) * 100);
};

export function TopApplicants() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [applicants, setApplicants] = useState([]);
  const [jobSkills, setJobSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await apiClient.getMyJobs();
        const jobList = data?.jobs || [];
        setJobs(jobList);
        if (jobList.length) {
          setSelectedJobId(jobList[0].id);
        }
      } catch (err) {
        setError(err?.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  useEffect(() => {
    const loadApplicants = async () => {
      if (!selectedJobId) return;
      setLoading(true);
      setError("");
      try {
        const [jobRes, appsRes] = await Promise.all([
          apiClient.getJobById(selectedJobId),
          apiClient.getJobApplicants(selectedJobId),
        ]);
        const requiredSkills = splitSkills(jobRes?.job?.skills_required);
        setJobSkills(requiredSkills);

        const normalized = (appsRes?.applicants || []).map((app) => {
          const skills = splitSkills(app.student_skills);
          return {
            id: app.application_id,
            name: app.student_name || app.user_email || "Unknown",
            degree: app.student_branch || "N/A",
            skills,
            match: computeMatch(skills, requiredSkills),
            applied_at: app.applied_at,
          };
        });
        setApplicants(normalized);
      } catch (err) {
        setError(err?.message || "Failed to load applicants");
      } finally {
        setLoading(false);
      }
    };

    loadApplicants();
  }, [selectedJobId]);

  const topApplicants = useMemo(() => {
    return [...applicants]
      .sort((a, b) => b.match - a.match)
      .slice(0, 5);
  }, [applicants]);

  return (
    <Card className="gradient-card shadow-glow">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="text-lg font-semibold">Top Applicants</CardTitle>
          <p className="text-xs text-muted-foreground">
            Based on skill match for the selected job
          </p>
        </div>
        <select
          className="rounded-md border border-input bg-background px-3 py-1 text-sm"
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
        >
          {jobs.length === 0 && <option value="">No jobs</option>}
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.job_title}
            </option>
          ))}
        </select>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading applicants…</div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : topApplicants.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No applicants yet for this job.
          </div>
        ) : (
          topApplicants.map((applicant) => (
            <div
              key={applicant.id}
              className="flex items-center space-x-4 rounded-lg border border-border/50 p-4 transition-all hover:bg-accent/50"
            >
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {applicant.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{applicant.name}</h4>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="text-sm font-medium">
                      {applicant.match}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {applicant.degree}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {applicant.skills.length ? (
                    applicant.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No skills listed</span>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    navigate("/alumni/applicant-details", {
                      state: { applicant: { ...applicant, job_id: selectedJobId } },
                    })
                  }
                >
                  <Eye className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">View</span>
                </Button>
              </div>
            </div>
          ))
        )}
        {jobSkills.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Required skills: {jobSkills.join(", ")}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
