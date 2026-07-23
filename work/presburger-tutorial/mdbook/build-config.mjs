import path from "node:path";

const LOCAL_KATEX_PACKAGE = path.join(import.meta.dirname, "node_modules/katex");

export const REQUIRED_TOOL_VERSIONS = Object.freeze({
  mdbook: "0.4.52",
  mdbookI18nHelpers: "0.3.5",
});

export function resolveBuildDependencies(environment = process.env) {
  return {
    katexPackageDir: environment.KATEX_PACKAGE_DIR ?? LOCAL_KATEX_PACKAGE,
    mdbookBin: environment.MDBOOK_BIN ?? "mdbook",
    mdbookGettextBin: environment.MDBOOK_GETTEXT_BIN ?? "mdbook-gettext",
  };
}
