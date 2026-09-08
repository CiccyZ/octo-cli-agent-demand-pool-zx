const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  fs.mkdirSync(dir, {recursive: true});
}

function slugify(input) {
  return String(input || 'issue')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'issue';
}

function fence(text) {
  const value = String(text ?? '');
  const ticks = value.includes('```') ? '````' : '```';
  return `${ticks}text\n${value}\n${ticks}`;
}

function normalizeLabels(labels) {
  if (!Array.isArray(labels)) return [];
  return [...new Set(labels.map(String).map(s => s.trim()).filter(Boolean))];
}

function formatValue(value) {
  if (value == null || value === '') return '待补充';
  if (Array.isArray(value)) return value.map(x => `- ${x}`).join('\n') || '待补充';
  return String(value);
}

function section(title, value) {
  return `## ${title}\n\n${formatValue(value)}`;
}

function originalSubmissionBlock(item) {
  const lines = [];
  if (item.reporter_name || item.reporter_uid || item.reporter_octo) {
    const reporter = [item.reporter_name, item.reporter_uid || item.reporter_octo]
      .filter(Boolean)
      .join(' / ');
    lines.push(`提交人：${reporter}`);
  }
  if (item.message_time) lines.push(`提交时间：${item.message_time}`);
  if (item.attachments) lines.push(`附件：${formatValue(item.attachments)}`);
  if (lines.length) lines.push('');
  lines.push(fence(item.original_submission || '待补充'));
  return lines.join('\n');
}

function buildIssueBody(item, filename) {
  const sections = [];
  sections.push(`<!-- azhen-intake-file: ${filename} -->`);
  sections.push(section('用户原始提交', originalSubmissionBlock(item)));
  sections.push(section('错误描述', item.error_description || item.summary));
  sections.push(section('根本原因', item.root_cause));
  sections.push(section('预期行为', item.expected_behavior));
  sections.push(section('复现步骤', item.reproduction_steps));
  sections.push(section('建议的修复方案', item.proposed_fix));
  sections.push(section('环境', item.environment));
  if (item.body) sections.push(String(item.body));
  if (item.acceptance_criteria) sections.push(section('验收标准', item.acceptance_criteria));
  if (item.next_step) sections.push(section('下一步', item.next_step));
  return sections.filter(Boolean).join('\n\n');
}

function buildCreateBody(item, filename) {
  return buildIssueBody(item, filename) + '\n\n---\n由 GitHub Actions Issue intake bridge 从 `intake/issues/` 自动创建。';
}

