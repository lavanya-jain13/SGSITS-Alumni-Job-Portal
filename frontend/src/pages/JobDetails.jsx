// import React, { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { ArrowLeft, MapPin, Clock, Calendar, Building, Users, BookOpen, CheckCircle, AlertCircle } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Separator } from "@/components/ui/separator";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import ApplicationModal from "@/components/ApplicationModals";
// import { useToast } from "@/hooks/use-toast";
// import { getToken } from "@/lib/api";

// export default function JobDetails() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState("description");
//   const profileComplete = true; // TODO: replace with real profile completion status
//   const [jobDetails, setJobDetails] = useState(null);
//   const [applicantCount, setApplicantCount] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);
//   const [isApplying, setIsApplying] = useState(false);
//   const { toast } = useToast();

//   const toArray = (val) => {
//     if (!val) return [];
//     if (Array.isArray(val)) return val;
//     if (typeof val === "string")
//       return val
//         .split(",")
//         .map((s) => s.trim())
//         .filter(Boolean);
//     return [];
//   };

//   React.useEffect(() => {
//     let mounted = true;
//     async function load() {
//       setLoading(true);
//       try {
//         const { apiFetch } = await import("@/lib/api");
//         const res = await apiFetch(`/job/get-job-by-id-student/${id}`);
//         if (mounted) {
//           setJobDetails(res?.job || null);
//           setApplicantCount(
//             res?.job?.applicants_count ||
//               res?.job?.applications_count ||
//               0
//           );
//         }
//       } catch (err) {
//         console.error("Failed to load job details", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     if (id) load();
//     return () => { mounted = false };
//   }, [id]);

//   const handleApply = async () => {
//     if (!profileComplete) {
//       alert("Redirecting to complete your profile...");
//       navigate("/?complete-profile=true");
//       return;
//     }

//     const token = getToken();
//     if (!token) {
//       toast({
//         title: "Please log in",
//         description: "You need to sign in as a student to apply.",
//         variant: "destructive",
//       });
//       navigate("/login");
//       return;
//     }

//     setIsApplying(true);
//     try {
//       const { apiFetch } = await import("@/lib/api");
//       // fetch student profile to get resume_url
//       const profileRes = await apiFetch("/student/profile");
//       const resumeUrl = profileRes?.profile?.resume_url;
//       if (!resumeUrl) {
//         toast({
//           title: "Upload resume first",
//           description: "Please upload your resume in your profile before applying.",
//           variant: "destructive",
//         });
//         return;
//       }

//       await apiFetch("/job/apply-job", {
//         method: "POST",
//         body: JSON.stringify({
//           job_id: id,
//           resume_url: resumeUrl,
//         }),
//       });

//       toast({
//         title: "Application submitted",
//         description: "Your job application was submitted successfully.",
//       });
//     } catch (err) {
//       toast({
//         title: "Could not apply",
//         description: err?.message || "Failed to submit application.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsApplying(false);
//     }
//   };

//   const displayJob = {
//     title: jobDetails?.job_title || jobDetails?.title || "Job Details",
//     company: jobDetails?.company_name || jobDetails?.company || "Company",
//     type: jobDetails?.job_type || jobDetails?.type || "Job",
//     location: jobDetails?.location || "Location not specified",
//     experience: jobDetails?.experience || jobDetails?.experience_level || "Not specified",
//     applyBy: jobDetails?.application_deadline ? new Date(jobDetails.application_deadline).toDateString() : "Not specified",
//     posted: jobDetails?.created_at ? new Date(jobDetails.created_at).toDateString() : "Not specified",
//     stipend: jobDetails?.stipend || "Not specified"
//   };

//   const companyInfo = {
//     name: jobDetails?.company_name || "Company",
//     founded: jobDetails?.company_founded || "Not provided",
//     size: jobDetails?.company_size || "Not provided",
//     industry: jobDetails?.company_industry || jobDetails?.industry || "Not provided",
//     website: jobDetails?.company_website || jobDetails?.website || "Not provided"
//   };

