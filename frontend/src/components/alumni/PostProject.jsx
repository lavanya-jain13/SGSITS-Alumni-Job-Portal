import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiFetch } from "@/lib/api";

const initialForm = {
  project_title: "",
  project_description: "",
  stipend: "",
  skills_required: "",
  duration: "",
  max_applicants_allowed: 50,
  status: "active",
};

export function PostProject() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.project_title || !form.project_description || !form.skills_required || !form.duration) {
      toast({
        title: "Missing required fields",
        description: "Title, description, skills required, and duration are mandatory.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiFetch("/project/post-project", {
        method: "POST",
        body: JSON.stringify({
          project_title: form.project_title,
          project_description: form.project_description,
          stipend: form.stipend || null,
          skills_required: form.skills_required,
          duration: form.duration,
          max_applicants_allowed: Number(form.max_applicants_allowed) || 50,
          status: form.status || "active",
        }),
      });
      toast({ title: "Project posted", description: "Your project has been created." });
      navigate("/alumni/postings");
    } catch (err) {
      toast({
        title: "Failed to post project",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8">
      <div className="space-y-2">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">Post a Project</h1>
        <p className="text-muted-foreground">
          Share project opportunities with students. Required fields are marked with *.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="project_title">Project Title *</Label>
              <Input
                id="project_title"
                value={form.project_title}
                onChange={(e) => updateField("project_title", e.target.value)}
                placeholder="Build a mobile app for campus events"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_description">Project Description *</Label>
              <Textarea
                id="project_description"
                value={form.project_description}
                onChange={(e) => updateField("project_description", e.target.value)}
                placeholder="Explain the project goals, scope, and deliverables..."
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="skills_required">Skills Required *</Label>
                <Textarea
                  id="skills_required"
                  value={form.skills_required}
                  onChange={(e) => updateField("skills_required", e.target.value)}
                  placeholder="React, Node.js, Figma"
                  rows={3}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration *</Label>
                <Input
                  id="duration"
                  value={form.duration}
                  onChange={(e) => updateField("duration", e.target.value)}
                  placeholder="6 weeks"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stipend">Stipend</Label>
                <Input
                  id="stipend"
                  value={form.stipend}
                  onChange={(e) => updateField("stipend", e.target.value)}
                  placeholder="₹10,000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_applicants_allowed">Max Applicants Allowed</Label>
                <Input
                  id="max_applicants_allowed"
                  type="number"
                  min="1"
                  value={form.max_applicants_allowed}
                  onChange={(e) => updateField("max_applicants_allowed", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => updateField("status", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="stopped">Stopped</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setForm(initialForm)}>
                Reset
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
