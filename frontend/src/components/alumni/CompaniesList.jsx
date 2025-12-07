import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Users, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Mock data - replace with actual data from your backend
const mockCompanies = [
  {
    id: 1,
    name: "Tech Innovations Ltd",
    industry: "Technology",
    location: "San Francisco, CA",
    employees: "50-100",
    description: "Leading software development company specializing in AI solutions",
    logo: "🏢",
  },
  {
    id: 2,
    name: "Green Energy Corp",
    industry: "Renewable Energy",
    location: "Austin, TX",
    employees: "100-500",
    description: "Sustainable energy solutions for a better tomorrow",
    logo: "⚡",
  },
  {
    id: 3,
    name: "HealthTech Plus",
    industry: "Healthcare",
    location: "Boston, MA",
    employees: "20-50",
    description: "Revolutionary healthcare technology and telemedicine platform",
    logo: "🏥",
  },
];

export function CompaniesList() {
  const navigate = useNavigate();
  const [companies] = useState(mockCompanies);

  const handleCompanyClick = (companyId) => {
    // Navigate to company profile with the company ID
    navigate(`/alumni/company-profile?id=${companyId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Companies</h1>
          <p className="text-muted-foreground mt-2">
            Manage all your registered companies
          </p>
        </div>
        <Button onClick={() => navigate("/alumni/add-company")}>
          <Building2 className="mr-2 h-4 w-4" />
          Add New Company
        </Button>
      </div>

      {companies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No companies yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first company
            </p>
            <Button onClick={() => navigate("/alumni/add-company")}>
              Add Company
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <Card
              key={company.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
              onClick={() => handleCompanyClick(company.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl">{company.logo}</div>
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {company.industry}
                      </Badge>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {company.description}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {company.location}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {company.employees} employees
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
