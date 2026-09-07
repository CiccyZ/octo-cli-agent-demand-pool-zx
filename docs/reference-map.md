# octo-cli 参考资料索引

本页记录考试期间回答产品功能、Bug/需求判断时优先参考的 `Mininglamp-OSS/octo-cli` 文件。

## 产品总览

- `README.md#L7-L11`：octo-cli 定位：面向 AI Agent Bot 的单二进制 REST CLI，输出结构化 JSON envelope。
- `README.md#L36-L51`：Domain 总览：docs、html、drive、group、thread、message、file、event、loop 等。
- `README.md#L100-L185`：Quick Start：消息、搜索、群/thread、文件、docs、loop 等命令示例。

## 认证与权限边界

- `README.md#L234-L258`：token 类型与能力表：`app_*`、`bf_*`、`uk_*`、`octo_loop_*`。
- `docs/octo-cli-design.md#L9-L19`：Bot Type Reference。
- `docs/octo-cli-design.md#L101-L149`：group/thread 能力与 App Bot 限制。

## 消息与搜索

- `docs/octo-cli-design.md#L67-L97`：message domain 命令、搜索命令和跨频道行为。
- `skills/octo-messaging/SKILL.md#L93-L139`：Agent 使用消息搜索时的操作说明。

## Drive / Docs / Loop

- `docs/octo-cli-design.md#L211-L270`：drive domain 部分命令和权限说明。
- `skills/octo-loop/SKILL.md#L20-L28`：Loop 与 GitHub/Jira issue 的边界，不要把明确指 GitHub/Jira 的 issue 误当 Loop task。
- `skills/octo-loop/SKILL.md#L85-L142`：Loop 读写 workflow；如考试涉及 Loop task 可参考。

## 工程与质量

- `CONTRIBUTING.md#L46-L93`：metadata-driven 架构与新增 API domain 的方式。
- `CONTRIBUTING.md#L114-L119`：测试要求。
- `.github/pull_request_template.md#L1-L21`：PR 模板字段，可借鉴需求/PRD 交付字段。

## 安全

- `SECURITY.md#L31-L36`：token 不应出现在命令行 / shell history / agent transcript。
- `SECURITY.md#L38-L58`：token 输出 masking 与本地加密存储。
