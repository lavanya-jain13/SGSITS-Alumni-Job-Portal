import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Award,
  Code,
  Briefcase,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";
import { downloadResumeFile } from "@/lib/downloadResume";

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

const extractSkillName = (skill) => {
  if (!skill) return "";
  if (typeof skill === "string") {
    const trimmed = skill.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object") {
          return parsed.name || parsed.skill || parsed.title || "";
        }
      } catch (_err) {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (typeof skill === "object") {
    return skill.name || skill.skill || skill.title || "";
  }
  return String(skill).trim();
};

const splitSkills = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(extractSkillName).filter(Boolean);

  // Try JSON array first (common when stored as text)
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(extractSkillName).filter(Boolean);
    }
    if (parsed && typeof parsed === "object") {
      const named = extractSkillName(parsed);
      return named ? [named] : [];
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
  const req = Array.from(new Set(requiredSkills.map(normalizeSkill).filter(Boolean)));
  const stud = Array.from(new Set(studentSkills.map(normalizeSkill).filter(Boolean)));
  if (!req.length) return null;
  const studentSet = new Set(stud);
  const hits = req.filter((r) => studentSet.has(r)).length;
  return Math.round((hits / req.length) * 100);
};

const uniqueSkills = (skills = []) => {
  const seen = new Set();
  return skills.filter((skill) => {
    const key = normalizeSkill(skill);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const splitAchievements = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map((s) => String(s).trim());
  return String(value)
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean);
};

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
};

const normalizeProfileSkills = (skills) => {
  if (!skills) return [];
  if (Array.isArray(skills)) {
    return skills
      .map((s) => {
        if (typeof s === "string") return { name: s };
        if (s && typeof s === "object") {
          return {
            name: s.name || s.skill || s.title,
            proficiency: s.proficiency,
            experience: s.experience,
          };
        }
        return null;
      })
      .filter((s) => s?.name);
  }

  return String(skills)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((name) => ({ name }));
};

