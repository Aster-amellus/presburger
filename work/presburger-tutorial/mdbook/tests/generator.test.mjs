import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { resolveBuildDependencies } from "../build-config.mjs";
import { publishBook, stageBook } from "../generator.mjs";

const CANONICAL_SOURCE = path.resolve(import.meta.dirname, "../../chapters");
const { katexPackageDir: KATEX_PACKAGE, mdbookBin: MDBOOK_BIN } = resolveBuildDependencies();
const WORKSPACE = path.resolve(import.meta.dirname, "../../../..");

const EXPECTED_BOOK_TOML = `[book]
title = "Presburger Algebra 与 Polyhedral Analysis"
language = "zh-CN"
multilingual = false
src = "src"

[build]
build-dir = "book"
create-missing = false

[output.html]
default-theme = "light"
preferred-dark-theme = "navy"
smart-punctuation = false
mathjax-support = false
copy-fonts = true
additional-css = ["theme/katex/katex.min.css", "theme/book.css"]
additional-js = [
  "theme/katex/katex.min.js",
  "theme/katex/auto-render.min.js",
  "theme/mermaid/mermaid.min.js",
  "theme/math-render.js",
]

[output.html.search]
enable = true
limit-results = 30
use-boolean-and = true
`;

function temporaryDirectory(t) {
  const temporary = mkdtempSync(path.join(tmpdir(), "presburger-mdbook-test-"));
  t.after(() => rmSync(temporary, { recursive: true, force: true }));
  return temporary;
}

test("stageBook creates a complete offline source tree", (t) => {
  const temporary = temporaryDirectory(t);
  const project = path.join(temporary, "project");
  const manifest = stageBook({
    sourceDir: CANONICAL_SOURCE,
    projectDir: project,
    katexPackageDir: KATEX_PACKAGE,
    mdbookBin: MDBOOK_BIN,
    runBuild: false,
  });

  assert.equal(manifest.pages, 14);
  assert.equal(manifest.answerRewrites, 78);
  assert.equal(manifest.frontmatterRewrites, 2);
  assert.deepEqual(manifest.math, { inline: 1985, display: 420, total: 2405 });
  for (const required of [
    "book.toml",
    "README.md",
    "src/SUMMARY.md",
    "src/README.md",
    "src/appendices.md",
    "theme/katex/katex.min.js",
    "theme/katex/auto-render.min.js",
    "theme/katex/katex.min.css",
    "theme/katex/LICENSE",
    "theme/mermaid/mermaid.min.js",
  ]) {
    assert(existsSync(path.join(project, required)), required);
  }
  assert.equal(readFileSync(path.join(project, "book.toml"), "utf8"), EXPECTED_BOOK_TOML);
  assert.match(readFileSync(path.join(project, "README.md"), "utf8"), /mdbook build/);
  assert.match(readFileSync(path.join(project, "README.md"), "utf8"), /KaTeX 0\.16\.22/);
  assert.equal(manifest.katexVersion, "0.16.22");
  assert.equal(manifest.built, false);
  assert(existsSync(path.join(project, "theme/katex/fonts/KaTeX_Main-Regular.woff2")));
});

test("chapter one emits the geometric sets as inline math instead of code", (t) => {
  const temporary = temporaryDirectory(t);
  const project = path.join(temporary, "project");
  stageBook({
    sourceDir: CANONICAL_SOURCE,
    projectDir: project,
    katexPackageDir: KATEX_PACKAGE,
    mdbookBin: MDBOOK_BIN,
    runBuild: false,
  });

  const chapter = readFileSync(path.join(project, "src/01-polyhedral-recap.md"), "utf8");
  assert.match(chapter, /设 \$d\$ 为循环嵌套的维数/);
  assert.match(chapter, /\$P \\\\subseteq \\\\mathbb\{R\}\^d\$/);
  assert.match(chapter, /\$P \\\\cap \\\\mathbb\{Z\}\^d\$/);
  assert.doesNotMatch(chapter, /`P \\subseteq \\mathbb\{R\}\^d`/);
});

test("chapter one formats the triangular enumeration as a multi-line set", (t) => {
  const temporary = temporaryDirectory(t);
  const project = path.join(temporary, "project");
  stageBook({
    sourceDir: CANONICAL_SOURCE,
    projectDir: project,
    katexPackageDir: KATEX_PACKAGE,
    mdbookBin: MDBOOK_BIN,
    runBuild: false,
  });

  const chapter = readFileSync(path.join(project, "src/01-polyhedral-recap.md"), "utf8");
  assert(chapter.includes("取 $N=4$：当 $i=0,1,2,3$ 时，$j$ 分别取 $0$、$\\\\{0,1\\\\}$、$\\\\{0,1,2\\\\}$、$\\\\{0,1,2,3\\\\}$"));
  assert(chapter.includes("D\\_{\\\\mathrm{tri}}(4) =\n\\\\left\\\\{\n\\\\begin{aligned}"));
  assert(!chapter.includes("D_{\\mathrm{tri}}(4)\n=\n"));
  assert(chapter.includes("\\\\end{aligned}\n\\\\right\\\\}."));
  assert(chapter.includes("点数为 $1+2+3+4=10$"));
});