//   if (!loading && !jobDetails) {
//     return (
//       <div className="min-h-screen bg-background flex items-center justify-center">
//         <div className="text-center space-y-2">
//           <p className="text-lg font-semibold">Job not found</p>
//           <Button variant="outline" onClick={() => navigate("/jobs")}>Back to Jobs</Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="bg-primary text-primary-foreground py-4">
//         <div className="max-w-7xl mx-auto px-6">
//           <Button
//             variant="ghost"
//             onClick={() => navigate("/dashboard")}
//             className="text-primary-foreground hover:bg-primary-foreground/10 mb-4"
//           >
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back to Dashboard
//           </Button>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-6 py-6">
//         <div className="grid lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2 space-y-6">
//             <Card>
//               <CardContent className="p-6">
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex items-center space-x-4">
//                     <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
//                       <Building className="h-8 w-8 text-primary" />
//                     </div>
//                     <div>
//                       <h1 className="text-2xl font-bold">{displayJob.title}</h1>
//                       <p className="text-lg text-muted-foreground">{displayJob.company}</p>
//                     </div>
//                   </div>
//                   <Badge 
//                     variant="secondary"
//                     className={
//                       displayJob.type === "Full-time" ? "bg-orange-100 text-orange-800 border-orange-200" :
//                       displayJob.type === "Internship" ? "bg-blue-100 text-blue-800 border-blue-200" :
//                       "bg-green-100 text-green-800 border-green-200"
//                     }
//                   >
//                     {displayJob.type}
//                   </Badge>
//                 </div>

//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
//                   <div className="flex items-center space-x-2 text-sm text-muted-foreground">
//                     <MapPin className="h-4 w-4" />
//                     <span>{displayJob.location}</span>
//                   </div>
//                   <div className="flex items-center space-x-2 text-sm text-muted-foreground">
//                     <Clock className="h-4 w-4" />
//                     <span>{displayJob.experience}</span>
//                   </div>
//                   <div className="flex items-center space-x-2 text-sm text-muted-foreground">
//                     <Calendar className="h-4 w-4" />
//                     <span>Apply by {displayJob.applyBy}</span>
//                   </div>
//                   <div className="flex items-center space-x-2 text-sm text-muted-foreground">
//                     <Users className="h-4 w-4" />
//                     <span>{applicantCount} applicants</span>
//                   </div>
//                 </div>

//                 <div className="flex flex-wrap gap-2 mb-6">
//                   {toArray(jobDetails?.skills).map((skill, i) => (
//                     <Badge key={`${skill}-${i}`} variant="outline">
//                       {skill}
//                     </Badge>
//                   ))}
//                 </div>

//                 <div className="text-lg font-semibold text-primary">
//                     {displayJob.stipend}
//                 </div>
//               </CardContent>
//             </Card>

//             <Tabs value={activeTab} onValueChange={setActiveTab}>
//               <TabsList className="grid w-full grid-cols-5">
//                 <TabsTrigger value="description">Description</TabsTrigger>
//                 <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
//                 <TabsTrigger value="requirements">Requirements</TabsTrigger>
//                 <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
//                 <TabsTrigger value="company">Company</TabsTrigger>
//               </TabsList>

//               <TabsContent value="description" className="mt-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Job Description</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="prose prose-sm max-w-none">
//                       <p className="whitespace-pre-line">{jobDetails?.job_description || "No description provided."}</p>
//                     </div>
                    
//                     <Separator className="my-6" />
                    
//                     <div>
//                       <h3 className="font-semibold mb-3">Benefits</h3>
//                       <ul className="space-y-2">
//                         {toArray(jobDetails?.benefits).map((benefit, index) => (
//                           <li key={index} className="flex items-center space-x-2">
//                             <CheckCircle className="h-4 w-4 text-green-600" />
//                             <span className="text-sm">{benefit}</span>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </TabsContent>

//               <TabsContent value="responsibilities" className="mt-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Key Responsibilities</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <ul className="space-y-3">
//                       {toArray(jobDetails?.key_responsibilities || jobDetails?.responsibilities).map((responsibility, index) => (
//                         <li key={index} className="flex items-start space-x-2">
//                           <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
//                           <span className="text-sm">{responsibility}</span>
//                         </li>
//                       ))}
//                     </ul>
//                   </CardContent>
//                 </Card>
//               </TabsContent>

//               <TabsContent value="requirements" className="mt-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Requirements</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <ul className="space-y-3">
//                       {toArray(jobDetails?.requirements).map((requirement, index) => (
//                         <li key={index} className="flex items-start space-x-2">
//                           <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
//                           <span className="text-sm">{requirement}</span>
//                         </li>
//                       ))}
//                     </ul>
//                   </CardContent>
//                 </Card>
//               </TabsContent>

//               <TabsContent value="eligibility" className="mt-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>Eligibility Criteria</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <ul className="space-y-3">
//                       {toArray(jobDetails?.eligibility || jobDetails?.allowed_branches).map((criteria, index) => (
//                         <li key={index} className="flex items-start space-x-2">
//                           <BookOpen className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
//                           <span className="text-sm">{criteria}</span>
//                         </li>
//                       ))}
//                     </ul>
//                   </CardContent>
//                 </Card>
//               </TabsContent>

