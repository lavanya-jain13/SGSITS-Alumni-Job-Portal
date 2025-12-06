import { ArrowLeft, Download, Mail, Phone, MapPin, Calendar, GraduationCap, Award, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

export function ApplicantDetails() {
  const navigate = useNavigate();

  // Mock data - in real app, this would come from route params or API
  const applicant = {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+91 9876543210",
    location: "Indore, Madhya Pradesh",
    degree: "Computer Science",
    class: "Final Year",
    branch: "Computer Science & Engineering",
    cgpa: "8.5",
    skills: ["React", "Node.js", "Python", "JavaScript", "TypeScript", "MongoDB"],
    skillMatch: 85,
    status: "Under Review",
    appliedDate: "2024-03-15",
    experience: "2 years",
    projects: [
      {
        title: "E-commerce Platform",
        description: "Built a full-stack e-commerce platform using MERN stack",
        technologies: ["React", "Node.js", "MongoDB", "Express"]
      },
      {
        title: "AI Chatbot",
        description: "Developed an AI-powered customer support chatbot",
        technologies: ["Python", "TensorFlow", "Flask"]
      }
    ],
    certifications: [
      "AWS Certified Developer",
      "Google Cloud Professional",
      "MongoDB Certified Developer"
    ],
    achievements: [
      "Winner of Smart India Hackathon 2023",
      "Published research paper on ML",
      "Lead Developer at College Tech Club"
    ]
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
        <Button className="gap-2">
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
                {applicant.name.split(" ").map(n => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-2xl font-bold">{applicant.name}</h1>
                <p className="text-muted-foreground">{applicant.degree} • {applicant.class}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{applicant.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{applicant.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{applicant.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Applied on {new Date(applicant.appliedDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">CGPA: {applicant.cgpa}</Badge>
                <Badge variant="secondary">{applicant.experience} Experience</Badge>
                <Badge 
                  variant={
                    applicant.status === "Shortlisted" ? "default" :
                    applicant.status === "Rejected" ? "destructive" :
                    "outline"
                  }
                >
                  {applicant.status}
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
              <span className="font-semibold">{applicant.skillMatch}%</span>
            </div>
            <Progress value={applicant.skillMatch} />
          </div>
          <div className="flex flex-wrap gap-2">
            {applicant.skills.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
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
            {applicant.projects.map((project, index) => (
              <div key={index} className="space-y-2 pb-4 border-b last:border-b-0 last:pb-0">
                <h3 className="font-semibold">{project.title}</h3>
                <p className="text-sm text-muted-foreground">{project.description}</p>
                <div className="flex flex-wrap gap-1">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
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
              <ul className="space-y-2">
                {applicant.certifications.map((cert, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-sm">{cert}</span>
                  </li>
                ))}
              </ul>
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
              <ul className="space-y-2">
                {applicant.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2" />
                    <span className="text-sm">{achievement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
