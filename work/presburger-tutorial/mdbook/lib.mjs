export const CHAPTERS = [
  { source: "../chapters/00-frontmatter.md", target: "README.md", title: "前言与阅读路线", kind: "frontmatter" },
  { source: "../chapters/01-polyhedral-recap.md", target: "01-polyhedral-recap.md", title: "第 1 章：Polyhedral Model 的最小回顾", kind: "chapter" },
  { source: "../chapters/02-presburger-syntax.md", target: "02-presburger-syntax.md", title: "第 2 章：Presburger 算术的语法与语义", kind: "chapter" },
  { source: "../chapters/03-decidability-elimination.md", target: "03-decidability-elimination.md", title: "第 3 章：可判定性、量词消去与表达能力", kind: "chapter" },
  { source: "../chapters/04-set-relation-algebra.md", target: "04-set-relation-algebra.md", title: "第 4 章：Presburger 集合与关系代数", kind: "chapter" },
  { source: "../chapters/05-semilinear-polyhedra.md", target: "05-semilinear-polyhedra.md", title: "第 5 章：半线性集合、格点与多面体", kind: "chapter" },
  { source: "../chapters/06-program-modeling.md", target: "06-program-modeling.md", title: "第 6 章：循环程序的关系建模", kind: "chapter" },
  { source: "../chapters/07-dependence-analysis.md", target: "07-dependence-analysis.md", title: "第 7 章：精确数据依赖分析", kind: "chapter" },
  { source: "../chapters/08-affine-scheduling.md", target: "08-affine-scheduling.md", title: "第 8 章：仿射调度与多维时间", kind: "chapter" },
  { source: "../chapters/09-farkas-ilp.md", target: "09-farkas-ilp.md", title: "第 9 章：Farkas 引理与 LP/ILP 调度合成", kind: "chapter" },
  { source: "../chapters/10-transformations.md", target: "10-transformations.md", title: "第 10 章：调度变换与调度树", kind: "chapter" },
  { source: "../chapters/11-code-generation.md", target: "11-code-generation.md", title: "第 11 章：整数扫描与代码生成", kind: "chapter" },
  { source: "../chapters/12-end-to-end.md", target: "12-end-to-end.md", title: "第 12 章：二维 stencil 的端到端推导", kind: "chapter" },
  { source: "../chapters/13-appendices.md", target: "appendices.md", title: "附录：练习答案、符号速查与延伸阅读", kind: "appendix" },
];

function maskCode(text) {
  return text.replace(/[^\n]/g, " ");
}

function processInlineCode(text, transformOutside, transformCode) {
  let output = "";
  let position = 0;
  while (position < text.length) {
    const opening = text.indexOf("`", position);
    if (opening === -1) return output + transformOutside(text.slice(position));

    let length = 1;
    while (text[opening + length] === "`") length += 1;
    let closing = opening + length;
    while (closing < text.length) {
      closing = text.indexOf("`", closing);
      if (closing === -1) return output + transformOutside(text.slice(position));
      let closingLength = 1;
      while (text[closing + closingLength] === "`") closingLength += 1;
      if (closingLength === length) break;
      closing += closingLength;
    }

    output += transformOutside(text.slice(position, opening));
    output += transformCode(text.slice(opening, closing + length));
    position = closing + length;
  }
  return output;
}

function openingFence(text, position) {
  const lineEnd = text.indexOf("\n", position);
  const end = lineEnd === -1 ? text.length : lineEnd + 1;
  const line = text.slice(position, lineEnd === -1 ? text.length : lineEnd);
  const match = /^( {0,3})(`{3,}|~{3,})/.exec(line);
  if (!match) return null;
  return { character: match[2][0], length: match[2].length, end };
}

function closingFence(text, position, fence) {
  const lineEnd = text.indexOf("\n", position);
  const end = lineEnd === -1 ? text.length : lineEnd + 1;
  const line = text.slice(position, lineEnd === -1 ? text.length : lineEnd);
  const marker = fence.character === "`" ? "`" : "~";
  const expression = new RegExp(`^ {0,3}${marker}{${fence.length},}[ \\t]*$`);
  return expression.test(line) ? end : null;
}

function mapOutsideCode(text, transformOutside, transformCode = (code) => code) {
  let output = "";
  let outsideStart = 0;
  let position = 0;
  while (position < text.length) {
    const fence = openingFence(text, position);
    if (!fence) {
      const nextLine = text.indexOf("\n", position);
      position = nextLine === -1 ? text.length : nextLine + 1;
      continue;
    }

    output += processInlineCode(text.slice(outsideStart, position), transformOutside, transformCode);
    const fencedStart = position;
    position = fence.end;
    let closing;
    while (position < text.length && !(closing = closingFence(text, position, fence))) {
      const nextLine = text.indexOf("\n", position);
      position = nextLine === -1 ? text.length : nextLine + 1;
    }
    position = closing ?? text.length;
    output += transformCode(text.slice(fencedStart, position));
    outsideStart = position;
  }
  return output + processInlineCode(text.slice(outsideStart), transformOutside, transformCode);
}

export function rewriteMarkdown(entry, text) {
  let answerRewrites = 0;
  let frontmatterRewrites = 0;

  if (entry.kind === "frontmatter") {
    const output = mapOutsideCode(
      text,
      (outside) => outside.replace(
        /\]\(#(glossary|further-reading)\)/g,
        (_whole, fragment) => {
          frontmatterRewrites += 1;
          return `](appendices.md#${fragment})`;
        },
      ),
    );
    return { text: output, answerRewrites, frontmatterRewrites };
  }

  if (entry.kind === "chapter") {
    const output = mapOutsideCode(
      text,
      (outside) => outside.replace(
        /\]\(#ans-(ex\d{2}-[bdc]\d{2})\)/gi,
        (_whole, id) => {
          answerRewrites += 1;
          return `](appendices.md#ans-${id.toLowerCase()})`;
        },
      ),
    );
    return { text: output, answerRewrites, frontmatterRewrites };
  }

  return { text, answerRewrites, frontmatterRewrites };
}

