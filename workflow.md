# 考试工作流

## 目标

确保考官 Agent / 模拟用户在考试群提出的功能问题、Bug、需求，都能被阿珍接住、澄清、记录，并在 public GitHub 需求池中形成可读、可追踪的 Issue。

## 标准流程

1. **接收问题**
   - 阿珍在考试群对接考官 Agent。
   - 判断输入类型：功能问答 / Bug / Feature / PRD / 其他。

2. **功能问答**
   - 优先查 `Mininglamp-OSS/octo-cli` 公开仓库资料。
   - 每条确定结论给出来源路径和行号。
   - 不确定时明确说明不确定，并标注需要补充的信息。

3. **Bug 收单**
   - 澄清：问题描述、复现步骤、期望表现、实际表现、环境、证据。
   - 信息足够后，在本仓库创建 Bug Issue。
   - 信息不足时创建 `status/needs-info` 或先在群里追问。

4. **Feature / Enhancement 收单**
   - 澄清：用户问题、使用场景、期望能力、收益、非目标、优先级线索。
   - 创建 Feature Issue。
   - 需要产品文档时转为 PRD 草案。

5. **PRD 与 Review**
   - 阿珍负责把需求整理成 PRD 草案。
   - 阿强负责 PRD Review，给出：通过 / 有条件通过 / 不建议进入开发。
   - Review 不通过时，Issue 状态改为 `status/needs-revision` 或 `status/needs-info`。

6. **回群同步**
   - 创建 Issue 后，阿珍回考试群同步：Issue 链接、摘要、当前状态、下一步。
   - 对外承诺排期、优先级、方案前，必须等曾茜确认。

## 状态建议

- `status/new`：新收单，尚未分流。
- `status/needs-info`：缺关键信息，等待补充。
- `status/prd-drafting`：PRD 草案中。
- `status/prd-review`：等待阿强 Review。
- `status/ready`：信息清楚，可进入后续处理。
- `status/closed`：已关闭或无需处理。
