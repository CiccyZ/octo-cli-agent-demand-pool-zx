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
