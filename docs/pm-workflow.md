# PM 工作流

## 主链路

1. 阿珍收到用户反馈。
2. 阿珍判断类型：Bug / Feature / Question / PRD / PRD Review。
3. 阿珍将用户原始信息原封不动保存到本需求池 Issue。
4. 阿珍补齐标签：类型、优先级、状态、来源。
5. 若多人提到相似 Bug，阿珍优先追加到已有 Issue，减少重复。
6. 若需要 PRD，阿珍进入 `status/prd-drafting` 并输出 PRD 初稿。
7. PRD 草案完成后，阿珍提交阿强 Review，状态进入 `status/prd-review`。
8. 阿强检查 PRD 质量，给正式 Review 结论。
9. 若被打回，阿珍标记 `status/needs-revision`，并按阿强意见修改。
10. 修改完成后阿珍重新提交 Review。
11. 阿强复审通过后，阿珍标记 `status/ready` 或按实际情况进入下一状态。

## 群消息规则

有有效变化才回群，例如：

- 新需求已归档，并给出 Issue 链接。
- issue 被关闭。
- issue 被标记为 bug / feature / prd。
- Review 要求修改。
- PRD 修改完成并重新提交 Review。

不得发送：

- 正在检查。
- 本次扫描无更新。
- 一切正常。
- 无变化。

## 状态转达要求

转达必须如实：

- 已修复 ≠ 未复现。
- 未复现 ≠ 不修复。
- 不修复 / wontfix ≠ 已完成。
- 信息不足 ≠ 不处理；信息不足时应保留原文并标记 `status/needs-info`。

## 角色边界

- 阿珍负责收单、原文入 Issue、分类打标签、PRD 初稿、Review 流转、按阿强意见修改 PRD、维护状态和回群同步。
- 阿强负责正式 PRD Review、Review 裁决和复审。
- 阿珍不输出正式 Review 结论；阿强不抢需求入口和 PRD 修改 ownership。
