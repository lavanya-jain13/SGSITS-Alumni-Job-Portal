import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2, Users, Globe, MapPin, Linkedin, Twitter, ExternalLink } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function CompanyProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("id");
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!companyId) {
        toast({
          title: "No company selected",
          description: "Return to My Companies and pick a company.",
          variant: "destructive",
        });
        navigate("/alumni/companies", { replace: true });
        return;
      }
      setLoading(true);
      try {
        const data = await apiClient.getCompanyById(companyId);
        setCompany(data?.company);
      } catch (error) {
        toast({
          title: "Failed to load company",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
        navigate("/alumni/companies", { replace: true });
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [companyId, navigate, toast]);

  const handleBack = () => navigate("/alumni/companies");
  const handleEdit = () => navigate(`/alumni/edit-company-profile?id=${companyId}`);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        Loading company...
      </div>
    );
  }

  if (!company) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{company.name}</h1>
                <p className="text-sm text-muted-foreground">Company Profile</p>
              </div>
            </div>
            <Button 
              onClick={handleEdit}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Edit Company Details
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Info */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">{company.name}</h2>
                      <p className="text-muted-foreground">{company.industry || "—"}</p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {company.company_size || "—"}
                      </div>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-1" />
                        {company.website ? (
                          <a 
                            href={company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Website
                          </a>
                        ) : (
                          "—"
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>About {company.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {company.about || "No description added yet."}
                </p>
              </CardContent>
            </Card>

            {/* Company Culture */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Company Culture</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {company.company_culture || "No culture description added yet."}
                </p>
              </CardContent>
            </Card>

            {/* Office Locations */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Office Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(company.office_locations && company.office_locations.length > 0
                    ? company.office_locations
                    : [company.location || "Not specified"]
                  ).map((loc, idx) => (
                    <div key={idx} className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 text-primary" />
                      {loc || "Not specified"}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{company.activeJobs || 0}</div>
                  <div className="text-sm text-muted-foreground">Active Job Openings</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{company.alumniHired || 0}</div>
                  <div className="text-sm text-muted-foreground">SGSITS Alumni Hired</div>
                </div>
              </CardContent>
            </Card>

            {/* Connect With Us */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Connect With Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  disabled={!company.linkedin_url}
                  onClick={() => company.linkedin_url && window.open(company.linkedin_url, "_blank")}
                >
                  <Linkedin className="h-4 w-4 mr-2 text-blue-600" />
                  LinkedIn
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  disabled={!company.twitter_url}
                  onClick={() => company.twitter_url && window.open(company.twitter_url, "_blank")}
                >
                  <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                  Twitter/X
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  disabled={!company.website}
                  onClick={() => company.website && window.open(company.website, "_blank")}
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Company Website
                  <ExternalLink className="h-3 w-3 ml-auto" />
                </Button>
              </CardContent>
            </Card>

            {/* Interested in Working Here */}
            <Card className="gradient-card shadow-glow">
              <CardContent className="p-6 text-center space-y-4">
                <div>
                  <h3 className="font-semibold text-foreground">Interested in Working Here?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check out current job openings from {company.name}
                  </p>
                </div>
                <Button 
                  className="w-full bg-foreground text-background hover:bg-foreground/90"
                  onClick={() => navigate("/alumni/postings")}
                >
                  View Job Openings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
