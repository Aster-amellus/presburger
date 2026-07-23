#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const output = path.join(root, "outputs/presburger-algebra-polyhedral-analysis-tutorial.md");
const source = fs.readFileSync(output, "utf8");
const failures = [];
let checks = 0;

function check(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

function unique(values) {
  return new Set(values).size === values.length;
}

function sameSet(left, right) {
  const a = new Set(left);
  const b = new Set(right);
  return a.size === b.size && [...a].every((value) => b.has(value));
}

function countMatches(text, regex) {
  return [...text.matchAll(regex)].length;
}

function stripFencedCode(text) {
  const kept = [];
  let fence = null;
  let fenceMarkers = 0;
  for (const [index, line] of text.split("\n").entries()) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      const kind = marker[1][0];
      const width = marker[1].length;
      fenceMarkers += 1;
      if (fence === null) {
        fence = { kind, width, line: index + 1 };
      } else if (kind === fence.kind && width >= fence.width) {
        fence = null;
      }
      kept.push("");
      continue;
    }
    kept.push(fence === null ? line : "");
  }
  check(fence === null, fence === null ? "" : `代码围栏未闭合，始于第 ${fence.line} 行`);
  return { text: kept.join("\n"), fenceMarkers };
}

function braceBalanced(math) {
  let depth = 0;
  for (let index = 0; index < math.length; index += 1) {
    const char = math[index];
    const escaped = index > 0 && math[index - 1] === "\\";
    if (!escaped && char === "{") depth += 1;
    if (!escaped && char === "}") depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}

check(source.length > 0, "最终文件为空");
check(!source.includes("\r"), "文件包含 CR 换行");
check(!/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/u.test(source), "文件包含异常控制字符");

const chapterNumbers = [...source.matchAll(/^# 第 (\d+) 章：/gm)].map((match) => Number(match[1]));
check(JSON.stringify(chapterNumbers) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]),
  `章节序列错误：${chapterNumbers.join(",")}`);
check(countMatches(source, /^# 附录：/gm) === 1, "顶层附录标题不是恰好一个");
check(!/^# 第 13 章：/m.test(source), "附录被误编号为第 13 章");

const chapterMatches = [...source.matchAll(/^# 第 (\d+) 章：.*$/gm)];
const appendixStart = source.search(/^# 附录：/m);
const requiredChapterSections = ["直觉", "形式定义", "手算示例", "编译器用途", "常见误区", "练习", "本章小结"];
for (let index = 0; index < chapterMatches.length; index += 1) {
  const start = chapterMatches[index].index;
  const end = index + 1 < chapterMatches.length ? chapterMatches[index + 1].index : appendixStart;
  const chapterText = source.slice(start, end);
  for (const section of requiredChapterSections) {
    const headingCount = chapterText.split(`\n## ${section}\n`).length - 1;
    check(headingCount === 1, `第 ${index + 1} 章的“${section}”二级节数量为 ${headingCount}`);
  }
}

const questionIds = [...source.matchAll(/^### 练习 (EX\d{2}-[BDC]\d{2})｜/gm)].map((match) => match[1]);
const answerIds = [...source.matchAll(/^### 参考答案 (EX\d{2}-[BDC]\d{2})｜/gm)].map((match) => match[1]);
const answerAnchors = [...source.matchAll(/^<a id="ans-(ex\d{2}-[bdc]\d{2})"><\/a>$/gm)]
  .map((match) => match[1].toUpperCase());
const answerLinks = [...source.matchAll(/\(#ans-(ex\d{2}-[bdc]\d{2})\)/g)]
  .map((match) => match[1].toUpperCase());
const answerBlocks = [...source.matchAll(/^<a id="ans-(ex\d{2}-[bdc]\d{2})"><\/a>\n### 参考答案 (EX\d{2}-[BDC]\d{2})｜/gm)];
const answerIndexPairs = [...source.matchAll(/\[ANS-(EX\d{2}-[BDC]\d{2})\]\(#ans-(ex\d{2}-[bdc]\d{2})\)/g)];

check(questionIds.length >= 36, `练习不足 36 道：${questionIds.length}`);
check(questionIds.length === 78, `预期 78 道练习，实际 ${questionIds.length}`);
check(answerIds.length === questionIds.length, `答案数 ${answerIds.length} 与题目数 ${questionIds.length} 不同`);
check(answerAnchors.length === questionIds.length, `答案锚点数 ${answerAnchors.length} 与题目数不同`);
check(answerLinks.length === questionIds.length, `答案链接数 ${answerLinks.length} 与题目数不同`);
check(unique(questionIds), "练习 ID 有重复");
check(unique(answerIds), "答案 ID 有重复");
check(unique(answerAnchors), "答案锚点有重复");
check(unique(answerLinks), "答案链接有重复");
check(sameSet(questionIds, answerIds), "题目与答案 ID 集合不一致");
check(sameSet(questionIds, answerAnchors), "题目与答案锚点集合不一致");
check(sameSet(questionIds, answerLinks), "题目与答案链接集合不一致");
check(answerBlocks.length === questionIds.length, `相邻 anchor/答案块数量为 ${answerBlocks.length}`);
check(answerBlocks.every((match) => match[1].toUpperCase() === match[2]), "至少一个答案 anchor 与紧随其后的答案标题不匹配");
check(answerIndexPairs.length === questionIds.length, `完整答案索引数量为 ${answerIndexPairs.length}`);
check(answerIndexPairs.every((match) => match[1] === match[2].toUpperCase()), "至少一个答案索引的标签与 href 不匹配");

for (let chapter = 1; chapter <= 12; chapter += 1) {
  const prefix = `EX${String(chapter).padStart(2, "0")}-`;
  const ids = questionIds.filter((id) => id.startsWith(prefix));
  for (const level of ["B", "D", "C"]) {
    check(ids.some((id) => id.includes(`-${level}`)), `第 ${chapter} 章缺少 ${level} 级练习`);
  }
}

const explicitIdList = [...source.matchAll(/<a id="([^"]+)"><\/a>/g)].map((match) => match[1]);
const explicitIds = new Set(explicitIdList);
const fragmentLinks = [...source.matchAll(/\]\(#([^)]+)\)/g)].map((match) => match[1]);
check(explicitIds.size === explicitIdList.length, "显式 HTML anchor 有重复 ID");
check(fragmentLinks.every((fragment) => explicitIds.has(fragment)),
  `存在无法解析的页内链接：${fragmentLinks.filter((fragment) => !explicitIds.has(fragment)).join(", ")}`);
check(!/\]\((?!https?:\/\/|#|mailto:)[^)]+\.md(?:#[^)]+)?\)/.test(source), "最终单文件仍含本地 Markdown 文件链接");

const { text: prose, fenceMarkers } = stripFencedCode(source);
const withoutInlineCode = prose.replace(/`[^`\n]*`/g, "");
const displayOpens = withoutInlineCode.split("\\[").length - 1;
const displayCloses = withoutInlineCode.split("\\]").length - 1;
check(displayOpens === displayCloses, `展示数学分隔符不平衡：open=${displayOpens}, close=${displayCloses}`);
const displayMath = [...withoutInlineCode.matchAll(/\\\[([\s\S]*?)\\\]/g)].map((match) => match[1]);
check(displayMath.length === displayOpens, `展示数学解析数 ${displayMath.length} 与分隔符计数 ${displayOpens} 不同`);
const withoutDisplay = withoutInlineCode.replace(/\\\[[\s\S]*?\\\]/g, "");
const oddMathLines = [];
let inlineMathCount = 0;
for (const [index, line] of withoutDisplay.split("\n").entries()) {
  const opens = line.split("\\(").length - 1;
  const closes = line.split("\\)").length - 1;
  if (opens !== closes) oddMathLines.push(index + 1);
  inlineMathCount += opens;
}
check(oddMathLines.length === 0, `行内数学分隔符不平衡：第 ${oddMathLines.join(",")} 行`);
const inlineMath = [...withoutDisplay.matchAll(/\\\(([^\n]*?)\\\)/g)].map((match) => match[1]);
check(inlineMath.length === inlineMathCount, `行内数学解析数 ${inlineMath.length} 与分隔符计数 ${inlineMathCount} 不同`);
check([...displayMath, ...inlineMath].every(braceBalanced), "至少一个数学对象的 TeX 花括号不平衡");
const environmentStack = [];
const environmentFailures = [];
for (const match of withoutInlineCode.matchAll(/\\(begin|end)\{([^}]+)\}/g)) {
  const [, action, name] = match;
  if (action === "begin") {
    environmentStack.push(name);
  } else if (environmentStack.pop() !== name) {
    environmentFailures.push(name);
  }
}
check(environmentStack.length === 0 && environmentFailures.length === 0,
  `TeX 环境嵌套不匹配：open=${environmentStack.join(",")}, bad_end=${environmentFailures.join(",")}`);

check(!/TBD|TODO|待补|以后补|placeholder|\?\?\?/iu.test(source), "发现占位符");
check(!/\b(lorem ipsum|fixme)\b/iu.test(source), "发现草稿标记");

const requiredCoverage = [
  ["source → sink", /source\s*(?:→|到)\s*sink/iu],
  ["P 与 P∩Z 区分", /P\s*\\cap\s*\\mathbb\{Z\}|P\s*∩\s*Z/u],
  ["Presburger 与半线性集合", /Presburger[\s\S]{0,120}半线性|半线性[\s\S]{0,120}Presburger/iu],
  ["合法性与性能区分", /合法性[\s\S]{0,120}性能|性能[\s\S]{0,120}合法性/u],
  ["Cooper/投影", /Cooper/iu],
  ["Farkas 有限化", /Farkas[\s\S]{0,160}有限|有限[\s\S]{0,160}Farkas/iu],
  ["floor", /\\lfloor|floor/iu],
  ["ceil", /\\lceil|ceil/iu],
  ["stride", /stride|步长/iu],
  ["stencil", /stencil/iu],
  ["教学性简化", /教学性(?:简化|推导|表示)|教学简化/u],
];
for (const [name, regex] of requiredCoverage) check(regex.test(source), `缺少覆盖项：${name}`);

for (const term of ["三角", "同余", "析取", "生产者", "矩阵转置", "矩阵乘", "归约", "stencil", "i*i", "A[B[i]]"]) {
  check(source.includes(term), `缺少案例类型：${term}`);
}
for (const term of ["RAW", "WAR", "WAW", "无依赖", "归约依赖"]) {
  check(source.includes(term), `缺少依赖结果：${term}`);
}

const urls = [...new Set([...source.matchAll(/https:\/\/[^\s)>]+/g)].map((match) => match[0]))];
check(urls.length === 15, `预期 15 个唯一外部 URL，实际 ${urls.length}`);

console.log(`file=${output}`);
console.log(`bytes=${Buffer.byteLength(source)}`);
console.log(`lines=${source.split("\n").length}`);
console.log(`chapters=${chapterNumbers.length}`);
console.log(`questions=${questionIds.length}`);
console.log(`answers=${answerIds.length}`);
console.log(`fragment_links=${fragmentLinks.length}`);
console.log(`inline_math=${inlineMath.length}`);
console.log(`display_math=${displayMath.length}`);
console.log(`fence_markers=${fenceMarkers}`);
console.log(`unique_urls=${urls.length}`);
console.log(`checks=${checks}`);

if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  console.error(`FINAL_AUDIT_FAIL failures=${failures.length}`);
  process.exit(1);
}

console.log("FINAL_AUDIT_PASS failures=0");
