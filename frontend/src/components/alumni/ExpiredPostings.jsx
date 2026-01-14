import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, DollarSign, Users, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

export function ExpiredPostings() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [repostingId, setRepostingId] = useState(null);

  useEffect(() => {
    const fetchExpired = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getMyJobs();
        const normalized =
          data?.jobs
            ?.filter((job) => job.status && job.status !== "active")
            .map((job) => ({
              id: job.id,
              title: job.job_title,
              company: job.company_name || "My Company",
              location: job.location || "—",
              type: job.job_type || "Job",
              salary: job.salary_range || job.stipend || "—",
              applicants: job.applicant_count || 0,
              status: job.status,
            })) || [];
        setPostings(normalized);
      } catch (error) {
        toast({
          title: "Failed to load expired postings",
          description: error?.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchExpired();
  }, [toast]);

  const filteredPostings = postings.filter(posting =>
    posting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    posting.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRepost = async (postingId) => {
    setRepostingId(postingId);
    try {
      await apiClient.repostJob(postingId);
      setPostings((prev) => prev.filter((p) => p.id !== postingId));
      toast({ title: "Posting republished", description: "Status set to active." });
    } catch (error) {
      toast({
        title: "Failed to repost",
        description: error?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setRepostingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Expired Postings</h1>
        <p className="text-muted-foreground mt-2">
          Review and reactivate your expired job postings
        </p>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expired postings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Postings List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">Loading expired postings...</p>
          </Card>
        ) : filteredPostings.length > 0 ? (
          filteredPostings.map((posting) => (
            <Card key={posting.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div 
                  className="space-y-3 flex-1"
                  onClick={() => navigate('/alumni/job-details', { state: { job: posting } })}
                >
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-1">
                      {posting.title}
                    </h3>
                    <p className="text-muted-foreground">{posting.company}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {posting.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {posting.salary}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/alumni/applications?jobId=${posting.id}`);
                      }}
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <Users className="h-4 w-4" />
                      {posting.applicants} applicants
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{posting.type}</Badge>
                    <Badge variant="destructive">{posting.status || "Expired"}</Badge>
                  </div>
                </div>

                <div>
                  <Button
                    disabled={repostingId === posting.id}
                    onClick={async (e) => {
                      e.stopPropagation();
                      await handleRepost(posting.id);
                    }}
                    className="w-full sm:w-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {repostingId === posting.id ? "Reposting..." : "Repost"}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No expired postings found</p>
          </Card>
        )}
      </div>
    </div>
  );
}
