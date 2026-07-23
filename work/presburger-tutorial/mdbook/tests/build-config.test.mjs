import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const CONFIG_PATH = path.resolve(import.meta.dirname, "../build-config.mjs");
const LOCAL_KATEX = path.resolve(import.meta.dirname, "../node_modules/katex");

test("portable build dependencies default to project assets and PATH", async () => {
  assert(existsSync(CONFIG_PATH), "portable build configuration module is missing");
  const { resolveBuildDependencies } = await import("../build-config.mjs");

  assert.deepEqual(resolveBuildDependencies({}), {
    katexPackageDir: LOCAL_KATEX,
    mdbookBin: "mdbook",
  });
  assert.deepEqual(resolveBuildDependencies({
    KATEX_PACKAGE_DIR: "/tmp/katex",
    MDBOOK_BIN: "/tmp/mdbook",
  }), {
    katexPackageDir: "/tmp/katex",
    mdbookBin: "/tmp/mdbook",
  });
});
