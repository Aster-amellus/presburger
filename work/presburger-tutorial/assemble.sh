#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "$0")/../.." && pwd -P)"
chapter_dir="$root_dir/work/presburger-tutorial/chapters"
output_file="$root_dir/outputs/presburger-algebra-polyhedral-analysis-tutorial.md"
temp_file="${output_file}.tmp"

files=(
  00-frontmatter.md
  01-polyhedral-recap.md
  02-presburger-syntax.md
  03-decidability-elimination.md
  04-set-relation-algebra.md
  05-semilinear-polyhedra.md
  06-program-modeling.md
  07-dependence-analysis.md
  08-affine-scheduling.md
  09-farkas-ilp.md
  10-transformations.md
  11-code-generation.md
  12-end-to-end.md
  13-appendices.md
)

: > "$temp_file"
for file in "${files[@]}"; do
  test -s "$chapter_dir/$file"
  awk '1' "$chapter_dir/$file" >> "$temp_file"
  printf '\n\n' >> "$temp_file"
done

mv "$temp_file" "$output_file"
