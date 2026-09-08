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

function buildCreateBody(item, filename) {
  const sections = [];
  sections.push(`<!-- azhen-intake-file: ${filename} -->`);
  if (item.original_submission) {
    sections.push('## 用户原始反馈\n\n' + fence(item.original_submission));
  }
  if (item.summary) sections.push('## 结构化摘要\n\n' + String(item.summary));
  if (item.body) sections.push(String(item.body));
  if (item.acceptance_criteria) {
    const lines = Array.isArray(item.acceptance_criteria)
      ? item.acceptance_criteria.map(x => `- ${x}`).join('\n')
      : String(item.acceptance_criteria);
    sections.push('## 初步验收口径\n\n' + lines);
  }
  if (item.next_step) sections.push('## 下一步\n\n' + String(item.next_step));
  sections.push('---\n由 GitHub Actions Issue intake bridge 从 `intake/issues/` 自动创建。');
  return sections.filter(Boolean).join('\n\n');
}

function buildUpdateComment(item, filename) {
  const sections = [];
  sections.push(`<!-- azhen-intake-file: ${filename} -->`);
  sections.push('## 追加反馈');
  if (item.original_submission) {
    sections.push('### 用户原始反馈\n\n' + fence(item.original_submission));
  }
  if (item.summary) sections.push('### 结构化摘要\n\n' + String(item.summary));
  if (item.body) sections.push(String(item.body));
  if (item.next_step) sections.push('### 下一步\n\n' + String(item.next_step));
  sections.push('---\n由 GitHub Actions Issue intake bridge 从 `intake/issues/` 自动追加。');
  return sections.filter(Boolean).join('\n\n');
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
      let action;
      let result;
      if (item.issue_number && item.replace_issue_body) {
        const issue_number = Number(item.issue_number);
        if (!Number.isInteger(issue_number) || issue_number <= 0) {
          throw new Error('issue_number must be a positive integer when provided');
        }
        const replacements = Array.isArray(item.replace_issue_body)
          ? item.replace_issue_body
          : [item.replace_issue_body];
        const issue = await github.rest.issues.get({owner, repo, issue_number});
        let body = String(issue.data.body || '');
        for (const replacement of replacements) {
          if (!replacement || typeof replacement !== 'object') throw new Error('replace_issue_body entries must be objects');
          const from = String(replacement.from ?? '');
          const to = String(replacement.to ?? '');
          if (!from) throw new Error('replace_issue_body.from is required');
          body = body.split(from).join(to);
        }
        await github.rest.issues.update({owner, repo, issue_number, body});
        await addLabelsIfAny(github, owner, repo, issue_number, labels, core);
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
      const record = {time: now, file: name, action, result, labels};
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
