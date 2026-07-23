import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const WORKSPACE = path.resolve(import.meta.dirname, "../../../..");
const WORKFLOW = path.join(WORKSPACE, ".github/workflows/presburger-pages.yml");

test("Pages workflow builds and deploys the generated book", () => {
  assert(existsSync(WORKFLOW), "Pages workflow is missing");
  const workflow = readFileSync(WORKFLOW, "utf8");

  assert.match(workflow, /push:[\s\S]*main/);
  assert.match(workflow, /CLOUDFLARE_API_TOKEN/);
  assert.match(workflow, /CLOUDFLARE_ACCOUNT_ID/);
  assert.match(workflow, /presburger-algebra-polyhedral-analysis-mdbook\/book/);
  assert.match(workflow, /--project-name=presburger/);
  assert.match(workflow, /github\.event\.pull_request\.head\.repo\.full_name == github\.repository/);
});
