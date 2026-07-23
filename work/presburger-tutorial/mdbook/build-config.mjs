import path from "node:path";

const LOCAL_KATEX_PACKAGE = path.join(import.meta.dirname, "node_modules/katex");

export function resolveBuildDependencies(environment = process.env) {
  return {
    katexPackageDir: environment.KATEX_PACKAGE_DIR ?? LOCAL_KATEX_PACKAGE,
    mdbookBin: environment.MDBOOK_BIN ?? "mdbook",
  };
}