export function ApplicantDetails() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const applicant = state?.applicant;
  const { toast } = useToast();

  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const applicationId = applicant?.applicationId || applicant?.application_id || applicant?.id;

  useEffect(() => {
    if (!applicationId) return;
    let isActive = true;

    setProfileLoading(true);
    setProfileError("");

    apiClient
      .getJobApplicantProfile(applicationId)
      .then((res) => {
        if (!isActive) return;
        setProfile(res?.profile || null);
      })
      .catch((err) => {
        if (!isActive) return;
        setProfileError(err?.message || "Failed to load student profile.");
      })
      .finally(() => {
        if (!isActive) return;
        setProfileLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [applicationId]);

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

  const studentSkills = uniqueSkills(splitSkills(applicant.skills || applicant.student_skills));
  const jobSkills = uniqueSkills(splitSkills(applicant.job_skills));
  const precomputedMatch =
    Number.isFinite(applicant.match) && applicant.match !== null
      ? applicant.match
      : Number.isFinite(applicant.skillMatch) && applicant.skillMatch !== null
      ? applicant.skillMatch
      : null;
  const computedMatch =
    precomputedMatch !== null ? Math.round(precomputedMatch) : computeMatch(studentSkills, jobSkills);
  const skillMatch = computedMatch === null ? 0 : computedMatch;

  const appliedDate = applicant.applied_at || applicant.appliedDate || applicant.applicationTime || null;

  const skills = studentSkills;
  const status = applicant.status || applicant.application_status || "pending";

  const resumeUrl =
    applicant.resume_url ||
    applicant.profile_resume_url ||
    profile?.resume_url ||
    applicant.resume ||
    applicant.resumeUrl ||
    "";

  const displayName = profile?.name || applicant.name || "Applicant";
  const branch =
    profile?.branch || applicant.student_branch || applicant.branch || "Branch not provided";
  const gradYear =
    profile?.grad_year ||
    applicant.student_grad_year ||
    applicant.grad_year ||
    applicant.class ||
    "Year N/A";

  const phone =
    profile?.phone_number ||
    profile?.phone ||
    applicant.student_phone ||
    applicant.phone ||
    "Not provided";

  const email = profile?.email || applicant.user_email || applicant.email || "Not provided";
  const location = profile?.address || applicant.location || "Not provided";

  const profileSkills = useMemo(() => normalizeProfileSkills(profile?.skills), [profile]);

  const desiredRoles = useMemo(
    () => normalizeList(profile?.desired_roles || profile?.desiredRoles),
    [profile]
  );

  const preferredLocations = useMemo(
    () => normalizeList(profile?.preferred_locations || profile?.preferredLocations),
    [profile]
  );

  const achievements = useMemo(() => {
    if (profile?.achievements) return splitAchievements(profile.achievements);
    return splitAchievements(applicant.achievements || "");
  }, [profile, applicant]);

  const summary = profile?.proficiency || "";
  const experiences = Array.isArray(profile?.experiences) ? profile.experiences : [];

  const dob = profile?.dob ? new Date(profile.dob).toLocaleDateString() : "Not provided";
  const studentId = profile?.student_id || "Not provided";
  const currentYear = profile?.current_year || "Not provided";
  const cgpa = profile?.cgpa ?? "Not provided";
  const yearsOfExperience = profile?.years_of_experience ?? "Not provided";
  const address = profile?.address || "Not provided";
  const workMode = profile?.work_mode || "Not provided";

  const handleDownloadResume = async () => {
    if (!resumeUrl) {
      toast({
        title: "Resume not available",
        description: "This applicant did not upload a resume.",
        variant: "destructive",
      });
      return;
    }

    downloadResumeFile({
      url: resumeUrl,
      applicantName: displayName,
      fileLabel: `${displayName}-Resume`,
      toast,
    }).catch(() => {
      // toast already handled in helper fallback
    });
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
                {(displayName || "?")
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{displayName}</h1>
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
                  <span>{location}</span>
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

      {/* Full Student Profile */}
      {profileLoading ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Loading full student profile...</p>
          </CardContent>
        </Card>
      ) : profileError ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive">{profileError}</p>
          </CardContent>
        </Card>
      ) : profile ? (
        <>
          {summary ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Profile Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{summary}</p>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Student Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Student ID</p>
                <p>{studentId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Date of Birth</p>
                <p>{dob}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Current Year</p>
                <p>{currentYear}</p>
              </div>
              <div>
                <p className="text-muted-foreground">CGPA</p>
                <p>{cgpa}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Years of Experience</p>
                <p>{yearsOfExperience}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Address</p>
                <p>{address}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Skills & Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Skills</p>
                {profileSkills.length ? (
                  <div className="flex flex-wrap gap-2">
                    {profileSkills.map((skill) => (
                      <Badge key={skill.name} variant="secondary" className="text-xs">
                        {skill.name}
                        {Number.isFinite(skill.proficiency) ? ` • P${skill.proficiency}` : ""}
                        {Number.isFinite(skill.experience) ? ` • E${skill.experience}y` : ""}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No skills provided.</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Desired Roles</p>
                  {desiredRoles.length ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {desiredRoles.map((role) => (
                        <Badge key={role} variant="outline" className="text-xs">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not provided</p>
                  )}
                </div>

                <div>
                  <p className="text-muted-foreground">Preferred Locations</p>
                  {preferredLocations.length ? (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {preferredLocations.map((loc) => (
                        <Badge key={loc} variant="outline" className="text-xs">
                          {loc}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not provided</p>
                  )}
                </div>

                <div>
                  <p className="text-muted-foreground">Work Mode</p>
                  <p>{workMode}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              {experiences.length ? (
                <div className="space-y-4">
                  {experiences.map((exp) => (
                    <div key={exp.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{exp.position}</div>
                        <div className="text-xs text-muted-foreground">
                          {exp.duration || "Duration not provided"}
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">{exp.company}</div>
                      {exp.description && <p className="text-sm mt-2">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No experience listed.</p>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}

      {/* Achievements only (projects/certifications removed as requested) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length ? (
            <ul className="space-y-2">
              {achievements.map((achievement, index) => (
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
