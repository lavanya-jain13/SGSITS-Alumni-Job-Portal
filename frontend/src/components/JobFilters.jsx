import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const workModes = ["Remote", "On-site", "Hybrid"];
const jobTypes = ["Full-time", "Internship", "Contract", "Part-time"];
const popularSkills = ["React", "Python", "JavaScript", "Java", "Node.js", "AWS", "MongoDB", "SQL"];
const stipendOptions = [
  { id: "u25", label: "Under ₹25k", min: 0, max: 25000 },
  { id: "25-50", label: "₹25k - ₹50k", min: 25000, max: 50000 },
  { id: "50-100", label: "₹50k - ₹1L", min: 50000, max: 100000 },
  { id: "1-3l", label: "₹1L - ₹3L", min: 100000, max: 300000 },
  { id: "3-6l", label: "₹3L - ₹6L", min: 300000, max: 600000 },
  { id: "6l+", label: "₹6L+", min: 600000, max: null },
];

export default function JobFilters({
  filters = {},
  onChange = () => {},
  onClear = () => {},
  branchOptions = [],
}) {
  const {
    branches: selectedBranches = [],
    jobTypes: selectedTypes = [],
    workModes: selectedModes = [],
    experience: selectedExperience = [],
    stipendBands = [],
    skills: selectedSkills = [],
  } = filters;

  const toggleSelection = (value, key, selected) => {
    const exists = selected.includes(value);
    const next = exists ? selected.filter((v) => v !== value) : [...selected, value];
    onChange(key, next);
  };

  const toggleStipend = (id) => {
    const exists = stipendBands.includes(id);
    const next = exists
      ? stipendBands.filter((v) => v !== id)
      : [...stipendBands, id];
    onChange("stipendBands", next);
  };

  const branches =
    branchOptions.length > 0
      ? Array.from(new Set(branchOptions))
      : [
          "Computer Science",
          "Information Technology",
          "Electronics and Telecommunication",
          "Electronics and Instrumentation",
          "Electrical Engineering",
          "Mechanical Engineering",
          "Civil Engineering",
          "Industrial and Production",
          "Biomedical Engineering",
        ];

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Filters</CardTitle>
        <Button
          variant="link"
          className="text-muted-foreground p-0 h-auto w-fit"
          onClick={onClear}
        >
          Clear all
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Branch Filter */}
        <div>
          <h3 className="font-medium mb-3">Branch</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {branches.map((branch) => (
              <div key={branch} className="flex items-center space-x-2">
                <Checkbox
                  id={branch}
                  checked={selectedBranches.includes(branch)}
                  onCheckedChange={() =>
                    toggleSelection(branch, "branches", selectedBranches)
                  }
                />
                <label htmlFor={branch} className="text-sm cursor-pointer">
                  {branch}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Job Type Filter */}
        <div>
          <h3 className="font-medium mb-3">Job Type</h3>
          <div className="space-y-2">
            {jobTypes.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={selectedTypes.includes(type)}
                  onCheckedChange={() =>
                    toggleSelection(type, "jobTypes", selectedTypes)
                  }
                />
                <label htmlFor={type} className="text-sm cursor-pointer">
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Work Mode Filter */}
        <div>
          <h3 className="font-medium mb-3">Work Mode</h3>
          <div className="space-y-2">
            {workModes.map((mode) => (
              <div key={mode} className="flex items-center space-x-2">
                <Checkbox
                  id={mode}
                  checked={selectedModes.includes(mode)}
                  onCheckedChange={() =>
                    toggleSelection(mode, "workModes", selectedModes)
                  }
                />
                <label htmlFor={mode} className="text-sm cursor-pointer">
                  {mode}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Stipend Range Filter */}
        <div>
          <h3 className="font-medium mb-3">Stipend Range</h3>
          <div className="space-y-2">
            {stipendOptions.map((opt) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <Checkbox
                  id={opt.id}
                  checked={stipendBands.includes(opt.id)}
                  onCheckedChange={() => toggleStipend(opt.id)}
                />
                <label htmlFor={opt.id} className="text-sm cursor-pointer">
                  {opt.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Popular Skills */}
        <div>
          <h3 className="font-medium mb-3">Popular Skills</h3>
          <div className="flex flex-wrap gap-2">
            {popularSkills.map((skill) => {
              const active = selectedSkills.includes(skill);
              return (
                <Badge
                  key={skill}
                  variant={active ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleSelection(skill, "skills", selectedSkills)}
                >
                  {skill}
                </Badge>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
