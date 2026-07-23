import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  CHAPTERS,
  LOCALES,
  addStableHeadingIds,
  assertIdContract,
  collectIds,
  countMath,
  makeSummary,
  rewriteMarkdown,
  rewriteInlineCodeMath,
  rewriteMathDelimitersForMdBook,
} from "./lib.mjs";
import { REQUIRED_TOOL_VERSIONS } from "./build-config.mjs";
import {
  BOOK_CSS,
  LANGUAGE_SWITCHER_JS,
  MATH_RENDER_JS,
  README_MD,
  makeBookToml,
} from "./templates.mjs";

const REQUIRED_KATEX_VERSION = "0.16.22";
const REQUIRED_MERMAID_VERSION = "11.16.0";
const DEFAULT_MERMAID_PACKAGE = path.join(import.meta.dirname, "node_modules/mermaid");
const WORKSPACE_ROOT = path.resolve(import.meta.dirname, "../../..");

function readKatexVersion(katexPackageDir) {
  const packageJson = JSON.parse(readFileSync(path.join(katexPackageDir, "package.json"), "utf8"));
  if (packageJson.version !== REQUIRED_KATEX_VERSION) {
    throw new Error(
      `KaTeX version ${REQUIRED_KATEX_VERSION} required; found ${packageJson.version ?? "unknown"}`,
    );
  }
  return packageJson.version;
}

function readMermaidVersion(mermaidPackageDir) {
  const packageJson = JSON.parse(readFileSync(path.join(mermaidPackageDir, "package.json"), "utf8"));
  if (packageJson.version !== REQUIRED_MERMAID_VERSION) {
    throw new Error(
      "Mermaid version " + REQUIRED_MERMAID_VERSION + " required; found "
      + (packageJson.version ?? "unknown"),
    );
  }
  return packageJson.version;
}

function prepareChapters(sourceDir) {
  const generated = [];
  const ids = { questions: [], answers: [], anchors: [], answerIndexes: [] };
  const manifest = {
    pages: 0,
    answerRewrites: 0,
    frontmatterRewrites: 0,
    math: { inline: 0, display: 0, total: 0 },
  };

  for (const entry of CHAPTERS) {
    const sourcePath = path.join(sourceDir, path.basename(entry.source));
    const source = readFileSync(sourcePath, "utf8");
    const rewritten = rewriteMarkdown(entry, source);
    const mathRewritten = rewriteInlineCodeMath(rewritten.text);
    const pageIds = collectIds(mathRewritten);
    const pageMath = countMath(mathRewritten, sourcePath);

    generated.push({
      target: entry.target,
      text: addStableHeadingIds(rewriteMathDelimitersForMdBook(mathRewritten)),
    });
    manifest.pages += 1;
    manifest.answerRewrites += rewritten.answerRewrites;
    manifest.frontmatterRewrites += rewritten.frontmatterRewrites;
    manifest.math.inline += pageMath.inline;
    manifest.math.display += pageMath.display;
    manifest.math.total += pageMath.total;
    ids.questions.push(...pageIds.questions);
    ids.answers.push(...pageIds.answers);
    ids.anchors.push(...pageIds.anchors);
    ids.answerIndexes.push(...pageIds.answerIndexes);
  }

  if (manifest.pages !== 14) throw new Error(`Expected 14 pages; found ${manifest.pages}`);
  if (manifest.answerRewrites !== 78) {
    throw new Error(`Expected 78 answer rewrites; found ${manifest.answerRewrites}`);
  }
  if (manifest.frontmatterRewrites !== 2) {
    throw new Error(`Expected 2 frontmatter rewrites; found ${manifest.frontmatterRewrites}`);
  }
  if (manifest.math.total !== 2405) {
    throw new Error(`Expected 2405 math objects; found ${manifest.math.total}`);
  }
  assertIdContract(ids, 78);

  return { generated, manifest };
}

function requireEmptyProject(projectDir) {
  if (existsSync(projectDir)) {
    if (!statSync(projectDir).isDirectory()) throw new Error(`Project path is not a directory: ${projectDir}`);
    if (readdirSync(projectDir).length !== 0) throw new Error(`Project directory is not empty: ${projectDir}`);
  } else {
    mkdirSync(projectDir, { recursive: true });
  }
}

function copyKatex(katexPackageDir, projectDir) {
  const destination = path.join(projectDir, "theme/katex");
  cpSync(path.join(katexPackageDir, "dist/katex.min.js"), path.join(destination, "katex.min.js"));
  cpSync(path.join(katexPackageDir, "dist/katex.min.css"), path.join(destination, "katex.min.css"));
  cpSync(
    path.join(katexPackageDir, "dist/contrib/auto-render.min.js"),
    path.join(destination, "auto-render.min.js"),
  );
  cpSync(path.join(katexPackageDir, "dist/fonts"), path.join(destination, "fonts"), { recursive: true });
  cpSync(path.join(katexPackageDir, "LICENSE"), path.join(destination, "LICENSE"));
}

function copyBuiltKatexAssets(projectDir, outputDir) {
  const source = path.join(projectDir, "theme/katex");
  const destination = path.join(outputDir, "theme/katex");
  mkdirSync(destination, { recursive: true });
  cpSync(path.join(source, "fonts"), path.join(destination, "fonts"), { recursive: true });
  cpSync(path.join(source, "LICENSE"), path.join(destination, "LICENSE"));
}

