import test from "node:test";
import assert from "node:assert/strict";
import {
  CHAPTERS,
  rewriteMarkdown,
  makeSummary,
  collectIds,
  countMath,
  assertIdContract,
  rewriteMathDelimitersForMdBook,
  rewriteInlineCodeMath,
} from "../lib.mjs";

test("chapter manifest has frontmatter, chapters 1-12, and appendix", () => {
  assert.equal(CHAPTERS.length, 14);
  assert.equal(CHAPTERS[0].target, "README.md");
  assert.equal(CHAPTERS.at(-1).target, "appendices.md");
});

test("frontmatter links cross into the appendix", () => {
  const input = "[术语](#glossary) 与 [阅读](#further-reading)";
  const result = rewriteMarkdown(CHAPTERS[0], input);
  assert.equal(result.text,
    "[术语](appendices.md#glossary) 与 [阅读](appendices.md#further-reading)");
  assert.equal(result.frontmatterRewrites, 2);
});

test("chapter answer links become cross-page links", () => {
  const result = rewriteMarkdown(CHAPTERS[1],
    "[ANS-EX01-B01](#ans-ex01-b01)");
  assert.equal(result.text,
    "[ANS-EX01-B01](appendices.md#ans-ex01-b01)");
  assert.equal(result.answerRewrites, 1);
});

test("appendix anchors are not rewritten", () => {
  const appendix = CHAPTERS.at(-1);
  const input = '<a id="ans-ex01-b01"></a>';
  assert.equal(rewriteMarkdown(appendix, input).text, input);
});

test("IDs and math objects are counted outside code", () => {
  const text = [
    "### 练习 EX01-B01｜题",
    "[ANS-EX01-B01](#ans-ex01-b01)",
    '<a id="ans-ex01-b01"></a>',
    "### 参考答案 EX01-B01｜答",
    "行内 \\(x+1\\)。",
    "\\[x=1\\]",
    "```c",
    "\\(not_math\\)",
    "```",
  ].join("\n");
  const ids = collectIds(text);
  assert.deepEqual(ids.questions, ["EX01-B01"]);
  assert.deepEqual(ids.answers, ["EX01-B01"]);
  assert.deepEqual(ids.anchors, ["EX01-B01"]);
  assert.deepEqual(ids.answerIndexes, ["EX01-B01"]);
  assert.deepEqual(ids.questions, ids.answers);
  assert.deepEqual(ids.answers, ids.anchors);
  assert.deepEqual(ids.anchors, ids.answerIndexes);
  assert.deepEqual(countMath(text), { inline: 1, display: 1, total: 2 });
});

test("malformed answer index with a different target is rejected", () => {
  assert.throws(
    () => collectIds("[ANS-EX01-B01](#ans-ex01-b02)"),
    /does not match target/,
  );
});

test("ID contract rejects duplicate IDs even when group lengths match", () => {
  const duplicateGroups = {
    questions: ["EX01-B01", "EX01-B01"],
    answers: ["EX01-B01", "EX01-B01"],
    anchors: ["EX01-B01", "EX01-B01"],
    answerIndexes: ["EX01-B01", "EX01-B01"],
  };
  assert.throws(
    () => assertIdContract(duplicateGroups, 2),
    /non-distinct/,
  );
});

test("math and IDs inside extended Markdown code are ignored", () => {
  const text = [
    "### 练习 EX01-B01｜题",
    "[ANS-EX01-B01](#ans-ex01-b01)",
    '<a id="ans-ex01-b01"></a>',
    "### 参考答案 EX01-B01｜答",
    "行内 \\(x\\) 与 \\[y\\]。",
    "````markdown",
    "### 练习 EX99-B01｜题",
    "\\(four_tick_fence\\)",
    "````",
    "~~~~",
    "### 参考答案 EX99-B01｜答",
    "\\[tilde_fence\\]",
    "~~~~",
    "   ```javascript",
    '<a id="ans-ex99-b01"></a>',
    "\\(indented_fence\\)",
    "   ```",
    "````inline \\(multi_backtick_inline\\) [ANS-EX99-B01](#ans-ex99-b01) ````",
  ].join("\n");
  const ids = collectIds(text);
  assert.deepEqual(ids.questions, ["EX01-B01"]);
  assert.deepEqual(ids.answers, ["EX01-B01"]);
  assert.deepEqual(ids.anchors, ["EX01-B01"]);
  assert.deepEqual(ids.answerIndexes, ["EX01-B01"]);
  assert.deepEqual(countMath(text), { inline: 1, display: 1, total: 2 });
});

