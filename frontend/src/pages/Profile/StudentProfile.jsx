import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ProfileCompletionMeter from "@/components/profile/ProfileCompletionMeter";
import ProfileEditor from "@/components/profile/ProfileEditor";
import { API_BASE_URL } from "@/constants";
import {
  User,
  ArrowLeft,
  GraduationCap,
  Code,
  Briefcase,
  FileText,
  Settings,
  Upload,
  Plus,
  X,
  Star,
} from "lucide-react";
import { downloadResumeFile } from "@/lib/downloadResume";

// Helper: get current user id from localStorage
const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.id || null;
  } catch {
    return null;
  }
};

const StudentProfile = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [tempResumeUrl, setTempResumeUrl] = useState(null);

  const currentUserId = getCurrentUserId();
  // Per-user key so one user's extras don't leak into another
  const extrasKey = currentUserId
    ? `student_profile_extras_${currentUserId}`
    : "student_profile_extras";

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    currentYear: "",
    student_id: "",
    branch: "",
    grad_year: "",
    cgpa: "",
    achievements: "",
    summary: "",
    skills: [],
    experiences: [],
    resumeUploaded: false,
    resumeFileName: "",
    resumeUrl: "",
    resumeFile: null,
    desiredRoles: [],
    preferredLocations: [],
    workMode: "hybrid",
    dataConsent: false,
    codeOfConduct: false,
    contactPermissions: false,
    // extra fields mapped to DB
    address: "",
    profileVisibility: false,
  });

  const [desiredRolesInput, setDesiredRolesInput] = useState("");
  const [preferredLocationsInput, setPreferredLocationsInput] = useState("");
  useEffect(
    () => () => {
      if (tempResumeUrl) {
        URL.revokeObjectURL(tempResumeUrl);
      }
    },
    [tempResumeUrl],
  );
  const viewResumeEnabled =
    profileData.resumeUploaded &&
    (profileData.resumeUrl || profileData.resumeFile);

  const handleViewResume = () => {
    if (!viewResumeEnabled) {
      toast({
        title: "No resume available",
        description: "Upload your resume first to preview it.",
        variant: "destructive",
      });
      return;
    }

    if (profileData.resumeFile) {
      const blobUrl = URL.createObjectURL(profileData.resumeFile);
      setTempResumeUrl(blobUrl);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = profileData.resumeFile.name || "resume.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }

    downloadResumeFile({
      url: profileData.resumeUrl,
      applicantName: profileData.name || "",
      fileLabel: profileData.resumeFileName || "resume",
      toast,
    }).catch(() => {
      // toast handled inside helper on failure; also guard here
      toast({
        title: "Download failed",
        description: "Could not download the resume. Please try again.",
        variant: "destructive",
      });
    });
  };

  useEffect(() => {
    const loadExtras = () => {
      try {
        const raw = localStorage.getItem(extrasKey);
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    };

    const loadProfile = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          toast({
            title: "Please log in",
            description: "You need to sign in to view or edit your profile.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        const { apiFetch } = await import("@/lib/api");
        const res = await apiFetch("/student/profile");
        const profile = res?.profile;
        const extras = loadExtras();

        if (!profile) {
          // no profile yet → just use extras (if any)
          setProfileData((prev) => ({
            ...prev,
            desiredRoles: extras.desiredRoles || [],
            preferredLocations: extras.preferredLocations || [],
            workMode: extras.workMode || "hybrid",
            summary: extras.summary || "",
            achievements: extras.achievements || "",
            cgpa: extras.cgpa || "",
            phone: extras.phone || "",
            dateOfBirth: extras.dateOfBirth || "",
            dataConsent: extras.dataConsent || false,
            codeOfConduct: extras.codeOfConduct || false,
            contactPermissions: extras.contactPermissions || false,
            address: extras.address || "",
            profileVisibility: extras.profileVisibility || false,
          }));
          setDesiredRolesInput((extras.desiredRoles || []).join(", "));
          setPreferredLocationsInput(
            (extras.preferredLocations || []).join(", "),
          );
          return;
        }

        const desiredRolesArr = Array.isArray(profile.desired_roles)
          ? profile.desired_roles
          : (profile.desired_roles || "")
              .split(",")
              .map((r) => r.trim())
              .filter(Boolean);

        const preferredLocationsArr = Array.isArray(profile.preferred_locations)
          ? profile.preferred_locations
          : (profile.preferred_locations || "")
              .split(",")
              .map((l) => l.trim())
              .filter(Boolean);

        const skillList = Array.isArray(profile.skills)
          ? profile.skills
          : (profile.skills || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

        const normalizedSkills = (skillList || [])
          .map((s) => {
            if (typeof s === "string") {
              return { name: s, proficiency: 3, experience: 1 };
            }
            if (s && typeof s === "object") {
              return {
                name: s.name || "",
                proficiency:
                  Number.isFinite(Number(s.proficiency)) &&
                  Number(s.proficiency) > 0
                    ? Number(s.proficiency)
                    : 3,
                experience:
                  Number.isFinite(Number(s.experience)) &&
                  Number(s.experience) >= 0
                    ? Number(s.experience)
                    : 1,
              };
            }
            return null;
          })
          .filter(Boolean);

        const experienceList = Array.isArray(profile.experiences)
          ? profile.experiences.map((exp) => ({
              title: exp.title || exp.position || "",
              company: exp.company || "",
              duration: exp.duration || "",
              description: exp.description || "",
              link: exp.link || "",
            }))
          : [];

        setProfileData((prev) => ({
          ...prev,
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone_number || extras.phone || "",
          // ensure date string fits <input type="date">
          dateOfBirth: profile.dob
            ? String(profile.dob).split("T")[0]
            : extras.dateOfBirth || "",
          currentYear: profile.current_year || extras.currentYear || "",
          student_id: profile.student_id || "",
          branch: profile.branch || "",
          // keep Select value as string
          grad_year:
            profile.grad_year !== undefined && profile.grad_year !== null
              ? String(profile.grad_year)
              : extras.grad_year || "",
          cgpa: profile.cgpa ?? extras.cgpa ?? "",
          achievements: profile.achievements ?? extras.achievements ?? "",
          // backend uses "proficiency" column for summary
          summary: profile.proficiency ?? extras.summary ?? "",
          skills: normalizedSkills,
          experiences: experienceList,
          resumeUrl: profile.resume_url || "",
          resumeUploaded: !!profile.resume_url,
          resumeFileName: profile.resume_url ? "Uploaded Resume" : "",
          resumeFile: null,
          // prefer DB values, fallback to extras
          desiredRoles: desiredRolesArr || extras.desiredRoles || [],
          preferredLocations:
            preferredLocationsArr || extras.preferredLocations || [],
          workMode: profile.work_mode || extras.workMode || "hybrid",
          dataConsent:
            typeof profile.consent_data_sharing === "boolean"
              ? profile.consent_data_sharing
              : extras.dataConsent || false,
          contactPermissions:
            typeof profile.consent_marketing === "boolean"
              ? profile.consent_marketing
              : extras.contactPermissions || false,
          profileVisibility:
            typeof profile.consent_profile_visibility === "boolean"
              ? profile.consent_profile_visibility
              : extras.profileVisibility || false,
          codeOfConduct:
            typeof profile.consent_terms === "boolean"
              ? profile.consent_terms
              : extras.codeOfConduct || false,
          address: profile.address || extras.address || "",
        }));

        setDesiredRolesInput((desiredRolesArr || []).join(", "));
        setPreferredLocationsInput((preferredLocationsArr || []).join(", "));
      } catch (err) {
        console.error("Failed to load profile", err);
        // If the session is invalid/expired, clear and force re-login
        if (err?.status === 401) {
          localStorage.removeItem("user");
          toast({
            title: "Session expired",
            description: "Please log in again to continue.",
            variant: "destructive",
          });
          navigate("/login");
        }
      }
    };

    // reset state when user changes (extrasKey depends on current user)
    setProfileData((prev) => ({
      ...prev,
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      currentYear: "",
      student_id: "",
      branch: "",
      grad_year: "",
      cgpa: "",
      achievements: "",
      summary: "",
      skills: [],
      experiences: [],
      resumeUploaded: false,
      resumeFileName: "",
      resumeUrl: "",
      resumeFile: null,
      desiredRoles: [],
      preferredLocations: [],
      workMode: "hybrid",
      dataConsent: false,
      codeOfConduct: false,
      contactPermissions: false,
      address: "",
      profileVisibility: false,
    }));
    setDesiredRolesInput("");
    setPreferredLocationsInput("");

    loadProfile();
  }, [extrasKey, navigate, toast]);

  // ----- Profile completion sections (same logic as before) -----
  const profileSections = [
    {
      id: "personal",
      title: "Personal Information",
      description: "Add your basic details like name and contact info",
      completed: !!(profileData.name && profileData.student_id),
      weight: 20,
    },
    {
      id: "academic",
      title: "Academic Details",
      description: "Enter your branch and graduation year",
      completed: !!(profileData.branch && profileData.grad_year),
      weight: 20,
    },
    {
      id: "skills",
      title: "Skills & Expertise",
      description: "List your technical skills",
      completed: (profileData.skills || []).length >= 1,
      weight: 20,
    },
    {
      id: "experience",
      title: "Experience",
      description: "Add your work experience or projects",
      completed: (profileData.experiences || []).length >= 1,
      weight: 20,
    },
    {
      id: "resume",
      title: "Resume/CV",
      description: "Upload your resume to apply for jobs",
      completed: profileData.resumeUploaded,
      weight: 10,
    },
    {
      id: "preferences",
      title: "Job Preferences",
      description: "Set your preferred roles and locations",
      completed: (profileData.desiredRoles || []).length > 0,
      weight: 10,
    },
  ];

  const completionPercentage = profileSections.reduce(
    (total, section) => total + (section.completed ? section.weight : 0),
    0,
  );

  const branches = [
    "Computer Science Engineering",
    "Electronics & Communication Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Electrical Engineering",
    "Information Technology",
  ];

  const graduationYears = (() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, i) => String(currentYear + i));
  })();

  const skillOptions = [
    "React",
    "Angular",
    "Vue.js",
    "Node.js",
    "Python",
    "Java",
    "JavaScript",
    "TypeScript",
    "C++",
    "C#",
    "PHP",
    "Ruby",
    "Go",
    "Rust",
    "Swift",
    "Kotlin",
    "Flutter",
    "React Native",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "Redis",
    "Docker",
    "Kubernetes",
    "AWS",
    "Azure",
    "GCP",
  ];

  const handleSave = async (updatedData = profileData) => {
    setIsLoading(true);
    try {
      const { apiFetch } = await import("@/lib/api");

      // Merge with existing state so arrays are never lost
      const resolvedDesiredRoles =
        updatedData?.preferences?.desiredRoles ??
        updatedData?.desiredRoles ??
        profileData.desiredRoles ??
        [];
      const resolvedPreferredLocations =
        updatedData?.preferences?.preferredLocations ??
        updatedData?.preferredLocations ??
        profileData.preferredLocations ??
        [];
      const resolvedWorkMode =
        updatedData?.preferences?.workMode ??
        updatedData?.workMode ??
        profileData.workMode ??
        "";
      const resolvedAddress =
        updatedData?.address ?? profileData.address ?? "";

      const mergedData = {
        ...profileData,
        ...updatedData,
        skills: updatedData.skills ?? profileData.skills ?? [],
        experiences: updatedData.experiences ?? profileData.experiences ?? [],
        desiredRoles: resolvedDesiredRoles,
        preferredLocations: resolvedPreferredLocations,
        workMode: resolvedWorkMode,
        address: resolvedAddress,
      };

      // accept the latest edits from the modal instead of stale state
      setProfileData(mergedData);

      const cleanedExperiences = (mergedData.experiences || [])
        .map((exp) => ({
          position: exp.title || exp.position || "",
          company: exp.company || "",
          duration: exp.duration || "",
          description: exp.description || "",
          link: exp.link || "",
        }))
        .filter(
          (exp) =>
            exp.position ||
            exp.company ||
            exp.duration ||
            exp.description ||
            exp.link,
        );

      const basePayload = {
        name: mergedData.name,
        studentId: mergedData.student_id,
        branch: mergedData.branch,
        gradYear: parseInt(mergedData.grad_year) || undefined,
        phone: mergedData.phone || "",
        dateOfBirth: mergedData.dateOfBirth || "",
        currentYear: mergedData.currentYear || "",
        cgpa: mergedData.cgpa || "",
        achievements: mergedData.achievements || "",
        summary: mergedData.summary || "",
        yearsOfExperience: cleanedExperiences.length || 0,
        skills: (mergedData.skills || [])
          .map((s) => {
            if (!s) return null;
            if (typeof s === "string") {
              return { name: s, proficiency: 3, experience: 1 };
            }
            const proficiency = Number(s.proficiency);
            const experience = Number(s.experience);
            return {
              name: s.name,
              proficiency:
                Number.isFinite(proficiency) && proficiency > 0
                  ? proficiency
                  : 3,
              experience:
                Number.isFinite(experience) && experience >= 0 ? experience : 0,
            };
          })
          .filter((s) => s && s.name),
        resumeUrl: mergedData.resumeUrl || "",
        experiences: cleanedExperiences,

        // extra fields → backend
        address: mergedData.address || "",
        desiredRoles: mergedData.desiredRoles || [],
        preferredLocations: mergedData.preferredLocations || [],
        workMode: mergedData.workMode || "",
        dataConsent: mergedData.dataConsent || false,
        contactPermissions: mergedData.contactPermissions || false,
        profileVisibility: mergedData.profileVisibility || false,
        codeOfConduct: mergedData.codeOfConduct || false,
      };

      // remove empty/undefined values so validation passes
      Object.keys(basePayload).forEach((key) => {
        const val = basePayload[key];
        const isEmptyArray = Array.isArray(val) && val.length === 0;
        const isEmptyString = val === "";
        const isUndefined = val === undefined || val === null;
        if (
          isEmptyString ||
          isUndefined ||
          (key !== "skills" && isEmptyArray)
        ) {
          delete basePayload[key];
        }
      });

      if (!basePayload.resumeUrl) delete basePayload.resumeUrl;

      let res;
      if (mergedData.resumeFile) {
        const formData = new FormData();
        Object.entries(basePayload).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        });
        formData.append("resume", mergedData.resumeFile);

        res = await fetch(`${API_BASE_URL}/student/profile`, {
          method: "PUT",
          credentials: "include",
          body: formData,
        }).then(async (r) => {
          const text = await r.text();
          let parsed = null;
          try {
            parsed = text ? JSON.parse(text) : null;
          } catch (err) {
            parsed = null;
          }
          if (!r.ok) {
            const err = new Error(
              parsed?.error || parsed?.message || r.statusText,
            );
            err.status = r.status;
            throw err;
          }
          return parsed;
        });
      } else {
        res = await apiFetch("/student/profile", {
          method: "PUT",
          body: JSON.stringify(basePayload),
        });
      }

      // Persist extra client-only fields locally so they survive refresh
      const extras = {
        desiredRoles: mergedData.desiredRoles || [],
        preferredLocations: mergedData.preferredLocations || [],
        workMode: mergedData.workMode || "hybrid",
        summary: mergedData.summary || "",
        achievements: mergedData.achievements || "",
        cgpa: mergedData.cgpa || "",
        phone: mergedData.phone || "",
        dateOfBirth: mergedData.dateOfBirth || "",
        dataConsent: mergedData.dataConsent || false,
        codeOfConduct: mergedData.codeOfConduct || false,
        contactPermissions: mergedData.contactPermissions || false,
        address: mergedData.address || "",
        profileVisibility: mergedData.profileVisibility || false,
      };
      localStorage.setItem(extrasKey, JSON.stringify(extras));

      toast({
        title: "Profile updated!",
        description: "Your profile has been saved successfully.",
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to save profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSkill = (skillName) => {
    if (!(profileData.skills || []).find((s) => s.name === skillName)) {
      setProfileData((prev) => ({
        ...prev,
        skills: [
          ...(prev.skills || []),
          { name: skillName, proficiency: 3, experience: 1 },
        ],
      }));
    }
  };

  const removeSkill = (skillName) => {
    setProfileData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s.name !== skillName),
    }));
  };

  const updateSkill = (skillName, field, value) => {
    setProfileData((prev) => ({
      ...prev,
      skills: (prev.skills || []).map((s) =>
        s.name === skillName ? { ...s, [field]: value } : s,
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Completion Sidebar */}
          <div className="lg:col-span-1">
            <ProfileCompletionMeter
              sections={profileSections}
              completionPercentage={completionPercentage}
            />
          </div>

          {/* Main Form */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="personal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger
                  value="personal"
                  className="flex items-center gap-1"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Personal</span>
                </TabsTrigger>
                <TabsTrigger
                  value="academic"
                  className="flex items-center gap-1"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span className="hidden sm:inline">Academic</span>
                </TabsTrigger>
                <TabsTrigger value="skills" className="flex items-center gap-1">
                  <Code className="w-4 h-4" />
                  <span className="hidden sm:inline">Skills</span>
                </TabsTrigger>
                <TabsTrigger
                  value="experience"
                  className="flex items-center gap-1"
                >
                  <Briefcase className="w-4 h-4" />
                  <span className="hidden sm:inline">Experience</span>
                </TabsTrigger>
                <TabsTrigger value="resume" className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Resume</span>
                </TabsTrigger>
                <TabsTrigger
                  value="preferences"
                  className="flex items-center gap-1"
                >
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Preferences</span>
                </TabsTrigger>
              </TabsList>

              {/* Personal */}
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" /> Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Institute Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => {
                            const value = e.target.value;

                            // block empty
                            if (!value) return;

                            // split after @ and validate domain
                            const parts = value.split("@");
                            if (
                              parts.length === 2 &&
                              parts[1] === "sgsits.ac.in"
                            ) {
                              setProfileData((prev) => ({
                                ...prev,
                                email: value,
                              }));
                            }
                          }}
                          placeholder="Enter your institute email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              phone: e.target.value,
                            }))
                          }
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input
                          id="dob"
                          type="date"
                          value={profileData.dateOfBirth}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              dateOfBirth: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Academic */}
              <TabsContent value="academic">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" /> Academic Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Select
                          value={profileData.branch}
                          onValueChange={(value) =>
                            setProfileData((prev) => ({
                              ...prev,
                              branch: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                          </SelectTrigger>
                          <SelectContent>
                            {branches.map((branch) => (
                              <SelectItem key={branch} value={branch}>
                                {branch}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <Input
                          id="studentId"
                          value={profileData.student_id}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              student_id: e.target.value,
                            }))
                          }
                          placeholder="Enter your student ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">Current Year</Label>
                        <Select
                          value={profileData.currentYear}
                          onValueChange={(value) =>
                            setProfileData((prev) => ({
                              ...prev,
                              currentYear: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="First Year">
                              First Year
                            </SelectItem>
                            <SelectItem value="Second Year">
                              Second Year
                            </SelectItem>
                            <SelectItem value="Third Year">
                              Third Year
                            </SelectItem>
                            <SelectItem value="Final Year">
                              Final Year
                            </SelectItem>
                            <SelectItem value="Recent Graduate">
                              Recent Graduate
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gradYear">Graduation Year</Label>
                        <Select
                          value={profileData.grad_year}
                          onValueChange={(value) =>
                            setProfileData((prev) => ({
                              ...prev,
                              grad_year: value,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select graduation year" />
                          </SelectTrigger>
                          <SelectContent>
                            {graduationYears.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>CGPA</Label>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          max="10"
                          value={profileData.cgpa}
                          onChange={(e) =>
                            setProfileData((prev) => ({
                              ...prev,
                              cgpa: e.target.value,
                            }))
                          }
                          placeholder="Enter CGPA"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Achievements</Label>
                      <Textarea
                        value={profileData.achievements}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            achievements: e.target.value,
                          }))
                        }
                        placeholder="Awards, recognitions, certifications..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Skills */}
              <TabsContent value="skills">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="w-5 h-5" /> Skills & Expertise
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Add Skills</Label>
                      <Select onValueChange={addSkill}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a skill to add" />
                        </SelectTrigger>
                        <SelectContent>
                          {skillOptions
                            .filter(
                              (skill) =>
                                !(profileData.skills || []).find(
                                  (s) => s.name === skill,
                                ),
                            )
                            .map((skill) => (
                              <SelectItem key={skill} value={skill}>
                                {skill}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      {(profileData.skills || []).map((skill) => (
                        <div
                          key={skill.name}
                          className="p-4 border rounded-lg space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <Badge variant="outline">{skill.name}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSkill(skill.name)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Proficiency (1-5)</Label>
                              <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((level) => (
                                  <Button
                                    key={level}
                                    variant={
                                      skill.proficiency >= level
                                        ? "default"
                                        : "outline"
                                    }
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={() =>
                                      updateSkill(
                                        skill.name,
                                        "proficiency",
                                        level,
                                      )
                                    }
                                  >
                                    <Star className="w-4 h-4" />
                                  </Button>
                                ))}
                                <span className="text-sm text-muted-foreground ml-2">
                                  {skill.proficiency}/5
                                </span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label>Years of Experience</Label>
                              <Input
                                type="number"
                                step="0.5"
                                min="0"
                                value={skill.experience}
                                onChange={(e) =>
                                  updateSkill(
                                    skill.name,
                                    "experience",
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                placeholder="1.5"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Experience */}
              <TabsContent value="experience">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="w-5 h-5" /> Experience & Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(profileData.experiences || []).map((exp, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Position/Role</Label>
                            <Input
                              value={exp.title}
                              onChange={(e) => {
                                const newExp = [
                                  ...(profileData.experiences || []),
                                ];
                                newExp[index].title = e.target.value;
                                setProfileData((prev) => ({
                                  ...prev,
                                  experiences: newExp,
                                }));
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Company</Label>
                            <Input
                              value={exp.company}
                              onChange={(e) => {
                                const newExp = [
                                  ...(profileData.experiences || []),
                                ];
                                newExp[index].company = e.target.value;
                                setProfileData((prev) => ({
                                  ...prev,
                                  experiences: newExp,
                                }));
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Duration</Label>
                            <Input
                              value={exp.duration}
                              onChange={(e) => {
                                const newExp = [
                                  ...(profileData.experiences || []),
                                ];
                                newExp[index].duration = e.target.value;
                                setProfileData((prev) => ({
                                  ...prev,
                                  experiences: newExp,
                                }));
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Link</Label>
                            <Input
                              value={exp.link}
                              onChange={(e) => {
                                const newExp = [
                                  ...(profileData.experiences || []),
                                ];
                                newExp[index].link = e.target.value;
                                setProfileData((prev) => ({
                                  ...prev,
                                  experiences: newExp,
                                }));
                              }}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea
                            value={exp.description}
                            onChange={(e) => {
                              const newExp = [
                                ...(profileData.experiences || []),
                              ];
                              newExp[index].description = e.target.value;
                              setProfileData((prev) => ({
                                ...prev,
                                experiences: newExp,
                              }));
                            }}
                            rows={3}
                          />
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setProfileData((prev) => ({
                          ...prev,
                          experiences: [
                            ...(prev.experiences || []),
                            {
                              title: "",
                              company: "",
                              duration: "",
                              link: "",
                              description: "",
                            },
                          ],
                        }));
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Experience
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Resume */}
              <TabsContent value="resume">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" /> Resume/CV
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                        <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium mb-2">Upload your resume</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          PDF, DOC, DOCX up to 5MB
                        </p>
                        <input
                          id="resume-file"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setProfileData((prev) => ({
                                ...prev,
                                resumeFile: file,
                                resumeUploaded: true,
                                resumeFileName: file.name,
                              }));
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() =>
                            document.getElementById("resume-file")?.click()
                          }
                        >
                          <Upload className="w-4 h-4 mr-2" /> Choose File
                        </Button>
                        {profileData.resumeFileName && (
                          <p className="mt-2 text-sm font-medium">
                            Selected: {profileData.resumeFileName}
                          </p>
                        )}
                      </div>

                      {(profileData.resumeUrl ||
                        profileData.resumeFileName) && (
                        <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-8 h-8 text-primary" />
                            <div>
                              <p className="font-medium">
                                {profileData.resumeFileName ||
                                  "Resume attached"}
                              </p>
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {profileData.resumeUrl
                                  ? "Resume uploaded"
                                  : "Will be uploaded on save"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleViewResume}
                              disabled={!viewResumeEnabled}
                            >
                              View Uploaded Resume
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (tempResumeUrl) {
                                  URL.revokeObjectURL(tempResumeUrl);
                                  setTempResumeUrl(null);
                                }
                                setProfileData((prev) => ({
                                  ...prev,
                                  resumeUploaded: false,
                                  resumeFileName: "",
                                  resumeUrl: "",
                                  resumeFile: null,
                                }));
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Preferences */}
              <TabsContent value="preferences">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" /> Job Preferences & Consent
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Desired Roles</Label>
                      <Input
                        placeholder="Enter roles separated by commas"
                        value={desiredRolesInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          setDesiredRolesInput(value);
                          setProfileData((prev) => ({
                            ...prev,
                            desiredRoles: value
                              .split(",")
                              .map((r) => r.trim())
                              .filter(Boolean),
                          }));
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Preferred Locations</Label>
                      <Input
                        placeholder="Enter locations separated by commas"
                        value={preferredLocationsInput}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPreferredLocationsInput(value);
                          setProfileData((prev) => ({
                            ...prev,
                            preferredLocations: value
                              .split(",")
                              .map((l) => l.trim())
                              .filter(Boolean),
                          }));
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Work Mode</Label>
                      <Select
                        value={profileData.workMode}
                        onValueChange={(value) =>
                          setProfileData((prev) => ({
                            ...prev,
                            workMode: value,
                          }))
                        }
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="onsite">On-site</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end mt-4">
              <Button
                variant="gradient"
                size="lg"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
