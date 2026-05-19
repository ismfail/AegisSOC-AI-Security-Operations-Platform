import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const requiredFiles = [
  "app/page.tsx",
  "app/detections/page.tsx",
  "app/compliance/page.tsx",
  "app/incidents/[id]/page.tsx",
  "app/api/analyst/route.ts",
  "app/api/correlation/route.ts",
  "app/api/detections/export/route.ts",
  "app/api/evals/route.ts",
  "app/api/stix/route.ts",
  "lib/security-data.ts",
  "lib/analytics.ts",
  "lib/correlation-engine.ts",
  "lib/detection-export.ts",
  "database/schema.sql",
  "database/seed.sql",
  "services/api/main.py",
  "docker-compose.yml",
  ".github/workflows/ci.yml"
];

const requiredSchemaTokens = [
  "CREATE TABLE incidents",
  "CREATE TABLE security_events",
  "CREATE TABLE threat_notes",
  "CREATE TABLE playbook_executions",
  "CREATE TABLE audit_log",
  "embedding vector(1536)"
];

const requiredDataTokens = [
  "detectionRules",
  "complianceControls",
  "evaluationCases",
  "auditEvents",
  "INC-2407",
  "DET-101"
];

const missingFiles = requiredFiles.filter((file) => !existsSync(join(root, file)));

if (missingFiles.length) {
  throw new Error(`Missing required files: ${missingFiles.join(", ")}`);
}

const schema = readFileSync(join(root, "database/schema.sql"), "utf8");
const data = readFileSync(join(root, "lib/security-data.ts"), "utf8");
const home = readFileSync(join(root, "app/page.tsx"), "utf8");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));

for (const token of requiredSchemaTokens) {
  if (!schema.includes(token)) {
    throw new Error(`Schema is missing token: ${token}`);
  }
}

for (const token of requiredDataTokens) {
  if (!data.includes(token)) {
    throw new Error(`Security data is missing token: ${token}`);
  }
}

for (const route of ["/detections", "/compliance", "/api/stix", "/api/detections/export"]) {
  if (!home.includes(route)) {
    throw new Error(`Home page is missing navigation to ${route}`);
  }
}

if (packageJson.scripts?.build !== "next build") {
  throw new Error("package.json must define the production Next.js build script.");
}

console.log("AegisSOC platform validation passed.");