test("link rewriting leaves inline and fenced code unchanged", () => {
  const input = [
    "[ANS-EX01-B01](#ans-ex01-b01)",
    "``[ANS-EX01-B02](#ans-ex01-b02)``",
    "~~~~",
    "[ANS-EX01-B03](#ans-ex01-b03)",
    "~~~~",
    "   ````",
    "[ANS-EX01-C01](#ans-ex01-c01)",
    "   ````",
  ].join("\n");
  const result = rewriteMarkdown(CHAPTERS[1], input);
  assert.equal(result.answerRewrites, 1);
  assert.match(result.text, /\[ANS-EX01-B01\]\(appendices\.md#ans-ex01-b01\)/);
  assert.match(result.text, /``\[ANS-EX01-B02\]\(#ans-ex01-b02\)``/);
  assert.match(result.text, /\[ANS-EX01-B03\]\(#ans-ex01-b03\)/);
  assert.match(result.text, /\[ANS-EX01-C01\]\(#ans-ex01-c01\)/);
});

test("unbalanced math reports the source file", () => {
  assert.throws(
    () => countMath("\\(unclosed", "chapter.md"),
    /chapter\.md/,
  );
});

test("mdBook math delimiters survive Markdown parsing without changing code", () => {
  const input = [
    "行内 \\(x+1\\)，展示如下：",
    "\\[",
    "x=1",
    "\\]",
    "`\\(inline_code\\)`",
    "```text",
    "\\[fenced_code\\]",
    "```",
  ].join("\n");

  assert.equal(rewriteMathDelimitersForMdBook(input), [
    "行内 $x+1$，展示如下：",
    "$$",
    "x=1",
    "$$",
    "`\\(inline_code\\)`",
    "```text",
    "\\[fenced_code\\]",
    "```",
  ].join("\n"));
});

test("mathematical inline code becomes math while program code remains code", () => {
  const input = [
    "令 `m` 表示参数个数，`p=(p_1,\\ldots,p_m)` 表示参数向量。",
    "令 `S` 表示一条语句，`x=(i_1,\\ldots,i_d)` 表示一次实例，域为 `D_S(p)`。",
    "单元素集合记为 `I=\\{1\\}`。",
    "循环仍写作 `for (i=0; i<N; ++i)`，数组访问仍写作 `A[i]`。",
    "差集计算仍写作 `Candidate \\ Covered`。",
  ].join("\n");

  assert.equal(rewriteInlineCodeMath(input), [
    "令 \\(m\\) 表示参数个数，\\(p=(p_1,\\ldots,p_m)\\) 表示参数向量。",
    "令 \\(S\\) 表示一条语句，\\(x=(i_1,\\ldots,i_d)\\) 表示一次实例，域为 \\(D_S(p)\\)。",
    "单元素集合记为 \\(I=\\{1\\}\\)。",
    "循环仍写作 `for (i=0; i<N; ++i)`，数组访问仍写作 `A[i]`。",
    "差集计算仍写作 `Candidate \\ Covered`。",
  ].join("\n"));
});

test("TeX braces survive Markdown parsing while code is unchanged", () => {
  const input = [
    "\\[\\{x\\}\\]",
    "`\\{code\\}`",
  ].join("\n");

  assert.equal(rewriteMathDelimitersForMdBook(input), [
    "$$\\\\{x\\\\}$$",
    "`\\{code\\}`",
  ].join("\n"));
});

test("TeX commands and aligned line breaks survive Markdown parsing", () => {
  const input = [
    "\\[",
    "\\begin{aligned}",
    "x\\\\",
    "y",
    "\\end{aligned}",
    "\\]",
  ].join("\n");

  assert.equal(rewriteMathDelimitersForMdBook(input), [
    "$$",
    "\\\\begin{aligned}",
    "x\\\\\\\\",
    "y",
    "\\\\end{aligned}",
    "$$",
  ].join("\n"));
});

test("TeX subscripts survive Markdown emphasis parsing", () => {
  const input = "\\(\\tau_{S,r}:E_{S,r}\\to\\mathbb Z^2\\)";

  assert.equal(
    rewriteMathDelimitersForMdBook(input),
    "$\\\\tau\\_{S,r}:E\\_{S,r}\\\\to\\\\mathbb Z^2$",
  );
});

test("TeX asterisk markers survive Markdown emphasis parsing", () => {
  const input = "\\(y_*\\), \\(y^*\\)";

  assert.equal(
    rewriteMathDelimitersForMdBook(input),
    "$y\\_\\*$, $y^\\*$",
  );
});

test("TeX asterisk protection leaves prose emphasis unchanged", () => {
  const input = "**正文加粗** 与 \\(y_*\\)";

  assert.equal(
    rewriteMathDelimitersForMdBook(input),
    "**正文加粗** 与 $y\\_\\*$",
  );
});

test("summary lists exactly fourteen reading pages", () => {
  assert.equal((makeSummary().match(/^- \[/gm) ?? []).length, 14);
});
