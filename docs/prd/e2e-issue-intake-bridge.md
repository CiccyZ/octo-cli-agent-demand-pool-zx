# PRD 初稿：GitHub Actions Issue Intake Bridge 端到端验证

关联 Issue: https://github.com/CiccyZ/octo-cli-agent-demand-pool-zx/issues/1
状态: Draft v0.2（按阿强 Review 有条件通过意见修订）
作者: 阿珍
日期: 2026-09-08

## 1. 背景

在 AINOL octo-cli 产品管家考试链路中，阿珍需要把考官 / 模拟用户在 Octo 群中提交的反馈原文沉淀为 GitHub Issue，并维护类型、优先级、状态、来源等标签。

由于当前阿珍只有仓库内容写入能力，不能直接调用 GitHub Issues API，因此需要通过仓库自动化能力中转：阿珍负责把结构化 intake 文件提交到仓库，系统自动将反馈创建或追加到 GitHub Issue。

## 2. 用户原始提交

```text
@阿珍 开始测试，现在我是考官
```

## 3. 目标

验证并固化一条不依赖 PAT 的最小 Issue 写入闭环：

阿珍接收反馈 → 保留用户原文 → 生成 intake JSON → git push → GitHub Actions 创建 / 更新 Issue → 记录审计日志 → 阿珍回群同步。

## 4. 非目标

- 不在本 PRD 中设计 Octo 群自动通知实现。
- 不在本 PRD 中设计相似 Bug 智能识别或自动合并算法。
- 不在本 PRD 中替代阿强的 PRD Review 质量闸口。
- 不把 GitHub token、PAT、cookie 或任何凭证写入仓库 / 群聊 / PRD。

## 5. 用户场景

### 场景 A：新反馈创建 Issue

考官在 Octo 群提交一条反馈后，阿珍需要把原始文本完整保存到 GitHub Issue，并补充结构化摘要、标签和下一步。

### 场景 B：人工判断后追加到已有 Issue

当阿珍已判断该反馈应合并到已有 Issue，并在 intake JSON 中明确填写 `issue_number` 时，系统应将新用户原文追加到对应 Issue，而不是创建重复 Issue。

### 场景 C：过程可追踪

考官需要能在仓库中看到 intake 请求是否被处理、生成了哪个 Issue、失败原因是什么。

## 6. 功能范围

### 6.1 Intake JSON 输入

仓库支持在 `intake/issues/` 下放置 JSON 文件。

新建 Issue 时至少包含：

- `title`
- `labels`
- `original_submission`
- 可选：`summary`、`body`、`acceptance_criteria`、`next_step`

追加到已有 Issue 时至少包含：

- `issue_number`
- `original_submission`
- 可选：`labels`、`summary`、`body`、`next_step`

### 6.2 Issue 创建 / 更新

系统读取 `intake/issues/` 下的 JSON 并触发仓库自动化流程：

- 无 `issue_number` 时创建新 Issue。
- 有 `issue_number` 时追加评论到已有 Issue。
- `original_submission` 必须作为独立段落原封不动写入 Issue 正文或评论。
- `labels` 必须应用到目标 Issue。

### 6.3 处理结果归档

- 成功处理的 intake 文件移动到 `intake/processed/`。
- 失败处理的 intake 文件移动到 `intake/failed/`。
- 每次处理写入：
  - `logs/issue-intake-runs.md`
  - `data/issue-intake-log.jsonl`

### 6.4 群内同步

当 Issue 创建 / 更新成功后，阿珍在 Octo 群人工同步：

- Issue 链接
- 当前状态
- 下一步
- 如进入 PRD Review，明确 @ 阿强进入 Review

本阶段群内同步由阿珍人工完成，不包含自动发群通知能力；自动通知另起需求。

## 7. 验收标准

1. 给定一个包含 `title`、`labels`、`original_submission` 的 intake JSON，Actions 能创建一个 GitHub Issue。
2. 创建出的 Issue 正文包含用户原始提交，且文本未被改写。
3. 创建出的 Issue 带有 intake JSON 中声明的标签。
4. 处理成功后，原 intake 文件出现在 `intake/processed/`，不再留在 `intake/issues/`。
5. `logs/issue-intake-runs.md` 记录处理时间、源文件、动作和 Issue 链接。
6. `data/issue-intake-log.jsonl` 记录机器可读的处理结果。
7. 给定一个包含 `issue_number` 的 intake JSON，Actions 能向对应 Issue 追加评论，并保留新增反馈原文。
8. 处理失败时，文件进入 `intake/failed/`，不得进入 `intake/processed/`。
9. 失败时如 Issue 未成功创建 / 更新，日志需记录源文件、失败时间、失败原因、处理状态 `failed`。
10. 失败态不得被阿珍或系统同步为“已创建 / 已更新 Issue”。

## 8. 风险与待确认

- GitHub Actions 权限依赖仓库设置中的 Actions / Workflow permissions；如果仓库禁止 `issues: write`，中转会失败。
- Deploy Key 只能 push 仓库内容，不能直接操作 Issues；Issue 写入依赖 Actions。
- 当前只完成最小闭环验证，尚未实现 Octo 群自动通知。
- 相似 Bug 合并目前依赖阿珍判断并填写 `issue_number`，尚未自动化。

## 9. 当前测试证据

- 测试 Issue: https://github.com/CiccyZ/octo-cli-agent-demand-pool-zx/issues/1
- Intake 处理日志: `logs/issue-intake-runs.md`
- 机器可读日志: `data/issue-intake-log.jsonl`
- 已处理文件目录: `intake/processed/`

## 10. v0.2 修订记录

根据阿强 Review「有条件通过」意见，v0.2 做了以下修订：

1. 收敛 What / How 边界：将实现细节表述改为“通过仓库内 intake 文件触发自动化流程，将反馈创建或追加到 GitHub Issue，并记录处理结果”。
2. 澄清相似反馈追加前提：必须由阿珍先判断并在 intake JSON 中明确填写 `issue_number`，不包含自动识别相似 Bug。
3. 明确群内同步范围：本阶段由阿珍人工同步，不包含自动发群通知能力。
4. 补充失败态验收：失败文件不得进入 processed；日志需记录源文件、失败时间、失败原因、处理状态 `failed`；失败不得被同步成成功。

## 11. 提交复审请求

请阿强按 PRD Review 闸口复审本 PRD v0.2，重点确认 4 个条件是否已修订到位。
