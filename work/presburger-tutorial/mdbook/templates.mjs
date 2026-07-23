import { LOCALES } from "./lib.mjs";

function tomlString(value) {
  return JSON.stringify(value);
}

export function makeBookToml({
  locale = LOCALES[0],
  gettextCommand = "mdbook-gettext",
} = {}) {
  return `[book]
title = ${tomlString(locale.title)}
language = ${tomlString(locale.code)}
multilingual = false
src = "src"

[build]
build-dir = "book"
create-missing = false

[preprocessor.gettext]
command = ${tomlString(gettextCommand)}
after = ["links"]

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
  "theme/language-switcher.js",
]

[output.html.search]
enable = true
limit-results = 30
use-boolean-and = true
`;
}

export const BOOK_TOML = makeBookToml();

export const MATH_RENDER_JS = `function renderBookMath() {
  let errors = 0;
  const root = document.querySelector("main") || document.body;
  renderMathInElement(root, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false },
    ],
    ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code"],
    throwOnError: false,
    strict: "warn",
    output: "htmlAndMathml",
    errorCallback(message) {
      errors += 1;
      console.error(\`KaTeX: \${message}\`);
    },
  });
  document.documentElement.dataset.katexReady = "true";
  document.documentElement.dataset.katexErrors = String(errors);
}

function renderBookMermaid() {
  let errors = 0;
  const finish = () => {
    document.documentElement.dataset.mermaidReady = "true";
    document.documentElement.dataset.mermaidErrors = String(errors);
  };
  const blocks = [...document.querySelectorAll("pre > code.language-mermaid")];
  if (blocks.length === 0) {
    finish();
    return Promise.resolve();
  }
  if (!window.mermaid) {
    errors += 1;
    console.error("Mermaid: runtime is unavailable");
    finish();
    return Promise.resolve();
  }

  try {
    const nodes = blocks.map((code) => {
      const host = document.createElement("div");
      host.className = "mermaid";
      host.textContent = code.textContent;
      code.parentElement.replaceWith(host);
      return host;
    });
    window.mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });
    return window.mermaid.run({ nodes }).catch((error) => {
      errors += 1;
      console.error("Mermaid: " + error.message);
    }).finally(finish);
  } catch (error) {
    errors += 1;
    console.error("Mermaid: " + error.message);
    finish();
    return Promise.resolve();
  }
}

function renderBookEnhancements() {
  renderBookMath();
  void renderBookMermaid();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderBookEnhancements, { once: true });
} else {
  renderBookEnhancements();
}
`;

export const BOOK_CSS = `.content main {
  max-width: 52rem;
}

.katex-display,
.table-wrapper,
.mermaid {
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
}

@media print {
  .katex-display,
  .table-wrapper {
    overflow: visible;
  }

  table {
    max-width: 100%;
  }
}
`;

export const LANGUAGE_SWITCHER_JS = `(function installLanguageSwitcher(global) {
  function languageTarget(href, language) {
    const url = new URL(href);
    const parts = url.pathname.split("/");
    if (String(language).toLowerCase() === "ca") {
      const marker = parts.lastIndexOf("ca");
      if (marker !== -1) parts.splice(marker, 1);
    } else {
      parts.splice(parts.length - 1, 0, "ca");
    }
    url.pathname = parts.join("/");
    return url.href;
  }

  global.presburgerLanguageTarget = languageTarget;
  if (typeof document === "undefined") return;

  const install = () => {
    const toolbar = document.querySelector("#menu-bar .right-buttons");
    if (!toolbar || document.querySelector("#language-switcher")) return;
    const language = document.documentElement.lang;
    const link = document.createElement("a");
    link.id = "language-switcher";
    link.className = "icon-button";
    link.href = languageTarget(window.location.href, language);
    link.textContent = String(language).toLowerCase() === "ca" ? "中文" : "Català";
    link.title = String(language).toLowerCase() === "ca"
      ? "切换到中文"
      : "Canvia al català";
    link.setAttribute("aria-label", link.title);
    toolbar.prepend(link);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
})(globalThis);
`;

export const README_MD = `# Presburger Algebra 与 Polyhedral Analysis（mdBook）

阅读入口是构建后的 \`book/index.html\`，打印版为 \`book/print.html\`。

在本目录执行：

\`\`\`bash
mdbook build
\`\`\`

本书固定使用随项目复制的 KaTeX 0.16.22。HTML、JavaScript、CSS 与 KaTeX 字体均从本地加载，不依赖 CDN 或网络服务；离线边界只覆盖本书静态页面及其已复制资源。
`;
