#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is required" >&2
  exit 1
fi

REPO_FULL_NAME="${1:-}"
if [ -z "$REPO_FULL_NAME" ]; then
  echo "Usage: $0 <owner/repo>" >&2
  exit 1
fi

jq -c '.[]' data/labels.json | while read -r label; do
  name=$(echo "$label" | jq -r '.name')
  color=$(echo "$label" | jq -r '.color')
  desc=$(echo "$label" | jq -r '.description')
  gh label create "$name" --repo "$REPO_FULL_NAME" --color "$color" --description "$desc" --force
  echo "upserted label: $name"
done
