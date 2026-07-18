// Shared helpers for parsing, normalizing, and matching skills across
// applicant views. Skills arrive in many shapes from the API:
//   - plain string ("react, node, aws")
//   - JSON string ('["react","node"]')
//   - JSON string of objects ('[{"name":"Vue.js","proficiency":3,"experience":3}]')
//   - array of strings (["react","node"])
//   - array of objects ([{name:"Vue.js",...}])
// These helpers collapse all of that to a consistent string array.

const SKILL_ALIASES = {
  js: "javascript",
  javascript: "javascript",
  ecmascript: "javascript",
  ts: "typescript",
  typescript: "typescript",
  react: "react",
  reactjs: "react",
  "react.js": "react",
  vue: "vue",
  vuejs: "vue",
  "vue.js": "vue",
  angular: "angular",
  angularjs: "angular",
  node: "node",
  nodejs: "node",
  "node.js": "node",
  python: "python",
  py: "python",
  golang: "go",
  go: "go",
  cpp: "c++",
  "c++": "c++",
  csharp: "c#",
  "c#": "c#",
  postgres: "postgresql",
  postgresql: "postgresql",
  mongo: "mongodb",
  mongodb: "mongodb",
  aws: "aws",
  gcp: "gcp",
  azure: "azure",
  docker: "docker",
  k8s: "kubernetes",
  kubernetes: "kubernetes",
  ml: "machine learning",
  ai: "artificial intelligence",
  "machine learning": "machine learning",
  "deep learning": "deep learning",
  html: "html",
  css: "css",
  sql: "sql",
  nosql: "nosql",
  rest: "rest",
  graphql: "graphql",
};

// Extract a human-readable skill name from any shape.
export const extractSkillName = (skill) => {
  if (skill === null || skill === undefined) return "";
  if (typeof skill === "string") {
    const trimmed = skill.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object") {
          return String(parsed.name || parsed.skill || parsed.title || "").trim();
        }
      } catch (_err) {
        return trimmed;
      }
    }
    return trimmed;
  }
  if (typeof skill === "object") {
    return String(skill.name || skill.skill || skill.title || "").trim();
  }
  return String(skill).trim();
};

export const normalizeSkill = (s) => {
  if (!s) return "";
  const cleaned = String(s)
    .toLowerCase()
    .replace(/[^a-z0-9+.#\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return SKILL_ALIASES[cleaned] || cleaned;
};

// Turn whatever the API sent into a clean array of display-ready skill names.
export const splitSkills = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(extractSkillName).filter(Boolean);
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(extractSkillName).filter(Boolean);
    }
    if (parsed && typeof parsed === "object") {
      const named = extractSkillName(parsed);
      return named ? [named] : [];
    }
  } catch (_err) {
    // fall back to delimiter split
  }

  const cleaned = String(value).replace(/[{}[\]"']/g, ""); // strip PG array brackets/quotes
  const primarySplit = cleaned
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (primarySplit.length > 1) return primarySplit.filter(Boolean);
  return cleaned
    .split(/\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
};

export const uniqueSkills = (skills = []) => {
  const seen = new Set();
  return skills.filter((skill) => {
    const key = normalizeSkill(skill);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

// Frameworks imply their base language. If the applicant knows a framework we
// treat the underlying language as also known. Kept intentionally small — extend
// as needed rather than trying to encyclopedically map every skill.
const SKILL_IMPLIES = {
  react: ["javascript"],
  "react.js": ["javascript"],
  vue: ["javascript"],
  "vue.js": ["javascript"],
  angular: ["javascript", "typescript"],
  node: ["javascript"],
  "node.js": ["javascript"],
  express: ["javascript", "node"],
  nextjs: ["javascript", "react"],
  "next.js": ["javascript", "react"],
  typescript: ["javascript"],
  jquery: ["javascript"],
  django: ["python"],
  flask: ["python"],
  fastapi: ["python"],
  pytorch: ["python"],
  tensorflow: ["python"],
  numpy: ["python"],
  pandas: ["python"],
  spring: ["java"],
  "spring boot": ["java"],
  hibernate: ["java"],
  rails: ["ruby"],
  "ruby on rails": ["ruby"],
  laravel: ["php"],
  ".net": ["c#"],
  dotnet: ["c#"],
  swiftui: ["swift"],
  jetpack: ["kotlin"],
  kubernetes: ["docker"],
  k8s: ["docker"],
  postgres: ["sql"],
  postgresql: ["sql"],
  mysql: ["sql"],
  mongodb: ["nosql"],
  redis: ["nosql"],
  graphql: ["rest"],
};

// Expand a set of student skills to include everything those skills imply.
// Called once per applicant, not per required skill.
export const expandStudentSkills = (studentList = []) => {
  const expanded = new Set(studentList);
  studentList.forEach((s) => {
    const implied = SKILL_IMPLIES[s];
    if (implied) implied.forEach((i) => expanded.add(i));
  });
  return expanded;
};

// A required skill is a "hit" if any student skill (or an implied one) matches
// exactly OR contains it as a whole word (so "aws certified developer" satisfies
// a required "aws", and a Vue.js developer satisfies a required "javascript").
// Callers should pass the already-expanded student set — expandStudentSkills()
// handles the implied-skill expansion once per applicant.
export const skillsMatch = (required, studentSet, studentList) => {
  if (!required) return false;
  if (studentSet.has(required)) return true;
  return studentList.some((student) => {
    if (!student) return false;
    if (student === required) return true;
    const escaped = required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(^|\\W)${escaped}(\\W|$)`);
    return re.test(student);
  });
};

export const computeMatch = (studentSkills = [], requiredSkills = []) => {
  const req = Array.from(new Set(requiredSkills.map(normalizeSkill).filter(Boolean)));
  const stud = Array.from(new Set(studentSkills.map(normalizeSkill).filter(Boolean)));
  if (!req.length) return null;
  const studentSet = expandStudentSkills(stud);
  const studentList = Array.from(studentSet);
  const hits = req.filter((r) => skillsMatch(r, studentSet, studentList)).length;
  return Math.round((hits / req.length) * 100);
};

export const splitAchievements = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map((s) => String(s).trim());
  return String(value)
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean);
};
