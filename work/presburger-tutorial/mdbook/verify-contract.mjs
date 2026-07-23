import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  CHAPTERS,
  assertIdContract,
  collectIds,
  countMath,
  rewriteInlineCodeMath,
  rewriteMarkdown,
} from "./lib.mjs";

const totals = {
  files: 0,
  answer_rewrites: 0,
  frontmatter_rewrites: 0,
  questions: [],
  answers: [],
  anchors: [],
  answer_indexes: [],
  inline_math: 0,
  display_math: 0,
};

for (const entry of CHAPTERS) {
  const sourceUrl = new URL(entry.source, import.meta.url);
  const source = await readFile(sourceUrl, "utf8");
  const rewritten = rewriteMarkdown(entry, source);
  const mathRewritten = rewriteInlineCodeMath(rewritten.text);
  const ids = collectIds(mathRewritten);
  const math = countMath(mathRewritten, sourceUrl.pathname);

  totals.files += 1;
  totals.answer_rewrites += rewritten.answerRewrites;
  totals.frontmatter_rewrites += rewritten.frontmatterRewrites;
  totals.questions.push(...ids.questions);
  totals.answers.push(...ids.answers);
  totals.anchors.push(...ids.anchors);
  totals.answer_indexes.push(...ids.answerIndexes);
  totals.inline_math += math.inline;
  totals.display_math += math.display;
}

assert.equal(totals.files, 14);
assert.equal(totals.answer_rewrites, 78);
assert.equal(totals.frontmatter_rewrites, 2);
assertIdContract({
  questions: totals.questions,
  answers: totals.answers,
  anchors: totals.anchors,
  answerIndexes: totals.answer_indexes,
}, 78);
assert.equal(totals.inline_math, 1985);
assert.equal(totals.display_math, 420);

console.log(`files=${totals.files}`);
console.log(`answer_rewrites=${totals.answer_rewrites}`);
console.log(`frontmatter_rewrites=${totals.frontmatter_rewrites}`);
console.log(`questions=${totals.questions.length}`);
console.log(`answers=${totals.answers.length}`);
console.log(`anchors=${totals.anchors.length}`);
console.log(`answer_indexes=${totals.answer_indexes.length}`);
console.log(`inline_math=${totals.inline_math}`);
console.log(`display_math=${totals.display_math}`);
