import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Clock, Calendar, Building, Users, BookOpen, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("description");
  
  // Mock profile completion check
  const profileComplete = false;
  const [jobDetails, setJobDetails] = useState(null);
  const [applicantCount, setApplicantCount] = useState(0);
  const [loading, setLoading] = useState(true);

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
        // fetch applicant counts (requires auth)
        try {
          const applicants = await apiFetch(`/job/view-applicants/${id}`);
          if (mounted) setApplicantCount(applicants?.count || applicants?.applicants?.length || 0);
        } catch (err) {}
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
      // Navigate to dashboard with profile completion prompt
      alert("Redirecting to complete your profile...");
      navigate("/?complete-profile=true");
      return;
    }
    // Handle application logic
    alert("Application submitted successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">{jobDetails?.job_title || 'Job Details'}</h1>
                      <p className="text-lg text-muted-foreground">{jobDetails?.company_name}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={
                      mockJobDetails.type === "Full-time" ? "bg-orange-100 text-orange-800 border-orange-200" :
                      mockJobDetails.type === "Internship" ? "bg-blue-100 text-blue-800 border-blue-200" :
                      "bg-green-100 text-green-800 border-green-200"
                    }
                  >
                    {mockJobDetails.type}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{mockJobDetails.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{mockJobDetails.experience}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Apply by {jobDetails?.created_at ? new Date(jobDetails.created_at).toDateString() : '—'}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{applicantCount} applicants</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {(jobDetails?.skills || []).map((skill, i) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <div className="text-lg font-semibold text-primary">
                    {jobDetails?.stipend || '—'}
                </div>
              </CardContent>
            </Card>

            {/* Tabbed Content */}
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
                      <p className="whitespace-pre-line">{jobDetails?.job_description || 'No description provided.'}</p>
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
                    <CardTitle>About {mockJobDetails.companyInfo.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <span className="text-sm text-muted-foreground">Founded</span>
                        <p className="font-medium">{mockJobDetails.companyInfo.founded}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Company Size</span>
                        <p className="font-medium">{mockJobDetails.companyInfo.size}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Industry</span>
                        <p className="font-medium">{mockJobDetails.companyInfo.industry}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Website</span>
                        <p className="font-medium text-primary">{mockJobDetails.companyInfo.website}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{jobDetails?.company_about || 'No company details'}</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
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
                  disabled={!profileComplete}
                >
                  {profileComplete ? "Apply Now" : "Complete Profile to Apply"}
                </Button>
                
                <div className="text-center text-sm text-muted-foreground">
                  Posted {mockJobDetails.posted}
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Job Type</span>
                    <p className="font-medium">{mockJobDetails.type}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Experience Level</span>
                    <p className="font-medium">{mockJobDetails.experience}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Location</span>
                    <p className="font-medium">{mockJobDetails.location}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Application Deadline</span>
                    <p className="font-medium">{mockJobDetails.applyBy}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Similar Jobs */}
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
    </div>
  );
}