//               <TabsContent value="company" className="mt-6">
//                 <Card>
//                   <CardHeader>
//                     <CardTitle>About {companyInfo.name}</CardTitle>
//                   </CardHeader>
//                   <CardContent>
//                     <div className="grid grid-cols-2 gap-4 mb-6">
//                       <div>
//                         <span className="text-sm text-muted-foreground">Founded</span>
//                         <p className="font-medium">{companyInfo.founded}</p>
//                       </div>
//                       <div>
//                         <span className="text-sm text-muted-foreground">Company Size</span>
//                         <p className="font-medium">{companyInfo.size}</p>
//                       </div>
//                       <div>
//                         <span className="text-sm text-muted-foreground">Industry</span>
//                         <p className="font-medium">{companyInfo.industry}</p>
//                       </div>
//                       <div>
//                         <span className="text-sm text-muted-foreground">Website</span>
//                         <p className="font-medium text-primary">{companyInfo.website}</p>
//                       </div>
//                     </div>
//                     <p className="text-sm text-muted-foreground">{jobDetails?.company_about || "No company details"}</p>
//                   </CardContent>
//                 </Card>
//               </TabsContent>
//             </Tabs>
//           </div>

//           <div className="space-y-6">
//             <Card>
//               <CardContent className="p-6">
//                 {!profileComplete && (
//                   <Alert className="mb-4">
//                     <AlertCircle className="h-4 w-4" />
//                     <AlertDescription>
//                       Complete your profile to apply for this job.
//                     </AlertDescription>
//                   </Alert>
//                 )}
                
//                 <Button 
//                   onClick={handleApply}
//                   className="w-full mb-4"
//                   disabled={!profileComplete || loading}
//                 >
//                   {profileComplete ? "Apply Now" : "Complete Profile to Apply"}
//                 </Button>
                
//                 <div className="text-center text-sm text-muted-foreground">
//                   Posted {displayJob.posted}
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg">Quick Info</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   <div>
//                     <span className="text-sm text-muted-foreground">Job Type</span>
//                     <p className="font-medium">{displayJob.type}</p>
//                   </div>
//                   <div>
//                     <span className="text-sm text-muted-foreground">Experience Level</span>
//                     <p className="font-medium">{displayJob.experience}</p>
//                   </div>
//                   <div>
//                     <span className="text-sm text-muted-foreground">Location</span>
//                     <p className="font-medium">{displayJob.location}</p>
//                   </div>
//                   <div>
//                     <span className="text-sm text-muted-foreground">Application Deadline</span>
//                     <p className="font-medium">{displayJob.applyBy}</p>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle className="text-lg">Similar Jobs</CardTitle>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {[
//                     { title: "React Developer", company: "StartupHub", type: "Internship" },
//                     { title: "Full Stack Developer", company: "WebCorp", type: "Full-time" },
//                     { title: "UI Developer", company: "DesignTech", type: "Contract" }
//                   ].map((job, index) => (
//                     <div key={index} className="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors">
//                       <h4 className="font-medium text-sm">{job.title}</h4>
//                       <p className="text-xs text-muted-foreground">{job.company}</p>
//                       <Badge variant="outline" className="text-xs mt-1">
//                         {job.type}
//                       </Badge>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
//       </div>

//       <ApplicationModal
//         isOpen={isApplicationModalOpen}
//         onClose={() => setIsApplicationModalOpen(false)}
//         jobDetails={{
//           title: displayJob.title,
//           company: displayJob.company,
//           location: displayJob.location,
//           type: displayJob.type
//         }}
//       />
//     </div>
//   );
// }