function isMathematicalCodeSpan(content) {
  if (/\\(?:[A-Za-z]|[{}])/.test(content)) return true;
  if (/^[A-Za-z](?:_[A-Za-z0-9]+)?$/.test(content)) return true;
  return /^[A-Z](?:_[A-Za-z0-9]+)?\([A-Za-z0-9_,+*/-]+\)$/.test(content);
}

export function rewriteInlineCodeMath(text) {
  return mapOutsideCode(text, (outside) => outside, (code) => {
    const marker = /^`+/.exec(code)?.[0];
    if (!marker || !code.endsWith(marker)) return code;

    const content = code.slice(marker.length, -marker.length);
    return isMathematicalCodeSpan(content) ? `\\(${content}\\)` : code;
  });
}

const MATH_ASTERISK_SENTINEL = "\uE000";

function protectMathAsterisks(text) {
  const protect = (formula) => formula.replaceAll("*", MATH_ASTERISK_SENTINEL);
  return text
    .replace(/\\\[[\s\S]*?\\\]/g, protect)
    .replace(/\\\([\s\S]*?\\\)/g, protect);
}

export function rewriteMathDelimitersForMdBook(text) {
  return mapOutsideCode(text, (outside) => protectMathAsterisks(outside)
    .replaceAll("\\[", () => "$$")
    .replaceAll("\\]", () => "$$")
    .replaceAll("\\(", "$")
    .replaceAll("\\)", "$")
    .replaceAll("\\", "\\\\")
    .replaceAll("_", "\\_")
    .replaceAll(MATH_ASTERISK_SENTINEL, "\\*"));
}

export function makeSummary() {
  return ["# Summary", "", ...CHAPTERS.map(({ title, target }) => `- [${title}](${target})`), ""].join("\n");
}

function withoutCode(text) {
  return mapOutsideCode(text, (outside) => outside, maskCode);
}

function matchedIds(text, expression) {
  return [...text.matchAll(expression)].map((match) => match[1].toUpperCase());
}

export function collectIds(text) {
  const source = withoutCode(text);
  const answerIndexes = [];
  for (const match of source.matchAll(/\[ANS-(ex\d{2}-[bdc]\d{2})\]\((?:appendices\.md)?#ans-([^)]+)\)/gi)) {
    const label = match[1].toUpperCase();
    const target = match[2].toUpperCase();
    if (label !== target) {
      throw new Error(`Answer index ${label} does not match target ${target}`);
    }
    answerIndexes.push(label);
  }
  return {
    questions: matchedIds(source, /^#{1,6}\s+练习\s+(EX\d{2}-[BDC]\d{2})\b/gim),
    answers: matchedIds(source, /^#{1,6}\s+参考答案\s+(EX\d{2}-[BDC]\d{2})\b/gim),
    anchors: matchedIds(source, /<a\s+id=["']ans-(ex\d{2}-[bdc]\d{2})["']\s*><\/a>/gi),
    answerIndexes,
  };
}

export function assertIdContract(groups, expectedCount) {
  const names = ["questions", "answers", "anchors", "answerIndexes"];
  for (const name of names) {
    const ids = groups[name];
    if (!Array.isArray(ids) || ids.length !== expectedCount) {
      throw new Error(`ID group ${name} must contain ${expectedCount} IDs`);
    }
    if (new Set(ids).size !== ids.length) {
      throw new Error(`ID group ${name} contains non-distinct IDs`);
    }
  }

  const canonical = [...groups.questions].sort();
  for (const name of names.slice(1)) {
    const ids = [...groups[name]].sort();
    if (ids.length !== canonical.length || ids.some((id, index) => id !== canonical[index])) {
      throw new Error(`ID group ${name} does not equal questions`);
    }
  }
}

function countPairs(text, open, close, kind, fileContext) {
  let count = 0;
  let position = 0;
  while (position < text.length) {
    const nextOpen = text.indexOf(open, position);
    const nextClose = text.indexOf(close, position);
    if (nextOpen === -1 && nextClose === -1) break;
    if (nextClose !== -1 && (nextOpen === -1 || nextClose < nextOpen)) {
      throw new Error(`Unbalanced ${kind} math delimiter in ${fileContext}`);
    }
    const closePosition = text.indexOf(close, nextOpen + open.length);
    if (closePosition === -1) {
      throw new Error(`Unbalanced ${kind} math delimiter in ${fileContext}`);
    }
    count += 1;
    position = closePosition + close.length;
  }
  return count;
}

export function countMath(text, fileContext = "input text") {
  const source = withoutCode(text);
  const inline = countPairs(source, "\\(", "\\)", "inline", fileContext);
  const display = countPairs(source, "\\[", "\\]", "display", fileContext);
  return { inline, display, total: inline + display };
}
