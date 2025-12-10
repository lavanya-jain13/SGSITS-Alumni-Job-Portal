import { useEffect, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function EditCompanyProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get("id");
  
  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    websiteUrl: "",
    industry: "",
    companySize: "",
    foundedYear: "",
    aboutCompany: "",
    companyCulture: "",
    linkedinUrl: "",
    twitterUrl: "",
    contactPersonName: "",
    contactEmail: "",
    contactPhone: "",
    hasLogo: false
  });

  const [locations, setLocations] = useState([
    { id: "1", city: "", state: "", country: "" },
  ]);

  // Section collapse states
  const [sectionStates, setSectionStates] = useState({
    basics: true,
    locations: false,
    aboutCulture: false,
    socialContact: false
  });

  // Calculate progress based on completed fields
  const calculateProgress = () => {
    const toText = (val) =>
      val === undefined || val === null ? "" : String(val);
    const weights = {
      basics: 25,
      locations: 20,
      aboutCulture: 35,
      socialContact: 20
    };

    let totalProgress = 0;

    // Company Basics (25%)
    const basicsFields = [
      formData.companyName,
      formData.websiteUrl,
      formData.industry,
      formData.companySize,
      formData.foundedYear,
    ];
    const completedBasics = basicsFields.filter(
      (field) => toText(field).trim() !== ""
    ).length;
    totalProgress += (completedBasics / basicsFields.length) * weights.basics;

    // Locations (20%)
    const hasLocations = locations.length > 0 && locations.every(loc => loc.city && loc.state && loc.country);
    totalProgress += hasLocations ? weights.locations : 0;

    // About & Culture (30%)
    const aboutFields = [formData.aboutCompany, formData.companyCulture];
    const completedAbout = aboutFields.filter(
      (field) => toText(field).trim() !== ""
    ).length;
    totalProgress += (completedAbout / aboutFields.length) * weights.aboutCulture;

    // Social Links & Contact (15%)
    const socialFields = [
      formData.linkedinUrl,
      formData.twitterUrl,
      formData.contactPersonName,
      formData.contactEmail,
      formData.contactPhone,
    ];
    const completedSocial = socialFields.filter(
      (field) => toText(field).trim() !== ""
    ).length;
    totalProgress += (completedSocial / socialFields.length) * weights.socialContact;

    // Logo Upload (10%)
    return Math.round(totalProgress);
  };

  const toggleSection = (section) => {
    setSectionStates(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addLocation = () => {
    const newLocation = {
      id: Date.now().toString(),
      city: "",
      state: "",
      country: ""
    };
    setLocations([...locations, newLocation]);
  };

  const removeLocation = (id) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  const updateLocation = (id, field, value) => {
    setLocations(locations.map(loc => 
      loc.id === id ? { ...loc, [field]: value } : loc
    ));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    const loadCompany = async () => {
      if (!companyId) {
        toast({
          title: "No company selected",
          description: "Return to My Companies and pick a company.",
          variant: "destructive",
        });
        navigate("/alumni/companies", { replace: true });
        return;
      }
      try {
        const data = await apiClient.getCompanyById(companyId);
        const c = data?.company;
        if (c) {
          setFormData((prev) => ({
            ...prev,
            companyName: c.name || "",
            websiteUrl: c.website || "",
            industry: c.industry || "",
            companySize: c.company_size || "",
            foundedYear: c.founded_year || "",
            aboutCompany: c.about || "",
            companyCulture: c.company_culture || "",
            linkedinUrl: c.linkedin_url || c.document_url || "",
            twitterUrl: c.twitter_url || "",
          }));
          if (Array.isArray(c.office_locations) && c.office_locations.length > 0) {
            setLocations(
              c.office_locations.map((loc, idx) => {
                const parts = (loc || "").split(",").map((p) => p.trim());
                return {
                  id: String(idx),
                  city: parts[0] || "",
                  state: parts[1] || "",
                  country: parts[2] || "",
                };
              })
            );
          }
        }
      } catch (error) {
        toast({
          title: "Failed to load company",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
        navigate("/alumni/companies", { replace: true });
      }
    };
    loadCompany();
  }, [companyId, navigate, toast]);

  const handleSave = async () => {
    try {
      await apiClient.updateCompany(companyId, {
        name: formData.companyName,
        website: formData.websiteUrl,
        industry: formData.industry,
        company_size: formData.companySize,
        about: formData.aboutCompany || formData.companyCulture,
        company_culture: formData.companyCulture,
        linkedin_url: formData.linkedinUrl,
        twitter_url: formData.twitterUrl,
        founded_year: formData.foundedYear || null,
        office_locations: locations
          .filter((loc) => loc.city || loc.state || loc.country)
          .map((loc) =>
            [loc.city, loc.state, loc.country].filter(Boolean).join(", ")
          ),
      });
      toast({ title: "Company updated" });
      navigate(`/alumni/company-profile?id=${companyId}`);
    } catch (error) {
      toast({
        title: "Failed to update company",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/alumni/company-profile?id=${companyId || ""}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-semibold">Edit Company Profile</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(`/alumni/company-profile?id=${companyId || ""}`)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Progress Bar */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Company Profile Completion</span>
                <span className="text-sm font-medium text-primary">{progress}% Complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Company Basics */}
        <Card>
          <Collapsible open={sectionStates.basics} onOpenChange={() => toggleSection('basics')}>
            <CollapsibleTrigger className="w-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Company Basics (25%)</h3>
                  {sectionStates.basics ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input
                      id="websiteUrl"
                      value={formData.websiteUrl}
                      onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry *</Label>
                    <Select value={formData.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Information Technology">Information Technology</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Company Size *</Label>
                    <Select value={formData.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10 employees">1-10 employees</SelectItem>
                        <SelectItem value="11-50 employees">11-50 employees</SelectItem>
                        <SelectItem value="51-200 employees">51-200 employees</SelectItem>
                        <SelectItem value="201-500 employees">201-500 employees</SelectItem>
                        <SelectItem value="501-1000 employees">501-1000 employees</SelectItem>
                        <SelectItem value="1000+ employees">1000+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Founded Year</Label>
                  <Input
                    id="foundedYear"
                    value={formData.foundedYear}
                    onChange={(e) => handleInputChange('foundedYear', e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Locations */}
        <Card>
          <Collapsible open={sectionStates.locations} onOpenChange={() => toggleSection('locations')}>
            <CollapsibleTrigger className="w-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Locations (20%)</h3>
                  {sectionStates.locations ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-6 pb-6 space-y-4">
                {locations.map((location, index) => (
                  <div key={location.id} className="space-y-4 border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Location {index + 1}</h4>
                      {locations.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeLocation(location.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input
                          value={location.city}
                          onChange={(e) => updateLocation(location.id, 'city', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>State</Label>
                        <Input
                          value={location.state}
                          onChange={(e) => updateLocation(location.id, 'state', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input
                          value={location.country}
                          onChange={(e) => updateLocation(location.id, 'country', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addLocation} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Location
                </Button>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Company About & Culture */}
        <Card>
          <Collapsible open={sectionStates.aboutCulture} onOpenChange={() => toggleSection('aboutCulture')}>
            <CollapsibleTrigger className="w-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Company About & Culture (30%)</h3>
                  {sectionStates.aboutCulture ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aboutCompany">About Company * (min 50 characters)</Label>
                  <Textarea
                    id="aboutCompany"
                    value={formData.aboutCompany}
                    onChange={(e) => handleInputChange('aboutCompany', e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="text-sm text-muted-foreground">
                    {formData.aboutCompany.length}/50 characters minimum
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyCulture">Company Culture</Label>
                  <Textarea
                    id="companyCulture"
                    value={formData.companyCulture}
                    onChange={(e) => handleInputChange('companyCulture', e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Social Links & Contact */}
        <Card>
          <Collapsible open={sectionStates.socialContact} onOpenChange={() => toggleSection('socialContact')}>
            <CollapsibleTrigger className="w-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Social Links & Contact (15%)</h3>
                  {sectionStates.socialContact ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CardContent>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      value={formData.linkedinUrl}
                      onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitterUrl">Twitter/X URL</Label>
                    <Input
                      id="twitterUrl"
                      value={formData.twitterUrl}
                      onChange={(e) => handleInputChange('twitterUrl', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactPersonName">Contact Person Name</Label>
                    <Input
                      id="contactPersonName"
                      value={formData.contactPersonName}
                      onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </div>
    </div>
  );
}