function buildUpdateComment(item, filename) {
  return buildIssueBody(item, filename).replace(/^## /gm, '### ').replace(/^### 用户原始提交/, '## 追加反馈\n\n### 用户原始提交') + '\n\n---\n由 GitHub Actions Issue intake bridge 从 `intake/issues/` 自动追加。';
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

async function addLabelsIfAny(github, owner, repo, issue_number, labels, core) {
  if (!labels.length) return;
  try {
    await github.rest.issues.addLabels({owner, repo, issue_number, labels});
  } catch (error) {
    core.warning(`Failed to add labels to #${issue_number}: ${error.message}`);
  }
}

async function removeLabelsIfAny(github, owner, repo, issue_number, labels, core) {
  if (!labels.length) return;
  for (const name of labels) {
    try {
      await github.rest.issues.removeLabel({owner, repo, issue_number, name});
    } catch (error) {
      if (error.status === 404) {
        core.info(`label ${name} not present on #${issue_number}; skip removal`);
      } else {
        core.warning(`Failed to remove label ${name} from #${issue_number}: ${error.message}`);
      }
    }
  }
}

module.exports = async ({github, context, core}) => {
  const {owner, repo} = context.repo;
  const intakeDir = 'intake/issues';
  const processedDir = 'intake/processed';
  const failedDir = 'intake/failed';
  const dataDir = 'data';
  const logPath = 'logs/issue-intake-runs.md';
  const jsonlPath = 'data/issue-intake-log.jsonl';
  ensureDir(intakeDir);
  ensureDir(processedDir);
  ensureDir(failedDir);
  ensureDir(dataDir);
  ensureDir('logs');
  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, '# Issue intake runs\n\n| Time UTC | Intake file | Action | Result |\n|---|---|---|---|\n');
  }

  const files = fs.readdirSync(intakeDir)
    .filter(name => name.endsWith('.json'))
    .sort();

  if (files.length === 0) {
    core.info('No intake JSON files found.');
    return;
  }

  const now = new Date().toISOString();
  for (const name of files) {
    const src = path.join(intakeDir, name);
    let item;
    try {
      item = readJson(src);
      if (!item || typeof item !== 'object') throw new Error('intake JSON must be an object');
      const labels = normalizeLabels(item.labels);
      const removeLabels = normalizeLabels(item.remove_labels);
      let action;
      let result;
      if (item.issue_number && item.comment_body) {
        const issue_number = Number(item.issue_number);
        if (!Number.isInteger(issue_number) || issue_number <= 0) {
          throw new Error('issue_number must be a positive integer when provided');
        }
        await github.rest.issues.createComment({
          owner,
          repo,
          issue_number,
          body: String(item.comment_body),
        });
        await addLabelsIfAny(github, owner, repo, issue_number, labels, core);
        await removeLabelsIfAny(github, owner, repo, issue_number, removeLabels, core);
        action = `commented #${issue_number}`;
        result = `https://github.com/${owner}/${repo}/issues/${issue_number}`;
      } else if (item.issue_number && (item.replace_issue_body || item.set_issue_body)) {
        const issue_number = Number(item.issue_number);
        if (!Number.isInteger(issue_number) || issue_number <= 0) {
          throw new Error('issue_number must be a positive integer when provided');
        }
        let body;
        if (item.set_issue_body) {
          body = String(item.set_issue_body);
        } else {
          const replacements = Array.isArray(item.replace_issue_body)
            ? item.replace_issue_body
            : [item.replace_issue_body];
          const issue = await github.rest.issues.get({owner, repo, issue_number});
          body = String(issue.data.body || '');
          for (const replacement of replacements) {
            if (!replacement || typeof replacement !== 'object') throw new Error('replace_issue_body entries must be objects');
            const from = String(replacement.from ?? '');
            const to = String(replacement.to ?? '');
            if (!from) throw new Error('replace_issue_body.from is required');
            body = body.split(from).join(to);
          }
        }
        await github.rest.issues.update({owner, repo, issue_number, body});
        await addLabelsIfAny(github, owner, repo, issue_number, labels, core);
        await removeLabelsIfAny(github, owner, repo, issue_number, removeLabels, core);
        action = `edited #${issue_number}`;
        result = `https://github.com/${owner}/${repo}/issues/${issue_number}`;
      } else if (item.issue_number) {
        const issue_number = Number(item.issue_number);
        if (!Number.isInteger(issue_number) || issue_number <= 0) {
          throw new Error('issue_number must be a positive integer when provided');
        }
        await github.rest.issues.createComment({
          owner,
          repo,
          issue_number,
          body: buildUpdateComment(item, name),
        });
        await addLabelsIfAny(github, owner, repo, issue_number, labels, core);
        await removeLabelsIfAny(github, owner, repo, issue_number, removeLabels, core);
        action = `updated #${issue_number}`;
        result = `https://github.com/${owner}/${repo}/issues/${issue_number}`;
      } else {
        if (!item.title || !String(item.title).trim()) throw new Error('title is required for new issues');
        const created = await github.rest.issues.create({
          owner,
          repo,
          title: String(item.title).trim(),
          body: buildCreateBody(item, name),
          labels,
        });
        action = `created #${created.data.number}`;
        result = created.data.html_url;
      }
      const processedName = `${now.replace(/[:.]/g, '-')}-${slugify(name.replace(/\.json$/, ''))}.json`;
      const dst = path.join(processedDir, processedName);
      fs.renameSync(src, dst);
      const record = {time: now, file: name, action, result, labels, remove_labels: removeLabels};
      fs.appendFileSync(jsonlPath, JSON.stringify(record) + '\n');
      fs.appendFileSync(logPath, `| ${now} | ${name} | ${action} | ${result} |\n`);
      core.info(`${action}: ${result}`);
    } catch (error) {
      const failedName = `${now.replace(/[:.]/g, '-')}-${slugify(name.replace(/\.json$/, ''))}.json`;
      const dst = path.join(failedDir, failedName);
      fs.renameSync(src, dst);
      const message = error && error.message ? error.message : String(error);
      const record = {time: now, file: name, action: 'failed', result: message};
      fs.appendFileSync(jsonlPath, JSON.stringify(record) + '\n');
      fs.appendFileSync(logPath, `| ${now} | ${name} | failed | ${message.replace(/\|/g, '\\|')} |\n`);
      core.setFailed(`Failed to process ${name}: ${message}`);
      return;
    }
  }
};
