#!/usr/bin/env bash
set -euo pipefail

MDBOOK_VERSION=0.4.52
MDBOOK_I18N_HELPERS_VERSION=0.3.5
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
tool_dir="$(mktemp -d)"
CARGO_HOME="$tool_dir/cargo"
RUSTUP_HOME="$tool_dir/rustup"
trap 'rm -rf "$tool_dir"' EXIT

curl -fsSL "https://github.com/rust-lang/mdBook/releases/download/v${MDBOOK_VERSION}/mdbook-v${MDBOOK_VERSION}-x86_64-unknown-linux-gnu.tar.gz" \
  | tar -xz -C "$tool_dir"
test -x "$tool_dir/mdbook"

export CARGO_HOME RUSTUP_HOME
curl --proto '=https' --tlsv1.2 -fsSL https://sh.rustup.rs \
  | sh -s -- -y --profile minimal --no-modify-path
"$CARGO_HOME/bin/cargo" install --locked mdbook-i18n-helpers --version "${MDBOOK_I18N_HELPERS_VERSION}"
test -x "$CARGO_HOME/bin/mdbook-gettext"

cd "$repo_root"
npm ci --prefix work/presburger-tutorial/mdbook
MDBOOK_BIN="$tool_dir/mdbook" MDBOOK_GETTEXT_BIN="$CARGO_HOME/bin/mdbook-gettext" npm run ci --prefix work/presburger-tutorial/mdbook
