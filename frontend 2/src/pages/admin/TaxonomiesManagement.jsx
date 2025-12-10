import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag, 
  GitBranch, 
  Users, 
  Search,
  Link,
  BookOpen
} from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";

const mockSkills = [];
const mockBranches = [];
const mockSynonyms = [];

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [String(value)];
};

export default function TaxonomiesManagement() {
  const [skillSearchTerm, setSkillSearchTerm] = useState("");
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [skills, setSkills] = useState(mockSkills);
  const [branches, setBranches] = useState(mockBranches);
  const [synonyms, setSynonyms] = useState(mockSynonyms);
  const [editingSkill, setEditingSkill] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);
  const [editingSynonym, setEditingSynonym] = useState(null);
  const [newSkill, setNewSkill] = useState({ name: "", category: "", synonyms: "" });
  const [newBranch, setNewBranch] = useState({
    name: "",
    code: "",
    department: "",
    studentCount: 0,
    alumniCount: 0,
    activeJobs: 0,
  });
  const [newSynonym, setNewSynonym] = useState({ primarySkill: "", synonym: "", frequency: 0 });

  // Load real taxonomies (skills/branches) from backend
  useEffect(() => {
    const load = async () => {
      try {
        const { apiFetch } = await import("@/lib/api");
        // If you have real endpoints, replace these mocks with apiFetch calls
        // e.g., const skillRes = await apiFetch("/admin/skills");
        // setSkills(skillRes.skills || []);
        setSkills([]);
        setBranches([]);
        setSynonyms([]);
      } catch (err) {
        console.error("Failed to load taxonomies", err);
      }
    };
    load();
  }, []);

  const normalizedSkills = skills.map((skill) => ({
    ...skill,
    name: skill?.name || "",
    category: skill?.category || "",
    synonyms: toArray(skill?.synonyms),
    jobCount: skill?.jobCount ?? 0,
    userCount: skill?.userCount ?? 0,
  }));

  const filteredSkills = normalizedSkills.filter((skill) =>
    skill.name.toLowerCase().includes(skillSearchTerm.toLowerCase()) ||
    skill.category.toLowerCase().includes(skillSearchTerm.toLowerCase()) ||
    skill.synonyms.some((synonym) =>
      synonym.toLowerCase().includes(skillSearchTerm.toLowerCase())
    )
  );

  const handleAddSkill = () => {
    if (!newSkill.name.trim() || !newSkill.category.trim()) return;
    const synonymsArr = newSkill.synonyms
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setSkills((prev) => [
      ...prev,
      {
        id: `skill-${Date.now()}`,
        name: newSkill.name.trim(),
        category: newSkill.category.trim(),
        synonyms: synonymsArr,
        jobCount: 0,
        userCount: 0,
        trending: false,
      },
    ]);
    setNewSkill({ name: "", category: "", synonyms: "" });
  };

  const handleAddBranch = () => {
    if (!newBranch.name.trim() || !newBranch.code.trim()) return;
    setBranches((prev) => [
      ...prev,
      {
        id: `branch-${Date.now()}`,
        name: newBranch.name.trim(),
        code: newBranch.code.trim(),
        department: newBranch.department.trim(),
        studentCount: Number(newBranch.studentCount) || 0,
        alumniCount: Number(newBranch.alumniCount) || 0,
        activeJobs: Number(newBranch.activeJobs) || 0,
      },
    ]);
    setNewBranch({
      name: "",
      code: "",
      department: "",
      studentCount: 0,
      alumniCount: 0,
      activeJobs: 0,
    });
  };

  const handleAddSynonym = () => {
    if (!newSynonym.primarySkill.trim() || !newSynonym.synonym.trim()) return;
    setSynonyms((prev) => [
      ...prev,
      {
        id: `map-${Date.now()}`,
        primarySkill: newSynonym.primarySkill.trim(),
        synonym: newSynonym.synonym.trim(),
        frequency: Number(newSynonym.frequency) || 0,
      },
    ]);
    setNewSynonym({ primarySkill: "", synonym: "", frequency: 0 });
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(branchSearchTerm.toLowerCase()) ||
    branch.code.toLowerCase().includes(branchSearchTerm.toLowerCase()) ||
    branch.department.toLowerCase().includes(branchSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Taxonomies Management</h1>
          <p className="text-muted-foreground">Manage skills, branches, and data mappings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Skills"
          value="156"
          icon={Tag}
          variant="default"
        />
        <StatCard
          title="Active Branches"
          value="12"
          icon={GitBranch}
          variant="success"
        />
        <StatCard
          title="Skill Mappings"
          value="89"
          icon={Link}
          variant="default"
        />
        <StatCard
          title="Categories"
          value="18"
          icon={BookOpen}
          variant="default"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="skills" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="skills">Skills Management</TabsTrigger>
          <TabsTrigger value="branches">Branch Definitions</TabsTrigger>
          <TabsTrigger value="mappings">Synonym Mappings</TabsTrigger>
        </TabsList>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Skills Database</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search skills, categories, or synonyms..."
                  value={skillSearchTerm}
                  onChange={(e) => setSkillSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  placeholder="Skill name"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill((prev) => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Category"
                  value={newSkill.category}
                  onChange={(e) => setNewSkill((prev) => ({ ...prev, category: e.target.value }))}
                />
                <Input
                  placeholder="Synonyms (comma separated)"
                  value={newSkill.synonyms}
                  onChange={(e) => setNewSkill((prev) => ({ ...prev, synonyms: e.target.value }))}
                />
                <div className="md:col-span-3 flex justify-end">
                  <Button onClick={handleAddSkill} className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Skill Details</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Synonyms</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSkills.map((skill) => (
                    <TableRow key={skill.id} className="hover:bg-muted/50">
                      <TableCell>
                        {editingSkill?.id === skill.id ? (
                          <Input
                            value={editingSkill.name}
                            onChange={(e) =>
                              setEditingSkill((prev) => ({ ...prev, name: e.target.value }))
                            }
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-foreground">{skill.name}</div>
                            {skill.trending && (
                              <Badge variant="secondary" className="bg-success text-success-foreground text-xs">
                                Trending
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingSkill?.id === skill.id ? (
                          <Input
                            value={editingSkill.category}
                            onChange={(e) =>
                              setEditingSkill((prev) => ({ ...prev, category: e.target.value }))
                            }
                          />
                        ) : (
                          <Badge variant="outline" className="text-sm">
                            {skill.category}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingSkill?.id === skill.id ? (
                          <Input
                            value={editingSkill.synonyms.join(", ")}
                            onChange={(e) =>
                              setEditingSkill((prev) => ({
                                ...prev,
                                synonyms: e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              }))
                            }
                          />
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {skill.synonyms.slice(0, 3).map((synonym, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {synonym}
                              </Badge>
                            ))}
                            {skill.synonyms.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{skill.synonyms.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div><span className="text-muted-foreground">Jobs:</span> {skill.jobCount}</div>
                          <div><span className="text-muted-foreground">Users:</span> {skill.userCount}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {editingSkill?.id === skill.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setSkills((prev) =>
                                    prev.map((s) => (s.id === skill.id ? editingSkill : s))
                                  );
                                  setEditingSkill(null);
                                }}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingSkill(null)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingSkill(skill)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() =>
                                  setSkills((prev) => prev.filter((s) => s.id !== skill.id))
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Branch Definitions</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search branches, codes, or departments..."
                  value={branchSearchTerm}
                  onChange={(e) => setBranchSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  placeholder="Branch name"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch((prev) => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Code"
                  value={newBranch.code}
                  onChange={(e) => setNewBranch((prev) => ({ ...prev, code: e.target.value }))}
                />
                <Input
                  placeholder="Department"
                  value={newBranch.department}
                  onChange={(e) => setNewBranch((prev) => ({ ...prev, department: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Students"
                  value={newBranch.studentCount}
                  onChange={(e) =>
                    setNewBranch((prev) => ({ ...prev, studentCount: e.target.value }))
                  }
                />
                <Input
                  type="number"
                  placeholder="Alumni"
                  value={newBranch.alumniCount}
                  onChange={(e) =>
                    setNewBranch((prev) => ({ ...prev, alumniCount: e.target.value }))
                  }
                />
                <Input
                  type="number"
                  placeholder="Active jobs"
                  value={newBranch.activeJobs}
                  onChange={(e) =>
                    setNewBranch((prev) => ({ ...prev, activeJobs: e.target.value }))
                  }
                />
                <div className="md:col-span-3 flex justify-end">
                  <Button onClick={handleAddBranch} className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Branch
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Branch Information</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Current Students</TableHead>
                    <TableHead>Alumni</TableHead>
                    <TableHead>Active Jobs</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBranches.map((branch) => (
                    <TableRow key={branch.id} className="hover:bg-muted/50">
                      <TableCell>
                        {editingBranch?.id === branch.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editingBranch.name}
                              onChange={(e) =>
                                setEditingBranch((prev) => ({ ...prev, name: e.target.value }))
                              }
                            />
                            <Input
                              value={editingBranch.code}
                              onChange={(e) =>
                                setEditingBranch((prev) => ({ ...prev, code: e.target.value }))
                              }
                              placeholder="Code"
                            />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="font-semibold text-foreground">{branch.name}</div>
                            <div className="text-sm text-muted-foreground">Code: {branch.code}</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingBranch?.id === branch.id ? (
                          <Input
                            value={editingBranch.department}
                            onChange={(e) =>
                              setEditingBranch((prev) => ({
                                ...prev,
                                department: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          <Badge variant="outline">{branch.department}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingBranch?.id === branch.id ? (
                          <Input
                            type="number"
                            value={editingBranch.studentCount}
                            onChange={(e) =>
                              setEditingBranch((prev) => ({
                                ...prev,
                                studentCount: Number(e.target.value) || 0,
                              }))
                            }
                          />
                        ) : (
                          <div className="font-semibold">{branch.studentCount.toLocaleString()}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingBranch?.id === branch.id ? (
                          <Input
                            type="number"
                            value={editingBranch.alumniCount}
                            onChange={(e) =>
                              setEditingBranch((prev) => ({
                                ...prev,
                                alumniCount: Number(e.target.value) || 0,
                              }))
                            }
                          />
                        ) : (
                          <div className="font-semibold">{branch.alumniCount.toLocaleString()}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingBranch?.id === branch.id ? (
                          <Input
                            type="number"
                            value={editingBranch.activeJobs}
                            onChange={(e) =>
                              setEditingBranch((prev) => ({
                                ...prev,
                                activeJobs: Number(e.target.value) || 0,
                              }))
                            }
                          />
                        ) : (
                          <div className="font-semibold text-primary">{branch.activeJobs}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {editingBranch?.id === branch.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setBranches((prev) =>
                                    prev.map((b) => (b.id === branch.id ? editingBranch : b))
                                  );
                                  setEditingBranch(null);
                                }}
                              >
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingBranch(null)}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingBranch(branch)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() =>
                                  setSynonyms((prev) => prev.filter((s) => s.id !== mapping.id))
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mappings Tab */}
        <TabsContent value="mappings" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Skill Synonym Mappings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Primary Skill</TableHead>
                    <TableHead>Synonym</TableHead>
                    <TableHead>Usage Frequency</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <Input
                        placeholder="Primary skill"
                        value={newSynonym.primarySkill}
                        onChange={(e) =>
                          setNewSynonym((prev) => ({ ...prev, primarySkill: e.target.value }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Synonym"
                        value={newSynonym.synonym}
                        onChange={(e) => setNewSynonym((prev) => ({ ...prev, synonym: e.target.value }))}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="Frequency"
                        value={newSynonym.frequency}
                        onChange={(e) =>
                          setNewSynonym((prev) => ({ ...prev, frequency: e.target.value }))
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Button onClick={handleAddSynonym} className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Mapping
                      </Button>
                    </TableCell>
                  </TableRow>
                  {synonyms.map((mapping, idx) => (
                    <TableRow key={mapping.id || `map-${idx}`} className="hover:bg-muted/50">
                      <TableCell>
                        {editingSynonym?.id === mapping.id ? (
                          <Input
                            value={editingSynonym.primarySkill}
                            onChange={(e) =>
                              setEditingSynonym((prev) => ({
                                ...prev,
                                primarySkill: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          <div className="font-semibold text-foreground">{mapping.primarySkill}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingSynonym?.id === mapping.id ? (
                          <Input
                            value={editingSynonym.synonym}
                            onChange={(e) =>
                              setEditingSynonym((prev) => ({
                                ...prev,
                                synonym: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          <Badge variant="secondary">{mapping.synonym}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingSynonym?.id === mapping.id ? (
                          <Input
                            type="number"
                            value={editingSynonym.frequency}
                            onChange={(e) =>
                              setEditingSynonym((prev) => ({
                                ...prev,
                                frequency: Number(e.target.value) || 0,
                              }))
                            }
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="font-semibold">{mapping.frequency}</div>
                            <div className="text-xs text-muted-foreground">occurrences</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {editingSynonym?.id === mapping.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setSynonyms((prev) =>
                                    prev.map((s) => (s.id === mapping.id ? editingSynonym : s))
                                  );
                                  setEditingSynonym(null);
                                }}
                              >
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingSynonym(null)}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingSynonym(mapping)}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                                onClick={() =>
                                  setSynonyms((prev) => prev.filter((_, removeIdx) => removeIdx !== idx))
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
