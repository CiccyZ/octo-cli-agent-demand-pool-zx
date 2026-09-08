# Issue intake bridge

把待创建或待追加的 Issue 请求写成 JSON，放入 `intake/issues/` 并 push 到 `main`。
GitHub Actions 会用仓库自带的 `GITHUB_TOKEN` 创建 / 更新 GitHub Issue，然后把请求文件移动到 `intake/processed/` 或 `intake/failed/`。

## 新建 Issue 示例

```json
{
  "title": "登录失败时错误提示不清楚",
  "labels": ["type/bug", "priority/P2", "status/new", "source/user-feedback"],
  "original_submission": "用户原始提交原封不动放这里",
  "summary": "补充结构化摘要，不覆盖原文。",
  "acceptance_criteria": [
    "用户登录失败时能看到明确错误原因。",
    "错误提示不暴露敏感信息。"
  ],
  "next_step": "等待补充复现环境。"
}
```

## 追加到已有 Issue 示例

```json
{
  "issue_number": 12,
  "labels": ["priority/P1", "status/needs-info"],
  "original_submission": "第二位用户的原始反馈原文",
  "summary": "疑似同类问题，追加为相似反馈记录。",
  "next_step": "等待用户补充截图。"
}
```

## 规则

- `original_submission` 必须保留用户原文，不能改写。
- 判断、分类、优先级、待确认问题写在 `summary` / `next_step`，不能覆盖原文。
- 已有相似 Issue 时优先填写 `issue_number` 追加评论，避免重复 Issue 分散。
- 不要在 intake 文件中写入 token、cookie、API key 等凭证。
