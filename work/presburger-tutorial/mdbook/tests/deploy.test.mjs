import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const WORKSPACE = path.resolve(import.meta.dirname, "../../../..");
const PAGES_BUILD_SCRIPT = path.join(
  WORKSPACE,
  "work/presburger-tutorial/mdbook/cloudflare-pages-build.sh",
);
const DEPLOY_WORKFLOW = path.join(WORKSPACE, ".github/workflows/presburger-pages.yml");
const PAGES_GUIDE = path.join(WORKSPACE, "work/presburger-tutorial/mdbook/CLOUDFLARE_PAGES.md");

test("Cloudflare Pages build script installs the pinned mdBook, gettext helper, and runs the book CI", () => {
  assert(existsSync(PAGES_BUILD_SCRIPT), "Cloudflare Pages build script is missing");
  const script = readFileSync(PAGES_BUILD_SCRIPT, "utf8");

  assert.match(script, /MDBOOK_VERSION=0\.4\.52/);
  assert.match(script, /MDBOOK_I18N_HELPERS_VERSION=0\.3\.5/);
  assert.match(
    script,
    /github\.com\/rust-lang\/mdBook\/releases\/download\/v\$\{MDBOOK_VERSION\}\/mdbook-v\$\{MDBOOK_VERSION\}-x86_64-unknown-linux-gnu\.tar\.gz/,
  );
  assert.match(script, /https:\/\/sh\.rustup\.rs/);
  assert.match(script, /"\$CARGO_HOME\/bin\/cargo" install --locked mdbook-i18n-helpers --version "\$\{MDBOOK_I18N_HELPERS_VERSION\}"/);
  assert.match(script, /test -x "\$CARGO_HOME\/bin\/mdbook-gettext"/);
  assert.match(script, /export PATH="\$CARGO_HOME\/bin:\$PATH"/);
  assert.match(script, /npm ci --prefix work\/presburger-tutorial\/mdbook/);
  assert.match(script, /MDBOOK_BIN="\$tool_dir\/mdbook" MDBOOK_GETTEXT_BIN="\$CARGO_HOME\/bin\/mdbook-gettext" npm run ci --prefix work\/presburger-tutorial\/mdbook/);
});

test("Cloudflare Pages documentation uses the native build and unique output directory", () => {
  assert.equal(existsSync(DEPLOY_WORKFLOW), false, "GitHub deployment workflow must be removed");
  assert(existsSync(PAGES_GUIDE), "Cloudflare Pages configuration guide is missing");
  const guide = readFileSync(PAGES_GUIDE, "utf8");

  assert.match(guide, /bash work\/presburger-tutorial\/mdbook\/cloudflare-pages-build\.sh/);
  assert.match(guide, /outputs\/presburger-algebra-polyhedral-analysis-mdbook\/book/);
  assert.match(guide, /Production branch[^\n]*main/);
  assert.match(guide, /mdbook-i18n-helpers 0\.3\.5/);
  assert.match(guide, /中文.*Català|Català.*中文/);
  assert.doesNotMatch(guide, /npx wrangler deploy/);
});
