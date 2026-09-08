const fs = require('fs');

function ensureDir(dir) {
  fs.mkdirSync(dir, {recursive: true});
}

function labelNames(issue) {
  return (issue.labels || []).map(l => typeof l === 'string' ? l : l.name).filter(Boolean);
}

function stripMdNoise(text) {
  return String(text || '').replace(/\r/g, '').trim();
}

function extractPrdPath(text) {
  const raw = stripMdNoise(text);
  const patterns = [
    /PRD\s*(?:路径|文件|文档)\s*[:：]\s*`?([^`\n\r]+?\.md)`?(?=\s|$)/i,
    /`(docs\/prd\/[^`\n\r]+?\.md)`/i,
    /(docs\/prd\/[^\s)\]，。；;]+?\.md)/i,
  ];
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (match) return match[1].trim();
  }
  return '';
}

function extractSelfCheck(text) {
  const raw = stripMdNoise(text);
  const start = raw.search(/自检(?:结果|清单)?\s*[:：]?/);
  if (start < 0) return '';
  const chunk = raw.slice(start, start + 1200);
  const nextHeading = chunk.slice(20).search(/\n#{1,3}\s+/);
  return (nextHeading >= 0 ? chunk.slice(0, nextHeading + 20) : chunk).trim();
}

async function listComments(github, owner, repo, issue_number) {
  return github.paginate(github.rest.issues.listComments, {
    owner,
    repo,
    issue_number,
    per_page: 100,
  });
}

module.exports = async ({github, context, core}) => {
  const {owner, repo} = context.repo;
  const now = new Date().toISOString();
  const maxPerRun = Number(process.env.MAX_PRD_REVIEW_ISSUES || '2');

  ensureDir('data');
  ensureDir('logs');

  const issues = await github.paginate(github.rest.issues.listForRepo, {
    owner,
    repo,
    state: 'open',
    labels: 'status/prd-review',
    per_page: 100,
  });

  const candidates = [];
  const openIssues = issues
    .filter(issue => !issue.pull_request)
    .sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));

  for (const issue of openIssues.slice(0, maxPerRun)) {
    const comments = await listComments(github, owner, repo, issue.number);
    const evidenceText = [issue.body || '', ...comments.map(c => c.body || '')].join('\n\n---comment---\n\n');
    const prdPath = extractPrdPath(evidenceText);
    const selfCheck = extractSelfCheck(evidenceText);
    candidates.push({
      number: issue.number,
      title: issue.title,
      html_url: issue.html_url,
      labels: labelNames(issue).sort(),
      updated_at: issue.updated_at,
      prd_path: prdPath || null,
      prd_url: prdPath ? `https://raw.githubusercontent.com/${owner}/${repo}/main/${prdPath}` : null,
      self_check: selfCheck || null,
      evidence: {
        issue_link: issue.html_url,
        prd_path: prdPath || null,
        self_check_present: Boolean(selfCheck),
      },
      ready_for_review: Boolean(prdPath && selfCheck),
      scan_notes: prdPath && selfCheck
        ? 'ready: issue has status/prd-review, PRD path, and self-check evidence'
        : 'blocked: missing PRD path or self-check evidence; ask 阿珍 to补齐 before formal Review',
    });
  }

  const output = {
    generated_at: now,
    scan_rule: {
      label: 'status/prd-review',
      max_per_run: maxPerRun,
      sort: 'oldest updated_at first',
      purpose: 'candidate discovery only; final PRD Review is performed by 阿强 OpenClaw cron',
    },
    total_open_prd_review_issues: openIssues.length,
    candidates,
  };

  fs.writeFileSync('data/prd-review-candidates.json', JSON.stringify(output, null, 2) + '\n');

  const logPath = 'logs/prd-review-scan-runs.md';
  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, '# PRD Review scan runs\n\n| Time UTC | Scope | Max | Candidates | Ready | Result |\n|---|---|---:|---:|---:|---|\n');
  }
  const ready = candidates.filter(c => c.ready_for_review).length;
  const result = candidates.length
    ? `wrote data/prd-review-candidates.json; ready ${ready}/${candidates.length}`
    : 'no open issue with status/prd-review';
  fs.appendFileSync(logPath, `| ${now} | status/prd-review | ${maxPerRun} | ${candidates.length} | ${ready} | ${result} |\n`);
  core.info(result);
};
