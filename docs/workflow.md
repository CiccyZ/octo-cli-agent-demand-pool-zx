# 考试工作流

## 目标

确保考官 Agent / 模拟用户在考试群提出的功能问题、Bug、需求，都能被阿珍接住、原文保存、澄清、记录，并在 public GitHub 需求池中形成可读、可追踪的 Issue；需要 PRD 时由阿珍写草案，阿强做正式 Review。

## 标准流程

1. **接收问题**
   - 阿珍在考试群对接考官 Agent。
   - 判断输入类型：功能问答 / Bug / Feature / Question / PRD / Review。
   - 涉及反馈、Bug、需求时，用户原始提交必须原封不动进入 GitHub Issue。

2. **功能问答**
   - 优先查 `Mininglamp-OSS/octo-cli` 公开仓库资料。
   - 每条确定结论给出来源路径和行号。
   - 不确定时明确说明不确定，并标注需要补充的信息。

3. **Bug 收单**
   - 阿珍归档用户原文。
   - 澄清：问题描述、复现步骤、期望表现、实际表现、环境、证据。
   - 多人提到相似 Bug 时，优先追加到已有 Issue，减少重复 Issue。
   - 信息不足时标记 `status/needs-info`，但不因信息不足而丢弃用户原文。

4. **Feature / Enhancement 收单**
   - 阿珍归档用户原文。
   - 澄清：用户问题、使用场景、期望能力、收益、非目标、优先级线索。
   - 创建 Feature Issue。
   - 需要产品文档时转为 PRD 草案。

5. **PRD 草案与修改**
   - 阿珍负责把需求整理成 PRD 草案。
   - PRD 只写 What，不写 How。
   - 被打回时，阿珍根据阿强 Review 意见逐条修改，并在 Issue 中记录修改说明。

6. **PRD Review**
   - 阿强负责正式 PRD Review。
   - 阿强给出：通过 / 有条件通过 / 不建议进入开发。
   - Review 不通过时，Issue 状态由阿珍更新为 `status/needs-revision` 或 `status/needs-info`。
   - 修改后由阿强复审。

7. **回群同步**
   - 创建 Issue、状态变化、Review 返回、PRD 修改完成等有效变化，由阿珍回考试群同步：Issue 链接、摘要、当前状态、下一步。
   - 不发送“正在检查 / 无更新 / 一切正常”等无产出过程提示。
   - 对外承诺排期、优先级、方案前，必须等曾茜确认。

## 状态建议

- `status/new`：新收单，尚未分流。
- `status/needs-info`：缺关键信息，等待补充。
- `status/prd-drafting`：PRD 草案中。
- `status/prd-review`：等待阿强 Review。
- `status/needs-revision`：Review 后需要修改。
- `status/ready`：信息清楚，可进入后续处理。
- `status/closed`：已关闭或无需处理。
