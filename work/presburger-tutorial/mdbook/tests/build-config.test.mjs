import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const CONFIG_PATH = path.resolve(import.meta.dirname, "../build-config.mjs");
const LOCAL_KATEX = path.resolve(import.meta.dirname, "../node_modules/katex");

test("portable build dependencies default to project assets and PATH", async () => {
  assert(existsSync(CONFIG_PATH), "portable build configuration module is missing");
  const config = await import("../build-config.mjs");

  assert.deepEqual(config.REQUIRED_TOOL_VERSIONS, {
    mdbook: "0.4.52",
    mdbookI18nHelpers: "0.3.5",
  });
  assert.deepEqual(config.resolveBuildDependencies({}), {
    katexPackageDir: LOCAL_KATEX,
    mdbookBin: "mdbook",
    mdbookGettextBin: "mdbook-gettext",
  });
  assert.deepEqual(config.resolveBuildDependencies({
    KATEX_PACKAGE_DIR: "/tmp/katex",
    MDBOOK_BIN: "/tmp/mdbook",
    MDBOOK_GETTEXT_BIN: "/tmp/mdbook-gettext",
  }), {
    katexPackageDir: "/tmp/katex",
    mdbookBin: "/tmp/mdbook",
    mdbookGettextBin: "/tmp/mdbook-gettext",
  });
});
