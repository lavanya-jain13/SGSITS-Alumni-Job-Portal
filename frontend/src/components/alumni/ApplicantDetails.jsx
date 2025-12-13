import { ArrowLeft, Download, Mail, Phone, MapPin, Calendar, GraduationCap, Award, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const normalizeSkill = (s) => {
  if (!s) return "";
  const lowered = String(s).toLowerCase();
  if (lowered.includes("javascript") || lowered === "js") return "javascript";
  if (lowered.includes("react")) return "react";
  if (lowered.includes("vue")) return "vue";
  if (lowered.includes("node")) return "node";
  if (lowered.includes("python")) return "python";
  return lowered.replace(/[^a-z0-9+.#]/g, " ").replace(/\s+/g, " ").trim();
};

const splitSkills = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map((s) => String(s).trim());

  // Try JSON array first (common when stored as text)
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter(Boolean).map((s) => String(s).trim());
    }
  } catch (_err) {
    // fall back to delimiter split
  }

  const cleaned = String(value).replace(/[{}\[\]"']/g, ""); // strip stray brackets/quotes if present (PG arrays)
  const primarySplit = cleaned
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (primarySplit.length > 1) return primarySplit.map(normalizeSkill).filter(Boolean);

  // fallback: space-separated list
  return cleaned.split(/\s+/).map(normalizeSkill).filter(Boolean);
};

const computeMatch = (studentSkills = [], requiredSkills = []) => {
  const req = requiredSkills.map(normalizeSkill).filter(Boolean);
  const stud = studentSkills.map(normalizeSkill).filter(Boolean);
  if (!req.length) return null;
  const studentSet = new Set(stud);
  const hits = req.filter(
    (r) =>
      studentSet.has(r) ||
      Array.from(studentSet).some((s) => s.includes(r) || r.includes(s))
  ).length;
  return Math.round((hits / req.length) * 100);
};

export function ApplicantDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const applicant = state?.applicant;
  const { toast } = useToast();

  if (!applicant) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              No applicant data provided. Please open this page from Applications Overview.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const studentSkills = splitSkills(applicant.skills || applicant.student_skills);
  const jobSkills = splitSkills(applicant.job_skills);
  const computedMatch = computeMatch(studentSkills, jobSkills);
  const skillMatch =
    applicant.match ??
    applicant.skillMatch ??
    (computedMatch === null ? 0 : computedMatch);
  const appliedDate =
    applicant.applied_at || applicant.appliedDate || applicant.applicationTime || null;
  const skills = studentSkills;
  const status = applicant.status || applicant.application_status || "pending";
  const resumeUrl =
    applicant.resume_url || applicant.profile_resume_url || applicant.resume || applicant.resumeUrl || "";
  const branch = applicant.student_branch || applicant.branch || "Branch not provided";
  const gradYear = applicant.student_grad_year || applicant.grad_year || applicant.class || "Year N/A";
  const phone = applicant.student_phone || applicant.phone || "Not provided";
  const email = applicant.user_email || applicant.email || "Not provided";

  const handleDownloadResume = () => {
    if (!resumeUrl) {
      toast({
        title: "Resume not available",
        description: "This applicant did not upload a resume.",
        variant: "destructive",
      });
      return;
    }
    window.open(resumeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button className="gap-2" onClick={handleDownloadResume}>
          <Download className="h-4 w-4" />
          Download Resume
        </Button>
      </div>

      {/* Profile Overview Card */}
      <Card className="gradient-card shadow-glow">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                {(applicant.name || "?")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{applicant.name}</h1>
                <p className="text-muted-foreground">
                  {branch} • {gradYear}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{applicant.location || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Applied on {appliedDate ? new Date(appliedDate).toLocaleDateString() : "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {applicant.cgpa && <Badge variant="secondary">CGPA: {applicant.cgpa}</Badge>}
                {applicant.experience && (
                  <Badge variant="secondary">{applicant.experience} Experience</Badge>
                )}
                <Badge
                  variant={
                    status === "accepted"
                      ? "default"
                      : status === "rejected"
                      ? "destructive"
                      : status === "on_hold"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Match */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Skills Match
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Match Percentage</span>
              <span className="font-semibold">
                {computedMatch === null ? "N/A" : `${skillMatch}%`}
              </span>
            </div>
            <Progress value={computedMatch === null ? 0 : skillMatch} />
          </div>
          <div className="flex flex-wrap gap-2">
            {jobSkills.length > 0 && (
              <>
                <Badge variant="outline" className="text-xs">
                  Required:
                </Badge>
                {jobSkills.map((skill) => (
                  <Badge key={`req-${skill}`} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </>
            )}
            {skills.length ? (
              skills.map((skill) => (
                <Badge key={`stud-${skill}`} variant="secondary">
                  {skill}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No skills provided.</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Achievements only (projects/certifications removed as requested) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {applicant.achievements && applicant.achievements.length ? (
            <ul className="space-y-2">
              {applicant.achievements.map((achievement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                  <span className="text-sm">{achievement}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No achievements provided.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
