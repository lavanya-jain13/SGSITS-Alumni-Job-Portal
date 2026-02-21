import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Star, Building2, Users, Briefcase, ChevronDown, ChevronUp } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function CompaniesManagement() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedCompanyId, setExpandedCompanyId] = useState(null);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const [pendingRes, usersRes, statsRes, jobsRes] = await Promise.all([
        apiClient.adminPendingAlumni(),
        apiClient.adminUsers(),
        apiClient.adminStats(),
        apiClient.adminJobs(),
      ]);

      // derive company meta from jobs (industry, size, active jobs)
      const companyMeta = {};
      (jobsRes || []).forEach((job) => {
        const companyId = job.company_id;
        if (!companyId) return;
        const jobStatus = (job.job_status || job.status || "").toLowerCase();
        if (!companyMeta[companyId]) {
          companyMeta[companyId] = {
            industry: job.company_industry || job.industry || null,
            company_size: job.company_size || null,
            activeJobs: 0,
            totalHires: 0, // no hires data available
          };
        }
        if (jobStatus === "active") {
          companyMeta[companyId].activeJobs += 1;
        }
      });

      const pendingCompanies =
        (pendingRes || []).map((p) => ({
          id: p.company_id,
          name: p.company_name || p.name,
          status: p.company_status || "pending",
          registeredAt: p.company_created_at || p.created_at,
          email: p.email,
          alumniName: p.name || null,
          alumniEmail: p.email || null,
          contactPhone: p.contact_person_phone || null,
          documentUrl: p.document_url || null,
          industry: p.company_industry || companyMeta[p.company_id]?.industry || null,
          company_size: p.company_size || companyMeta[p.company_id]?.company_size || null,
          activeJobs: companyMeta[p.company_id]?.activeJobs || 0,
          totalHires: companyMeta[p.company_id]?.totalHires || 0,
        })) || [];

      const alumniCompanies =
        (usersRes?.alumni || [])
          .filter((a) => a.company_id)
          .map((a) => ({
            id: a.company_id,
            name: a.company_name,
            status: a.company_status || a.status || "pending",
            registeredAt: a.company_created_at || a.created_at,
            email: a.email,
            alumniName: a.name || null,
            alumniEmail: a.email || null,
            contactPhone: a.contact_person_phone || null,
            documentUrl: a.document_url || null,
            industry: a.company_industry || companyMeta[a.company_id]?.industry || null,
            company_size: a.company_size || companyMeta[a.company_id]?.company_size || null,
            activeJobs: companyMeta[a.company_id]?.activeJobs || 0,
            totalHires: companyMeta[a.company_id]?.totalHires || 0,
          })) || [];

      // merge by id to avoid duplicates
      const merged = {};
      [...pendingCompanies, ...alumniCompanies].forEach((c) => {
        if (!c.id) return;
        const prev = merged[c.id] || {};
        merged[c.id] = {
          ...prev,
          ...c,
          name: c.name || prev.name,
          status: c.status || prev.status,
          registeredAt: c.registeredAt || prev.registeredAt,
          email: c.email || prev.email,
          alumniName: c.alumniName || prev.alumniName,
          alumniEmail: c.alumniEmail || prev.alumniEmail,
          contactPhone: c.contactPhone || prev.contactPhone,
          documentUrl: c.documentUrl || prev.documentUrl,
          industry: c.industry || prev.industry,
          company_size: c.company_size || prev.company_size,
          activeJobs: c.activeJobs ?? prev.activeJobs,
          totalHires: c.totalHires ?? prev.totalHires,
        };
      });

      setCompanies(Object.values(merged));
      setStats(statsRes || {});
    } catch (err) {
      toast({
        title: "Failed to load companies",
        description: err.message || "Unable to fetch company data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const status = (company.status || "pending").toLowerCase();
      const matchesSearch =
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [companies, searchTerm, statusFilter]);

  const getStatusVariant = (status) => {
    switch (status) {
      case "approved": return "default";
      case "featured": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      case "flagged": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "bg-success text-success-foreground";
      case "featured": return "bg-primary text-primary-foreground";
      case "pending": return "bg-warning text-warning-foreground";
      case "rejected": return "bg-destructive text-destructive-foreground";
      case "flagged": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const handleCompanyAction = async (companyId, action) => {
    if (!companyId) return;
    try {
      if (action === "approve") {
        await apiClient.adminApproveCompany(companyId);
      } else {
        await apiClient.adminRejectCompany(companyId);
      }
      toast({
        title: `Company ${action === "approve" ? "approved" : "rejected"}`,
      });
      await loadCompanies();
    } catch (err) {
      toast({
        title: "Action failed",
        description: err.message || "Could not update company",
        variant: "destructive",
      });
    }
  };

  const totalCompanies = stats?.approvedCompanies ?? 0;
  const pendingCompanies = stats?.pendingCompanies ?? 0;
  const totalJobs = stats?.totalJobs ?? 0;

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Companies Management</h1>
          <p className="text-muted-foreground">Manage company registrations and partnerships</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Companies"
          value={totalCompanies + pendingCompanies}
          icon={Building2}
          variant="default"
        />
        <StatCard
          title="Pending Approval"
          value={pendingCompanies}
          icon={Users}
          variant="warning"
        />
        <StatCard
          title="Featured Partners"
          value={Math.max(totalCompanies - pendingCompanies, 0)}
          icon={Star}
          variant="success"
        />
        <StatCard
          title="Active Job Postings"
          value={totalJobs}
          icon={Briefcase}
          variant="default"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search companies by name, industry, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Company Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company Details</TableHead>
                  <TableHead>Industry & Size</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompanies.map((company) => {
                  const isExpanded = expandedCompanyId === company.id;
                  return (
                    <Fragment key={company.id}>
                    <TableRow className="hover:bg-muted/50">
                      <TableCell>
                        <div
                          role="button"
                          tabIndex={0}
                          onClick={() => navigate(`/company/${company.id}`)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              navigate(`/company/${company.id}`);
                            }
                          }}
                          className="space-y-1 cursor-pointer"
                        >
                          <div className="font-semibold text-foreground hover:underline">
                            {company.name}
                          </div>
                          {company.email && (
                            <div className="text-sm text-muted-foreground">{company.email}</div>
                          )}
                          {company.registeredAt && (
                            <div className="text-xs text-muted-foreground">Registered: {company.registeredAt}</div>
                          )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{company.industry || "N/A"}</div>
                            <div className="text-xs text-muted-foreground">
                              {company.company_size || "Size N/A"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              Active Jobs: <span className="font-semibold">{company.activeJobs ?? 0}</span>
                            </div>
                            <div className="text-sm">
                              Total Hires: <span className="font-semibold">{company.totalHires ?? 0}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getStatusVariant((company.status || "pending").toLowerCase())}
                            className={`${getStatusColor((company.status || "pending").toLowerCase())} font-medium`}
                          >
                            {company.status || "pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={loading}
                              onClick={() => handleCompanyAction(company.id, "approve")}
                              className="text-success border-success hover:bg-success hover:text-success-foreground"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={loading}
                              onClick={() => handleCompanyAction(company.id, "reject")}
                              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                            >
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                setExpandedCompanyId((prev) =>
                                  prev === company.id ? null : company.id
                                )
                              }
                              className="text-muted-foreground"
                            >
                              {isExpanded ? "Hide Details" : "View Details"}
                              {isExpanded ? (
                                <ChevronUp className="ml-1 h-4 w-4" />
                              ) : (
                                <ChevronDown className="ml-1 h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={5}>
                            <Card className="border-border">
                              <CardContent className="p-6">
                                <div className="flex flex-col gap-4">
                                  <div className="flex items-center justify-between">
                                    <div className="text-sm font-semibold text-foreground">
                                      Admin-Only Details
                                    </div>
                                    <Badge
                                      variant={getStatusVariant((company.status || "pending").toLowerCase())}
                                      className={`${getStatusColor((company.status || "pending").toLowerCase())} font-medium`}
                                    >
                                      {company.status || "pending"}
                                    </Badge>
                                  </div>
                                  <Separator />
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="text-sm text-muted-foreground">Alumni Name</span>
                                      <span className="text-sm text-foreground">{company.alumniName || "—"}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="text-sm text-muted-foreground">Alumni Email</span>
                                      <span className="text-sm text-foreground">{company.alumniEmail || "—"}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="text-sm text-muted-foreground">Contact Phone</span>
                                      <span className="text-sm text-foreground">{company.contactPhone || "—"}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="text-sm text-muted-foreground">Registration Date</span>
                                      <span className="text-sm text-foreground">{company.registeredAt || "—"}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                      <span className="text-sm text-muted-foreground">Internal Status</span>
                                      <span className="text-sm text-foreground">{company.status || "pending"}</span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
