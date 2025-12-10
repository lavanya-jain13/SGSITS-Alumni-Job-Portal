// src/pages/alumni/PostJob.jsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

const initialFormData = {
  companyId: "",
  jobTitle: "",
  jobType: "",
  description: "",
  keyResponsibilities: "",
  requirements: "",
  allowedBranches: [],
  allowedBranchesOther: "",
  requiredSkills: [],
  requiredSkillsOther: "",
  niceToHaveSkills: [],
  niceToHaveSkillsOther: "",
  ctcType: "",
  experienceBand: "",
  minCtc: "",
  maxCtc: "",
  workMode: "",
  location: "",
  applyByDate: "",
  numberOfOpenings: "",
  applicationLimit: "",
  customQuestions: [""],
  ndaRequired: false,
};

const steps = [
  { id: 1, title: "Basics", weight: 20 },
  { id: 2, title: "Eligibility", weight: 20 },
  { id: 3, title: "Compensation & Mode", weight: 20 },
  { id: 4, title: "Dates & Limits", weight: 20 },
  { id: 5, title: "Extras", weight: 20 },
];

const jobTypes = ["Full-time", "Part-time", "Contract", "Internship"];
const branches = [
  "Computer Science",
  "Information Technology",
  "Electronics",
  "Mechanical",
  "Civil",
];
const skills = ["JavaScript", "React", "Node.js", "Python", "Java", "SQL", "AWS"];
const ctcTypes = ["CTC", "Stipend"];
const experienceBands = ["0-1 years", "1-3 years", "3-5 years", "5+ years"];
const workModes = ["Remote", "On-site", "Hybrid"];

const parseCsv = (value) =>
  value
    ? value
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

