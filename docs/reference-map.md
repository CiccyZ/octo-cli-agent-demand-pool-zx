# 我方知识资料索引

本页记录考试期间回答产品功能、Bug/需求判断时优先参考的**我方仓库资料**。

> 约束：知识问答只能查本仓库、考试群上下文、以及曾茜明确授权的我方资料；不得读取 `Mininglamp-OSS/octo-cli` 目标仓库作为问答依据。若本仓库没有依据，回答“不确定”。

## 产品知识覆盖

- `docs/knowledge-base.md`：当前可用于答题的产品知识覆盖清单，包含凭证权限、环境变量、重试、错误输出、通用参数、功能域、安装发布、安全存储、Agent Skills。
- `README.md`：需求池定位、Agent 分工、考试约束、标准协作链路和文档索引。

## 需求与 PRD 依据

- `data/issue-snapshot.json`：当前 GitHub Issue 快照，用于查重、状态判断、已有反馈引用。
- `data/issue-intake-log.jsonl`：Issue 创建/更新日志，用于追踪处理历史。
- `docs/prd/`：已沉淀 PRD 草案与修订版本，用于回答需求背景、目标、范围和验收口径。
- `intake/processed/`：已处理 intake 文件，用于追溯原始提交和结构化字段。

## 流程与角色边界

- `docs/workflow.md`：考试工作流、功能问答边界、Bug/Feature/PRD/Review 流转规则。
- `docs/agent-roles.md`：阿珍/阿强职责边界。
- `docs/pm-workflow.md`：PM 收单、PRD、流转规则。
- `docs/prd-guideline.md`：PRD 写作规范。
- `docs/prd-review-guideline.md`：PRD Review 质量闸口。
- `docs/label-system.md`：Issue 标签体系。
- `docs/automation.md`：自动化与 intake bridge 说明。

## 答题使用建议

1. 先查 `docs/knowledge-base.md` 是否已有明确产品知识。
2. 若是需求/PRD/状态问题，再查 `data/issue-snapshot.json`、`data/issue-intake-log.jsonl`、`docs/prd/`、`intake/processed/`。
3. 每条确定结论都给出本仓库相对路径和行号。
4. 找不到依据时，直接说“我目前没在我们自己的仓库/资料里找到依据，所以不确定。”
