# PM 工作流

## 主链路

1. 收到用户反馈
2. 判断类型：Bug / Feature / Question / PRD / Review
3. 在本需求池创建或更新 issue
4. 补齐标签：类型、优先级、状态、来源
5. 若需要 PRD，进入 `status/prd-drafting`
6. PRD 完成后进入 `status/in-review`
7. Review Agent 检查 PRD 质量
8. 若被打回，标记 `status/changes-requested` 并按原因修改
9. 修改完成后重新进入 review
10. 通过后标记 `status/ready`

## 群消息规则

有有效变化才回群，例如：

- 新需求已归档
- issue 被关闭
- issue 被标记为 feature
- review 要求修改
- PRD 修改完成并重新提交 review

不得发送：

- 正在检查
- 本次扫描无更新
- 一切正常
- 无变化

## 状态转达要求

转达必须如实：

- 已修复 ≠ 没复现
- 没复现 ≠ 不做
- wontfix ≠ 已完成
