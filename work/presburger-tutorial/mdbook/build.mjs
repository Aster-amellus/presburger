import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import path from "node:path";
import { resolveBuildDependencies } from "./build-config.mjs";
import { publishBook, stageBook } from "./generator.mjs";

const workspace = path.resolve(import.meta.dirname, "../../..");
const outputs = path.join(workspace, "outputs");
mkdirSync(outputs, { recursive: true });
const staging = mkdtempSync(path.join(outputs, ".presburger-mdbook-"));
const target = path.join(outputs, "presburger-algebra-polyhedral-analysis-mdbook");
const { katexPackageDir, mdbookBin, mdbookGettextBin } = resolveBuildDependencies();

try {
  const manifest = stageBook({
    sourceDir: path.join(workspace, "work/presburger-tutorial/chapters"),
    projectDir: staging,
    katexPackageDir,
    mdbookBin,
    mdbookGettextBin,
    poDir: path.join(import.meta.dirname, "po"),
    runBuild: true,
  });
  publishBook(staging, target);
  process.stdout.write(manifest.mdbookOutput);
  console.log(`pages=${manifest.pages}`);
  console.log(`math=${manifest.math.total}`);
  console.log(`answer_rewrites=${manifest.answerRewrites}`);
  console.log(`frontmatter_rewrites=${manifest.frontmatterRewrites}`);
  console.log(`katex=${manifest.katexVersion}`);
} catch (error) {
  if (existsSync(staging)) rmSync(staging, { recursive: true, force: true });
  throw error;
}
