# Automation

This repository uses GitHub Actions to meet the exam requirement that scanning must not depend on manual chat triggers.

## Label sync

Workflow: `.github/workflows/label-sync.yml`

- Source of truth: `data/labels.json`
- Runs on push when label config changes
- Also runs every 6 hours and supports manual dispatch for emergency repair
- Creates or updates GitHub issue labels with `issues: write` permission

## Cron scan

Workflow: `.github/workflows/cron-scan.yml`

- Runs every 10 minutes by GitHub cron
- Reads all GitHub Issues
- Compares with `data/issue-snapshot.json`
- Writes an audit row to `logs/cron-runs.md` only when a real issue change is detected
- Commits the updated snapshot/log with the GitHub Actions bot

## Notification rule

The scan is intentionally change-driven. No-change scans are visible in the Actions history but do not spam the repository or the Octo group. When a real change is detected, the responsible Agent should summarize the changed issue and notify the exam group with the issue link, current status, and next action.

## Verification note

Push-triggered runs are smoke checks to verify the workflow after configuration changes. The production scanning mechanism remains the scheduled cron (`*/10 * * * *`), which does not depend on manual chat triggers.

## Issue intake bridge

Workflow: `.github/workflows/issue-intake.yml`

- Trigger: push to `main` when `intake/issues/**` changes, or manual dispatch.
- Input source: JSON files under `intake/issues/`.
- Permission model: the local Agent only needs git push access; the workflow uses the repository `GITHUB_TOKEN` with `issues: write` to create or update GitHub Issues.
- New issue: provide `title`, `labels`, `original_submission`, optional `summary`, `body`, `acceptance_criteria`, `next_step`.
- Existing issue update / duplicate feedback: provide `issue_number`, `labels`, `original_submission`, optional `summary`, `body`, `next_step`; the workflow appends a comment and applies labels.
- Direct review comment: provide `issue_number` and `comment_body`; the workflow writes `comment_body` verbatim as an Issue comment. This is the preferred path for 阿强's detailed PRD Review so group chat only receives a short summary.
- Optional label changes on update/comment: `labels` adds labels; `remove_labels` removes labels such as `status/prd-review` after a Review result is posted.
- Processed files move to `intake/processed/`; failed files move to `intake/failed/`.
- Audit logs are written to `logs/issue-intake-runs.md` and `data/issue-intake-log.jsonl`.

This bridge is the fallback for environments where the Agent cannot safely store a GitHub PAT. It preserves the exam requirement that user original submissions must be stored verbatim in Issues, while keeping credentials out of chat and local prompt context.

## PRD Review candidate scan

Workflow: `.github/workflows/prd-review-scan.yml`

- Runs every 2 hours by GitHub cron: `0 */2 * * *`.
- Reads open GitHub Issues with `status/prd-review`.
- Processes at most 2 candidate issues per run to reduce GitHub API pressure.
- Writes candidate evidence to `data/prd-review-candidates.json`.
- Writes audit rows to `logs/prd-review-scan-runs.md`.
- This repository workflow only discovers and records candidates; the actual PRD Review is performed by 阿强's OpenClaw cron so the review can apply the PRD quality gate and @ 阿珍 with changes.

Review evidence requirements:

- Issue link.
- PRD path.
- PRD self-check result.

Only issues with all three evidence items should receive a formal Review conclusion. Missing evidence should be treated as a material gap and returned to 阿珍 to补齐.
