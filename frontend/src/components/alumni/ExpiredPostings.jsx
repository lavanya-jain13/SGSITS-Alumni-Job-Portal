import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for expired postings
const mockExpiredPostings = [
  {
    id: 1,
    title: "Senior Full Stack Developer",
    company: "TechCorp Solutions",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120k - $160k",
    applicants: 45,
    postedDate: "2024-10-15",
    expiryDate: "2024-11-15",
  },
  {
    id: 2,
    title: "Product Manager",
    company: "InnovateLabs",
    location: "Remote",
    type: "Full-time",
    salary: "$100k - $140k",
    applicants: 32,
    postedDate: "2024-09-20",
    expiryDate: "2024-10-20",
  },
  {
    id: 3,
    title: "UX Designer",
    company: "DesignHub Inc",
    location: "New York, NY",
    type: "Contract",
    salary: "$80k - $100k",
    applicants: 28,
    postedDate: "2024-09-10",
    expiryDate: "2024-10-10",
  },
];

export function ExpiredPostings() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [postings, setPostings] = useState(mockExpiredPostings);
  const { toast } = useToast();

  const filteredPostings = postings.filter(posting =>
    posting.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    posting.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRepost = (postingId) => {
    toast({
      title: "Posting Reposted",
      description: "The job posting has been reposted successfully.",
    });
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
        {filteredPostings.length > 0 ? (
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
                    <Badge variant="destructive">Expired on {posting.expiryDate}</Badge>
                  </div>
                </div>

                <div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRepost(posting.id);
                    }}
                    className="w-full sm:w-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Repost
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