function copyMermaid(mermaidPackageDir, projectDir) {
  const destination = path.join(projectDir, "theme/mermaid");
  mkdirSync(destination, { recursive: true });
  cpSync(
    path.join(mermaidPackageDir, "dist/mermaid.min.js"),
    path.join(destination, "mermaid.min.js"),
  );
  cpSync(path.join(mermaidPackageDir, "LICENSE"), path.join(destination, "LICENSE"));
}

function copyBuiltMermaidAssets(projectDir, outputDir) {
  const source = path.join(projectDir, "theme/mermaid");
  const destination = path.join(outputDir, "theme/mermaid");
  mkdirSync(destination, { recursive: true });
  cpSync(source, destination, { recursive: true });
}

export function stageBook({
  sourceDir,
  projectDir,
  poDir,
  katexPackageDir,
  mermaidPackageDir = DEFAULT_MERMAID_PACKAGE,
  mdbookBin,
  mdbookGettextBin = "mdbook-gettext",
  runBuild = false,
}) {
  const katexVersion = readKatexVersion(katexPackageDir);
  const mermaidVersion = readMermaidVersion(mermaidPackageDir);
  const { generated, manifest } = prepareChapters(sourceDir);
  requireEmptyProject(projectDir);

  mkdirSync(path.join(projectDir, "src"), { recursive: true });
  mkdirSync(path.join(projectDir, "theme/katex/fonts"), { recursive: true });
  for (const page of generated) {
    writeFileSync(path.join(projectDir, "src", page.target), page.text);
  }
  writeFileSync(path.join(projectDir, "src/SUMMARY.md"), makeSummary());
  writeFileSync(path.join(projectDir, "book.toml"), makeBookToml());
  writeFileSync(path.join(projectDir, "README.md"), README_MD);
  writeFileSync(path.join(projectDir, "theme/book.css"), BOOK_CSS);
  writeFileSync(path.join(projectDir, "theme/math-render.js"), MATH_RENDER_JS);
  writeFileSync(path.join(projectDir, "theme/language-switcher.js"), LANGUAGE_SWITCHER_JS);
  if (poDir !== undefined && existsSync(poDir)) {
    cpSync(poDir, path.join(projectDir, "po"), { recursive: true });
  }
  copyKatex(katexPackageDir, projectDir);
  copyMermaid(mermaidPackageDir, projectDir);

  let mdbookOutput = "";
  if (runBuild) {
    assertToolVersion(
      mdbookBin,
      "mdBook",
      REQUIRED_TOOL_VERSIONS.mdbook,
    );

    for (const locale of LOCALES) {
      writeFileSync(
        path.join(projectDir, "book.toml"),
        makeBookToml({ locale, gettextCommand: mdbookGettextBin }),
      );
      const outputDir = path.join(projectDir, locale.outputDir);
      const result = spawnSync(
        mdbookBin,
        ["build", projectDir, "--dest-dir", outputDir],
        { encoding: "utf8" },
      );
      const output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
      mdbookOutput += output;
      if (result.error) throw new Error(`Unable to run mdBook: ${result.error.message}`);
      if (result.status !== 0) {
        throw new Error(
          `mdBook build for ${locale.code} failed with exit ${result.status}\n${output}`,
        );
      }
      copyBuiltKatexAssets(projectDir, outputDir);
      copyBuiltMermaidAssets(projectDir, outputDir);
    }
    writeFileSync(path.join(projectDir, "book.toml"), makeBookToml());
  }

  return {
    ...manifest,
    katexVersion,
    mermaidVersion,
    built: runBuild,
    locales: LOCALES.map(({ code, outputDir }) => ({ code, outputDir })),
    mdbookOutput,
  };
}

function assertToolVersion(binary, name, requiredVersion) {
  const result = spawnSync(binary, ["--version"], { encoding: "utf8" });
  if (result.error) throw new Error(`Unable to run ${name}: ${result.error.message}`);
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
  if (result.status !== 0 || !new RegExp(`(?:^|\\s)v?${requiredVersion.replaceAll(".", "\\.")}(?:\\s|$)`).test(output)) {
    throw new Error(`${name} version ${requiredVersion} required; found ${output || "unknown"}`);
  }
}

function assertSafeTarget(target) {
  const resolved = path.resolve(target);
  const root = path.parse(resolved).root;
  const forbidden = new Set([root, path.resolve(homedir()), WORKSPACE_ROOT]);
  if (forbidden.has(resolved)) throw new Error(`Unsafe publication target: ${resolved}`);
  return resolved;
}

export function publishBook(staging, target) {
  const resolvedStaging = path.resolve(staging);
  const resolvedTarget = assertSafeTarget(target);
  const backup = `${resolvedTarget}.previous`;
  const targetParent = path.dirname(resolvedTarget);

  if (resolvedStaging === resolvedTarget || resolvedStaging === backup) {
    throw new Error(`Staging path collides with publication path: ${resolvedStaging}`);
  }
  if (!statSync(resolvedStaging).isDirectory()) {
    throw new Error(`Staging path is not a directory: ${resolvedStaging}`);
  }
  if (statSync(resolvedStaging).dev !== statSync(targetParent).dev) {
    throw new Error("Staging and publication target must be on the same filesystem");
  }

  if (existsSync(backup)) rmSync(backup, { recursive: true, force: true });
  const hadTarget = existsSync(resolvedTarget);
  if (hadTarget) renameSync(resolvedTarget, backup);

  try {
    renameSync(resolvedStaging, resolvedTarget);
  } catch (error) {
    if (hadTarget && existsSync(backup) && !existsSync(resolvedTarget)) {
      renameSync(backup, resolvedTarget);
    }
    throw error;
  }

  if (hadTarget && existsSync(backup)) rmSync(backup, { recursive: true, force: true });
}
