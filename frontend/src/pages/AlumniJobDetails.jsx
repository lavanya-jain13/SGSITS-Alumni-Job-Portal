import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, MapPin, Users, ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function AlumniJobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.getJobById(id);
        setJob(res?.job || null);
      } catch (err) {
        setError(err?.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Card>
          <CardContent className="p-6 text-muted-foreground">Loading...</CardContent>
        </Card>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Card>
          <CardContent className="p-6 text-destructive">
            {error || "Job not found or you are not authorized."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const toList = (val) =>
    val
      ? String(val)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const displayStatus =
    job.status === "active"
      ? "Accepting"
      : job.status === "paused"
      ? "Paused"
      : job.status || "—";

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Postings
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{job.job_title}</span>
            <Badge>{displayStatus}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-muted-foreground">{job.job_description}</div>
          <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location || "—"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{job.job_type || "—"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                Apply by{" "}
                {job.application_deadline
                  ? new Date(job.application_deadline).toLocaleDateString()
                  : "—"}
              </span>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="font-semibold">Allowed Branches</h3>
            <div className="flex flex-wrap gap-2">
              {toList(job.allowed_branches).map((b) => (
                <Badge key={b} variant="secondary">
                  {b}
                </Badge>
              ))}
              {!toList(job.allowed_branches).length && (
                <span className="text-sm text-muted-foreground">None specified</span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {toList(job.skills_required).map((s) => (
                <Badge key={s} variant="secondary">
                  {s}
                </Badge>
              ))}
              {!toList(job.skills_required).length && (
                <span className="text-sm text-muted-foreground">None specified</span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Nice to Have</h3>
            <div className="flex flex-wrap gap-2">
              {toList(job.nice_to_have_skills).map((s) => (
                <Badge key={s} variant="outline">
                  {s}
                </Badge>
              ))}
              {!toList(job.nice_to_have_skills).length && (
                <span className="text-sm text-muted-foreground">None specified</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Compensation</h3>
            <div className="text-sm text-muted-foreground">
              {job.salary_range || job.stipend || job.ctc_type || "—"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
