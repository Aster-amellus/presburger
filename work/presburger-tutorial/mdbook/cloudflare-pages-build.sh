#!/usr/bin/env bash
set -euo pipefail

MDBOOK_VERSION=0.4.52
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
tool_dir="$(mktemp -d)"
trap 'rm -rf "$tool_dir"' EXIT

curl -fsSL "https://github.com/rust-lang/mdBook/releases/download/v${MDBOOK_VERSION}/mdbook-v${MDBOOK_VERSION}-x86_64-unknown-linux-gnu.tar.gz" \
  | tar -xz -C "$tool_dir"
test -x "$tool_dir/mdbook"

cd "$repo_root"
npm ci --prefix work/presburger-tutorial/mdbook
MDBOOK_BIN="$tool_dir/mdbook" npm run ci --prefix work/presburger-tutorial/mdbook