test("chapter four keeps the floor cases display out of Setext heading syntax", (t) => {
  const temporary = temporaryDirectory(t);
  const project = path.join(temporary, "project");
  stageBook({
    sourceDir: CANONICAL_SOURCE,
    projectDir: project,
    katexPackageDir: KATEX_PACKAGE,
    mdbookBin: MDBOOK_BIN,
    runBuild: false,
  });

  const chapter = readFileSync(path.join(project, "src/04-set-relation-algebra.md"), "utf8");
  assert(chapter.includes("\\\\left\\\\lfloor\\\\frac{i+2}{3}\\\\right\\\\rfloor =\n\\\\begin{cases}"));
  assert(!chapter.includes("\\\\left\\\\lfloor\\\\frac{i+2}{3}\\\\right\\\\rfloor\n=\n\\\\begin{cases}"));
});

test("stageBook keeps KaTeX fonts offline in the mdBook output", (t) => {
  const temporary = temporaryDirectory(t);
  const project = path.join(temporary, "project");
  const manifest = stageBook({
    sourceDir: CANONICAL_SOURCE,
    projectDir: project,
    katexPackageDir: KATEX_PACKAGE,
    mdbookBin: MDBOOK_BIN,
    runBuild: true,
  });

  assert.equal(manifest.built, true);
  assert(existsSync(path.join(project, "book/index.html")));
  assert(existsSync(path.join(project, "book/print.html")));
  assert(existsSync(path.join(project, "book/theme/katex/fonts/KaTeX_Main-Regular.woff2")));
  assert(existsSync(path.join(project, "book/theme/katex/LICENSE")));
});

test("stageBook keeps Mermaid and its renderer offline", (t) => {
  const temporary = temporaryDirectory(t);
  const project = path.join(temporary, "project");
  stageBook({
    sourceDir: CANONICAL_SOURCE,
    projectDir: project,
    katexPackageDir: KATEX_PACKAGE,
    mdbookBin: MDBOOK_BIN,
    runBuild: true,
  });

  assert(existsSync(path.join(project, "book/theme/mermaid/mermaid.min.js")));
  assert.match(
    readFileSync(path.join(project, "book/10-transformations.html"), "utf8"),
    /theme\/mermaid\/mermaid\.min\.js/,
  );
  assert.match(
    readFileSync(path.join(project, "theme/math-render.js"), "utf8"),
    /renderBookMermaid/,
  );
});

test("a staging failure leaves an existing target untouched", (t) => {
  const temporary = temporaryDirectory(t);
  const target = path.join(temporary, "published");
  const staging = path.join(temporary, "staging");
  const fakeKatex = path.join(temporary, "fake-katex");
  mkdirSync(target);
  mkdirSync(fakeKatex);
  writeFileSync(path.join(target, "sentinel.txt"), "old publication\n");
  writeFileSync(path.join(fakeKatex, "package.json"), '{"version":"0.0.0"}\n');

  assert.throws(
    () => stageBook({
      sourceDir: CANONICAL_SOURCE,
      projectDir: staging,
      katexPackageDir: fakeKatex,
      mdbookBin: MDBOOK_BIN,
      runBuild: false,
    }),
    /KaTeX version 0\.16\.22 required/,
  );
  assert.equal(readFileSync(path.join(target, "sentinel.txt"), "utf8"), "old publication\n");
});

test("publishBook replaces a target and removes its exact backup", (t) => {
  const temporary = temporaryDirectory(t);
  const staging = path.join(temporary, "staging");
  const target = path.join(temporary, "published");
  mkdirSync(staging);
  mkdirSync(target);
  writeFileSync(path.join(staging, "new.txt"), "new\n");
  writeFileSync(path.join(target, "old.txt"), "old\n");

  publishBook(staging, target);

  assert.equal(readFileSync(path.join(target, "new.txt"), "utf8"), "new\n");
  assert.equal(existsSync(path.join(target, "old.txt")), false);
  assert.equal(existsSync(`${target}.previous`), false);
  assert.equal(existsSync(staging), false);
});

test("publishBook restores the old target when the second rename fails", (t) => {
  const temporary = temporaryDirectory(t);
  const staging = path.join(temporary, "staging");
  const target = path.join(staging, "published");
  mkdirSync(target, { recursive: true });
  writeFileSync(path.join(target, "sentinel.txt"), "old publication\n");

  assert.throws(() => publishBook(staging, target));
  assert.equal(readFileSync(path.join(target, "sentinel.txt"), "utf8"), "old publication\n");
  assert.equal(existsSync(`${target}.previous`), false);
});

test("publishBook rejects a staging path that collides with its backup", (t) => {
  const temporary = temporaryDirectory(t);
  const target = path.join(temporary, "published");
  const staging = `${target}.previous`;
  mkdirSync(target);
  mkdirSync(staging);
  writeFileSync(path.join(target, "old.txt"), "old\n");
  writeFileSync(path.join(staging, "new.txt"), "new\n");

  assert.throws(() => publishBook(staging, target), /collides with publication path/i);
  assert.equal(readFileSync(path.join(target, "old.txt"), "utf8"), "old\n");
  assert.equal(readFileSync(path.join(staging, "new.txt"), "utf8"), "new\n");
});

test("publishBook rejects broad destructive targets before changing staging", (t) => {
  const temporary = temporaryDirectory(t);
  const staging = path.join(temporary, "staging");
  mkdirSync(staging);
  writeFileSync(path.join(staging, "sentinel.txt"), "staging\n");

  for (const dangerous of [path.parse(WORKSPACE).root, homedir(), WORKSPACE]) {
    assert.throws(() => publishBook(staging, dangerous), /unsafe publication target/i);
    assert.equal(readFileSync(path.join(staging, "sentinel.txt"), "utf8"), "staging\n");
  }
});
