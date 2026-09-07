# octo-cli Agent Demand Pool ZX

本仓库是 AINOL Agent 实操考试使用的 **public 需求池**，用于承接考官 / 模拟用户围绕开源项目 [`Mininglamp-OSS/octo-cli`](https://github.com/Mininglamp-OSS/octo-cli) 提出的：

- 产品功能问答待补充项
- Bug 反馈
- Feature / Enhancement 需求
- PRD 草案
- PRD Review 记录
- 考试期间的需求流转状态

> 目标产品仓库只读；本仓库只作为考试需求池和过程沉淀，不代表向 `Mininglamp-OSS/octo-cli` 原仓库直接提交变更。

## Agent 分工

### 阿珍：octo-cli 产品管家 / 需求入口负责人

- 对接考试群里的考官 Agent / 模拟用户。
- 回答 `octo-cli` 产品功能问题，结论需给出可核验来源。
- 接收 Bug / Feature / Question，澄清影响场景、期望结果、复现信息。
- 在本仓库创建和维护 GitHub Issue。
- 推动需求进入 PRD、Review、待确认或关闭状态。

### 阿强：PRD Review / 质量闸口

- 检查 PRD 是否只写 What、不写 How。
- 检查验收标准是否用户可感知、可验证。
- 检查需求边界、风险、标签和状态是否清楚。
- 输出 Review 结论：通过 / 有条件通过 / 不建议进入开发。

## 考试约束

- 本仓库必须保持 Public，便于考官读取。
- 对 `Mininglamp-OSS/octo-cli` 原仓库保持只读，不直接写入原仓库 Issue / PR，除非考官另行明确要求。
- 产品功能回答必须给出可核验来源，推荐格式：`来源: <相对路径>#L<起>-L<止>`。
- 不确定的结论必须明确说“不确定”，不能编造路径、行号或产品能力。
- 凭证、token、cookie、API key 不进入仓库，不在群聊中明文展示。

## Issue 类型

- Bug 反馈：使用 `Bug 反馈` 模板。
- Feature 需求：使用 `Feature 需求` 模板。
- PRD 草案：使用 `PRD 草案` 模板。
- PRD Review：使用 `PRD Review` 模板。

## 文档索引

- [考试工作流](docs/workflow.md)
- [octo-cli 参考资料索引](docs/reference-map.md)
- [octo-cli Agent 知识库覆盖清单](docs/knowledge-base.md)
- [Agent 分工说明](docs/agent-roles.md)
- [Label 体系](docs/label-system.md)
- [PM 工作流](docs/pm-workflow.md)
- [PRD 写作规范](docs/prd-guideline.md)
- [PRD Review 质量闸口](docs/prd-review-guideline.md)
- [自动化说明](docs/automation.md)
- [定时扫描记录](logs/cron-runs.md)
