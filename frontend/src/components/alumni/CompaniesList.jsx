import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, MapPin, Users, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function CompaniesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getMyCompanies();
        setCompanies(data?.companies || []);
      } catch (error) {
        toast({
          title: "Failed to load companies",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [toast]);

  const handleCompanyClick = (companyId) => {
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

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading companies...
          </CardContent>
        </Card>
      ) : companies.length === 0 ? (
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
          {companies.map((company) => {
            const firstLocation =
              company.office_locations?.[0] || company.location || "—";
            const cultureSnippet = company.company_culture || company.about || "No description provided.";
            return (
            <Card
              key={company.id}
              className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
              onClick={() => handleCompanyClick(company.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-4xl">{company.name?.charAt(0) || "🏢"}</div>
                    <div>
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {company.industry || "—"}
                      </Badge>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {cultureSnippet}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {firstLocation}
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Users className="mr-2 h-4 w-4" />
                    {company.company_size || "—"} {company.company_size ? "employees" : ""}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
          })}
        </div>
      )}
    </div>
  );
}
