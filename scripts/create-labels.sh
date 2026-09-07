#!/usr/bin/env bash
set -euo pipefail

REPO_FULL_NAME="${1:-CiccyZ/octo-cli-agent-demand-pool-zx}"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required for local label sync. GitHub Actions also syncs labels automatically from data/labels.json." >&2
  exit 1
fi
if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required" >&2
  exit 1
fi

jq -c '.[]' data/labels.json | while read -r label; do
  name=$(echo "$label" | jq -r '.name')
  color=$(echo "$label" | jq -r '.color' | sed 's/^#//')
  desc=$(echo "$label" | jq -r '.description')
  gh label create "$name" --repo "$REPO_FULL_NAME" --color "$color" --description "$desc" --force
  echo "upserted label: $name"
done