import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Calendar, Building, Users, BookOpen, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ApplicationModal from "@/components/ApplicationModals";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("description");
  const profileComplete = true; // TODO: replace with real profile completion status
  const [jobDetails, setJobDetails] = useState(null);
  const [applicantCount, setApplicantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const { apiFetch } = await import("@/lib/api");
        const res = await apiFetch(`/job/get-job-by-id-student/${id}`);
        if (mounted) {
          setJobDetails(res?.job || null);
        }
        try {
          const applicants = await apiFetch(`/job/view-applicants/${id}`);
          if (mounted) setApplicantCount(applicants?.count || applicants?.applicants?.length || 0);
        } catch (err) {
          // ignore applicant load failures for now
        }
      } catch (err) {
        console.error("Failed to load job details", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
    return () => { mounted = false };
  }, [id]);

  const handleApply = () => {
    if (!profileComplete) {
      alert("Redirecting to complete your profile...");
      navigate("/?complete-profile=true");
      return;
    }
    setIsApplicationModalOpen(true);
  };

  const displayJob = {
    title: jobDetails?.job_title || jobDetails?.title || "Job Details",
    company: jobDetails?.company_name || jobDetails?.company || "Company",
    type: jobDetails?.job_type || jobDetails?.type || "Job",
    location: jobDetails?.location || "Location not specified",
    experience: jobDetails?.experience || jobDetails?.experience_level || "Not specified",
    applyBy: jobDetails?.application_deadline ? new Date(jobDetails.application_deadline).toDateString() : "Not specified",
    posted: jobDetails?.created_at ? new Date(jobDetails.created_at).toDateString() : "Not specified",
    stipend: jobDetails?.stipend || "Not specified"
  };

  const companyInfo = {
    name: jobDetails?.company_name || "Company",
    founded: jobDetails?.company_founded || "Not provided",
    size: jobDetails?.company_size || "Not provided",
    industry: jobDetails?.company_industry || jobDetails?.industry || "Not provided",
    website: jobDetails?.company_website || jobDetails?.website || "Not provided"
  };

  if (!loading && !jobDetails) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-semibold">Job not found</p>
          <Button variant="outline" onClick={() => navigate("/jobs")}>Back to Jobs</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-4">
        <div className="max-w-7xl mx-auto px-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="text-primary-foreground hover:bg-primary-foreground/10 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{displayJob.title}</h1>
                      <p className="text-lg text-muted-foreground">{displayJob.company}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={
                      displayJob.type === "Full-time" ? "bg-orange-100 text-orange-800 border-orange-200" :
                      displayJob.type === "Internship" ? "bg-blue-100 text-blue-800 border-blue-200" :
                      "bg-green-100 text-green-800 border-green-200"
                    }
                  >
                    {displayJob.type}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{displayJob.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{displayJob.experience}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Apply by {displayJob.applyBy}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{applicantCount} applicants</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {(jobDetails?.skills || []).map((skill, i) => (
                    <Badge key={`${skill}-${i}`} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="text-lg font-semibold text-primary">
                    {displayJob.stipend}
                </div>
              </CardContent>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="responsibilities">Responsibilities</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
                <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Job Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-line">{jobDetails?.job_description || "No description provided."}</p>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div>
                      <h3 className="font-semibold mb-3">Benefits</h3>
                      <ul className="space-y-2">
                        {(jobDetails?.benefits || []).map((benefit, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="responsibilities" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Responsibilities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(jobDetails?.responsibilities || []).map((responsibility, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="requirements" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(jobDetails?.requirements || []).map((requirement, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{requirement}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="eligibility" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Eligibility Criteria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {(jobDetails?.eligibility || []).map((criteria, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <BookOpen className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="company" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {companyInfo.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <span className="text-sm text-muted-foreground">Founded</span>
                        <p className="font-medium">{companyInfo.founded}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Company Size</span>
                        <p className="font-medium">{companyInfo.size}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Industry</span>
                        <p className="font-medium">{companyInfo.industry}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Website</span>
                        <p className="font-medium text-primary">{companyInfo.website}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{jobDetails?.company_about || "No company details"}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                {!profileComplete && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Complete your profile to apply for this job.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  onClick={handleApply}
                  className="w-full mb-4"
                  disabled={!profileComplete || loading}
                >
                  {profileComplete ? "Apply Now" : "Complete Profile to Apply"}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  Posted {displayJob.posted}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Job Type</span>
                    <p className="font-medium">{displayJob.type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Experience Level</span>
                    <p className="font-medium">{displayJob.experience}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Location</span>
                    <p className="font-medium">{displayJob.location}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Application Deadline</span>
                    <p className="font-medium">{displayJob.applyBy}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Similar Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: "React Developer", company: "StartupHub", type: "Internship" },
                    { title: "Full Stack Developer", company: "WebCorp", type: "Full-time" },
                    { title: "UI Developer", company: "DesignTech", type: "Contract" }
                  ].map((job, index) => (
                    <div key={index} className="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors">
                      <h4 className="font-medium text-sm">{job.title}</h4>
                      <p className="text-xs text-muted-foreground">{job.company}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {job.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ApplicationModal
        isOpen={isApplicationModalOpen}
        onClose={() => setIsApplicationModalOpen(false)}
        jobDetails={{
          title: displayJob.title,
          company: displayJob.company,
          location: displayJob.location,
          type: displayJob.type
        }}
      />
    </div>
  );
}
