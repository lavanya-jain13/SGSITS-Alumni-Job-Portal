// Shared profile progress calculation used by profile page and dashboard.
export const buildProfileSections = (rawProfile = {}) => {
  const profile = {
    name: rawProfile.name || "",
    student_id: rawProfile.student_id || "",
    branch: rawProfile.branch || "",
    grad_year: rawProfile.grad_year || "",
    skills: rawProfile.skills || [],
    experiences: rawProfile.experiences || [],
    resumeUploaded: !!rawProfile.resumeUploaded,
    desiredRoles: rawProfile.desiredRoles || [],
  };

  return [
    {
      id: "personal",
      title: "Personal Information",
      description: "Add your basic details like name and contact info",
      completed: !!(profile.name && profile.student_id),
      weight: 20,
    },
    {
      id: "academic",
      title: "Academic Details",
      description: "Enter your branch and graduation year",
      completed: !!(profile.branch && profile.grad_year),
      weight: 20,
    },
    {
      id: "skills",
      title: "Skills & Expertise",
      description: "List your technical skills",
      completed: Array.isArray(profile.skills) && profile.skills.length >= 1,
      weight: 20,
    },
    {
      id: "experience",
      title: "Experience",
      description: "Add your work experience or projects",
      completed:
        Array.isArray(profile.experiences) && profile.experiences.length >= 1,
      weight: 20,
    },
    {
      id: "resume",
      title: "Resume/CV",
      description: "Upload your resume to apply for jobs",
      completed: profile.resumeUploaded,
      weight: 10,
    },
    {
      id: "preferences",
      title: "Job Preferences",
      description: "Set your preferred roles and locations",
      completed:
        Array.isArray(profile.desiredRoles) && profile.desiredRoles.length > 0,
      weight: 10,
    },
  ];
};

export const calculateProfileCompletion = (profileData = {}) => {
  const sections = buildProfileSections(profileData);
  const completionPercentage = sections.reduce(
    (total, section) => total + (section.completed ? section.weight : 0),
    0
  );
  return { sections, completionPercentage };
};