export function PostJob() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("id");

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingJob, setIsLoadingJob] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  const calculateProgress = () => {
    let completedWeight = 0;

    if (formData.jobTitle && formData.jobType && formData.description) {
      completedWeight += steps[0].weight;
    }
    if (formData.allowedBranches.length > 0 && formData.requiredSkills.length > 0) {
      completedWeight += steps[1].weight;
    }
    if (formData.ctcType && formData.workMode && formData.location) {
      completedWeight += steps[2].weight;
    }
    if (formData.applyByDate && formData.numberOfOpenings) {
      completedWeight += steps[3].weight;
    }
    if (currentStep >= 5) {
      completedWeight += steps[4].weight;
    }
    return completedWeight;
  };

  const handleNext = () => currentStep < 5 && setCurrentStep(currentStep + 1);
  const handlePrevious = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const handleArrayUpdate = (field, value, checked) => {
    setFormData((prev) => ({
      ...prev,
      [field]: checked ? [...prev[field], value] : prev[field].filter((item) => item !== value),
    }));
  };

  const addCustomQuestion = () => {
    if (formData.customQuestions.length < 5) {
      setFormData((prev) => ({
        ...prev,
        customQuestions: [...prev.customQuestions, ""],
      }));
    }
  };

  const removeCustomQuestion = (index) => {
    setFormData((prev) => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((_, i) => i !== index),
    }));
  };

  const updateCustomQuestion = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      customQuestions: prev.customQuestions.map((q, i) => (i === index ? value : q)),
    }));
  };

  useEffect(() => {
    const loadCompanies = async () => {
      setCompaniesLoading(true);
      try {
        const data = await apiClient.getMyCompanies();
        const list = data?.companies || [];
        setCompanies(list);
        if (!formData.companyId && list.length) {
          setFormData((prev) => ({ ...prev, companyId: list[0].id }));
        }
      } catch (error) {
        toast({
          title: "Failed to load companies",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        setCompaniesLoading(false);
      }
    };
    loadCompanies();

    const loadJob = async () => {
      if (!jobId) return;
      setIsLoadingJob(true);
      try {
        const data = await apiClient.getJobById(jobId);
        const job = data?.job;
        if (job) {
          const [minFromRange, maxFromRange] =
            job.salary_range?.split("-").map((v) => v.trim()) || [];

          setFormData({
            ...initialFormData,
            companyId: job.company_id || job.companyId || "",
            jobTitle: job.job_title || "",
            jobType: job.job_type || "",
            description: job.job_description || "",
            keyResponsibilities: job.key_responsibilities || "",
            requirements: job.requirements || "",
            allowedBranches: parseCsv(job.allowed_branches),
            allowedBranchesOther: "",
            requiredSkills: parseCsv(job.skills_required),
            requiredSkillsOther: "",
            niceToHaveSkills: parseCsv(job.nice_to_have_skills),
            niceToHaveSkillsOther: "",
            ctcType:
              job.ctc_type ||
              (job.stipend ? "Stipend" : job.salary_range ? "CTC" : ""),
            experienceBand: job.experience_required || "",
            minCtc:
              job.min_ctc != null ? String(job.min_ctc) : minFromRange || "",
            maxCtc:
              job.max_ctc != null ? String(job.max_ctc) : maxFromRange || "",
            workMode: job.work_mode || "",
            location: job.location || "",
            applyByDate: job.application_deadline
              ? job.application_deadline.split("T")[0]
              : "",
            numberOfOpenings:
              job.number_of_openings != null
                ? String(job.number_of_openings)
                : "",
            applicationLimit:
              job.max_applicants_allowed != null
                ? String(job.max_applicants_allowed)
                : "",
            customQuestions:
              job.custom_questions && job.custom_questions.trim().length
                ? job.custom_questions
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean)
                : [""],
            ndaRequired: !!job.nda_required,
          });
        }
      } catch (error) {
        toast({
          title: "Failed to load job",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingJob(false);
      }
    };
    loadJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, toast]);

  const handlePublish = async () => {
    if (!formData.jobTitle || !formData.description) {
      toast({
        title: "Missing required fields",
        description: "Job title and description are required.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.companyId) {
      toast({
        title: "Select a company",
        description: "Choose which company this job belongs to.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const salaryRange =
        formData.minCtc && formData.maxCtc
          ? `${formData.minCtc}-${formData.maxCtc}`
          : formData.minCtc || formData.maxCtc || null;

      const allowedBranches = [
        ...formData.allowedBranches,
        ...parseCsv(formData.allowedBranchesOther),
      ].filter(Boolean);

      const requiredSkills = [
        ...formData.requiredSkills,
        ...parseCsv(formData.requiredSkillsOther),
      ].filter(Boolean);

      const niceToHaveSkills = [
        ...formData.niceToHaveSkills,
        ...parseCsv(formData.niceToHaveSkillsOther),
      ].filter(Boolean);

      const payload = {
        company_id: formData.companyId,
        job_title: formData.jobTitle,
        job_description: formData.description,
        job_type: formData.jobType || null,
        location: formData.location || null,
        salary_range: salaryRange,
        experience_required: formData.experienceBand || null,
        skills_required:
          requiredSkills.length > 0 ? requiredSkills.join(", ") : null,
        stipend:
          formData.ctcType === "Stipend"
            ? formData.maxCtc || formData.minCtc || null
            : null,
        application_deadline: formData.applyByDate || null,
        max_applicants_allowed: formData.applicationLimit || null,

        // advanced fields
        allowed_branches: allowedBranches,
        nice_to_have_skills: niceToHaveSkills,
        work_mode: formData.workMode || null,
        number_of_openings: formData.numberOfOpenings || null,
        custom_questions: formData.customQuestions,
        nda_required: !!formData.ndaRequired,
        ctc_type: formData.ctcType || null,
        min_ctc: formData.minCtc || null,
        max_ctc: formData.maxCtc || null,
        key_responsibilities: formData.keyResponsibilities || null,
        requirements: formData.requirements || null,
      };

      if (jobId) {
        await apiClient.updateJob(jobId, payload);
        toast({
          title: "Job updated",
          description: "Your job posting has been updated.",
        });
      } else {
        await apiClient.postJob(payload);
        toast({
          title: "Job published",
          description: "Your job posting is now live.",
        });
      }
      navigate("/alumni/postings", { state: { refreshJobs: true } });
    } catch (error) {
      toast({
        title: jobId ? "Failed to update job" : "Failed to publish job",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = calculateProgress();

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Select
                value={formData.companyId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, companyId: value }))
                }
                disabled={companiesLoading || companies.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      companiesLoading
                        ? "Loading companies..."
                        : companies.length
                        ? "Select company"
                        : "No companies available"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name ||
                        company.company_name ||
                        "Unnamed Company"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input
                id="jobTitle"
                placeholder="e.g. Senior Software Engineer"
                value={formData.jobTitle}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    jobTitle: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type *</Label>
              <Select
                value={formData.jobType}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, jobType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description * (2200 characters)
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the role, what the candidate will be doing..."
                className="min-h-32"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
              <div className="text-sm text-muted-foreground">
                {formData.description.length}/2200 characters minimum
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyResponsibilities">
                Key Responsibilities
              </Label>
              <Textarea
                id="keyResponsibilities"
                placeholder="List the main responsibilities..."
                value={formData.keyResponsibilities}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    keyResponsibilities: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="List the required qualifications, skills..."
                value={formData.requirements}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    requirements: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Allowed Branches *</Label>
              <div className="space-y-2">
                {branches.map((branch) => (
                  <div key={branch} className="flex items-center space-x-2">
                    <Checkbox
                      id={branch}
                      checked={formData.allowedBranches.includes(branch)}
                      onCheckedChange={(checked) =>
                        handleArrayUpdate("allowedBranches", branch, checked)
                      }
                    />
                    <Label htmlFor={branch}>{branch}</Label>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <Label htmlFor="allowedBranchesOther">
                  Other branches (comma separated)
                </Label>
                <Textarea
                  id="allowedBranchesOther"
                  placeholder="e.g. Chemical, Biotechnology"
                  value={formData.allowedBranchesOther}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      allowedBranchesOther: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Required Skills *</Label>
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={`req-${skill}`}
                      checked={formData.requiredSkills.includes(skill)}
                      onCheckedChange={(checked) =>
                        handleArrayUpdate("requiredSkills", skill, checked)
                      }
                    />
                    <Label htmlFor={`req-${skill}`}>{skill}</Label>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <Label htmlFor="requiredSkillsOther">
                  Other required skills (comma separated)
                </Label>
                <Textarea
                  id="requiredSkillsOther"
                  placeholder="e.g. Rust, Kubernetes"
                  value={formData.requiredSkillsOther}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      requiredSkillsOther: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Nice-to-Have Skills</Label>
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={`nice-${skill}`}
                      checked={formData.niceToHaveSkills.includes(skill)}
                      onCheckedChange={(checked) =>
                        handleArrayUpdate("niceToHaveSkills", skill, checked)
                      }
                    />
                    <Label htmlFor={`nice-${skill}`}>{skill}</Label>
                  </div>
                ))}
              </div>
              <div className="space-y-1">
                <Label htmlFor="niceToHaveSkillsOther">
                  Other nice-to-have skills (comma separated)
                </Label>
                <Textarea
                  id="niceToHaveSkillsOther"
                  placeholder="e.g. GraphQL, Terraform"
                  value={formData.niceToHaveSkillsOther}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      niceToHaveSkillsOther: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CTC/Stipend Type</Label>
                <Select
                  value={formData.ctcType}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, ctcType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ctcTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Experience Band</Label>
                <Select
                  value={formData.experienceBand}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, experienceBand: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceBands.map((band) => (
                      <SelectItem key={band} value={band}>
                        {band}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min CTC/Stipend (₹)</Label>
                <Input
                  placeholder="e.g. 500000"
                  value={formData.minCtc}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minCtc: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Max CTC/Stipend (₹)</Label>
                <Input
                  placeholder="e.g. 800000"
                  value={formData.maxCtc}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxCtc: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Work Mode *</Label>
              <Select
                value={formData.workMode}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, workMode: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work mode" />
                </SelectTrigger>
                <SelectContent>
                  {workModes.map((mode) => (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location *</Label>
              <Input
                placeholder="e.g. Mumbai, Maharashtra, India"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Apply-by Date *</Label>
              <Input
                type="date"
                value={formData.applyByDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    applyByDate: e.target.value,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Number of Openings *</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={formData.numberOfOpenings}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      numberOfOpenings: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Application Limit</Label>
                <Input
                  type="number"
                  placeholder="50"
                  value={formData.applicationLimit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      applicationLimit: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Custom Questions (Up to 5)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomQuestion}
                  disabled={formData.customQuestions.length >= 5}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {formData.customQuestions.map((question, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Custom question ${index + 1}...`}
                    value={question}
                    onChange={(e) => updateCustomQuestion(index, e.target.value)}
                  />
                  {formData.customQuestions.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCustomQuestion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="ndaRequired"
                checked={formData.ndaRequired}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, ndaRequired: checked }))
                }
              />
              <Label htmlFor="ndaRequired">NDA Required</Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/alumni/postings")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">
          {jobId ? "Edit Job" : "Post a Job"}
        </h1>
      </div>

      {/* Progress Section */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-primary font-medium">
                {progress}% Complete
              </span>
            </div>

            <Progress value={progress} className="h-2" />

            <div className="flex justify-between items-center">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="flex flex-col items-center space-y-2"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : currentStep > step.id
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? "✓" : step.id}
                  </div>
                  <span className="text-xs text-center">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {isLoadingJob
              ? "Loading..."
              : `Step ${currentStep}: ${steps[currentStep - 1].title}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="space-x-2">
          <Button variant="outline">Save Draft</Button>

          {currentStep < 5 ? (
            <Button onClick={handleNext}>
              Save & Continue
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={isSubmitting}>
              {isSubmitting
                ? jobId
                  ? "Updating..."
                  : "Publishing..."
                : jobId
                ? "Update Job"
                : "Publish Job"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
