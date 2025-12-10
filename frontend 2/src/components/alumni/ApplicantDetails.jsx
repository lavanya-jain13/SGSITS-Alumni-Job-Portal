import { ArrowLeft, Download, Mail, Phone, MapPin, Calendar, GraduationCap, Award, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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

  const skillMatch = applicant.skillMatch ?? 0;
  const appliedDate = applicant.applied_at || applicant.appliedDate;
  const skills = applicant.skills || [];
  const status = applicant.status || applicant.application_status || "pending";
  const resumeUrl = applicant.resume_url;

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
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
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
                {(applicant.name || "?").split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{applicant.name}</h1>
                <p className="text-muted-foreground">
                  {applicant.branch || applicant.degree || "Branch not provided"} •{" "}
                  {applicant.class || "Year N/A"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{applicant.email || applicant.user_email || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{applicant.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{applicant.location || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Applied on{" "}
                    {appliedDate ? new Date(appliedDate).toLocaleDateString() : "N/A"}
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
                <span className="font-semibold">{skillMatch}%</span>
              </div>
              <Progress value={skillMatch} />
            </div>
            <div className="flex flex-wrap gap-2">
            {skills.length ? (
              skills.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">No skills provided.</span>
            )}
            </div>
          </CardContent>
        </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {applicant.projects && applicant.projects.length ? (
              applicant.projects.map((project, index) => (
                <div key={index} className="space-y-2 pb-4 border-b last:border-b-0 last:pb-0">
                  <h3 className="font-semibold">{project.title}</h3>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {(project.technologies || []).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No projects provided.</p>
            )}
          </CardContent>
        </Card>

        {/* Certifications & Achievements */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {applicant.certifications && applicant.certifications.length ? (
                <ul className="space-y-2">
                  {applicant.certifications.map((cert, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                      <span className="text-sm">{cert}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No certifications provided.</p>
              )}
            </CardContent>
          </Card>

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
      </div>
    </div>
  );
}
