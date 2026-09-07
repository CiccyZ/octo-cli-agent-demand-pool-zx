# octo-cli Agent 知识库覆盖清单

本文件用于对照考试图中的「这个 CLI 是干什么的」知识覆盖要求，帮助阿珍/阿强在考试群回答产品功能、Bug、需求和 PRD 问题时快速定位依据。

> 答题规则：能确认的结论必须带来源；不确定时说“不确定”，不要编造路径和行号。

## 1. 凭证权限：token 类型、权限、掩码规则

### 需要掌握

- `app_*`：App Bot。可 DM；不能群/thread 写；不能 voice；不能 search。
- `bf_*`：User Bot。支持 DM、群、thread、voice、search。
- `uk_*`：User API key。真人身份，主要用于 message search 和 drive，路由到 `/v1/user/*`。
- `octo_loop_*`：Loop task credential，按 Fleet policy 使用。
- token 输出会被 masking：保留前缀、两个开头字符、固定 `***` 和末尾四位；未知前缀完全隐藏。

### 参考来源

- `README.md#L234-L258`：认证与 token 类型能力表。
- `docs/octo-cli-design.md#L9-L19`：Bot Type Reference。
- `SECURITY.md#L38-L50`：token masking 规则。

## 2. 配置环境变量：必填项、各自作用

### 需要掌握

- token 来源优先级：stored profile > `OCTO_TOKEN` > `OCTO_BOT_TOKEN`。
- `OCTO_TOKEN`：推荐变量，支持 `app_*` / `bf_*` / `uk_*`。
- `OCTO_BOT_TOKEN`：兼容变量，也支持 `octo_loop_*`。
- `OCTO_API_BASE_URL`：可选 API base URL，默认 `https://im.deepminer.com.cn`。
- `OCTO_CONFIG_DIR`：配置/凭证目录，默认 `~/.octo-cli`。
- `OCTO_SPACE_ID`：platform-scoped bot 的 Space context。
- `OCTO_FORMAT`：默认输出格式。
- `OCTO_CREDENTIAL_MODE=task`：daemon-launched Loop task 场景使用。

### 参考来源

- `README.md#L260-L302`：token 变量、API Base URL、环境变量表。

## 3. 传输重试：超时、重试次数、退避策略

### 需要掌握

- 默认最大重试：3 次。
- base delay：500ms。
- max delay：10s。
- request timeout：30s，可用 `--timeout <duration>` 覆盖。
- retryable codes：429、502、503、504。
- `Retry-After` 会被遵守，且不受 max delay 限制。
- `--no-retry` 可关闭 transient failure 重试。

### 参考来源

- `docs/architecture-design.md#L364-L373`：Retry & Timeout。
- `README.md#L341-L353`：`--timeout` / `--no-retry` 通用参数。

## 4. 输出错误：JSON 封装格式、错误分类、退出码

### 需要掌握

- 成功输出在 stdout，结构是 JSON envelope：`ok`、`identity`、`data`、`_pagination`、`_rate_limit`。
- 失败输出在 stderr，结构是 error envelope：`ok:false`、`error.type`、`error.code`、`error.message`、`error.hint`、`error.detail`。
- 退出码：`3` auth，`2` validation/config，`1` 其他。
- 本地校验失败不发请求，例如缺少必填字段、enum 不合法、uint64 非法等。
- 后端错误会映射到 CLI 类型，如 `auth_error`、`validation`、`permission`、`rate_limited`、`network`、`api_error`。

### 参考来源

- `README.md#L304-L339`：成功/失败 envelope 和退出码。
- `docs/architecture-design.md#L223-L240`：Backend Error → CLI Type 映射。
- `docs/architecture-design.md#L242-L279`：pagination / rate limit / notice envelope。

## 5. 通用参数：`--format` / `--jq` / `--dry-run` / `--page-all`

### 需要掌握

- `--format`：`json` / `table` / `csv` / `ndjson`。
- `--jq`, `-q`：对 envelope 应用 jq 表达式后再格式化。
- `--dry-run`：只打印解析后的请求，不实际发送，适合检查副作用操作。
- `--verbose`：stderr 输出 request/response trace。
- `--timeout`：单次请求 deadline。
- `--no-retry`：禁用重试。
- `--space`：单次调用覆盖 `OCTO_SPACE_ID`。
- `--page-all`：自动翻页直到 `has_more=false`，合并输出。
- `--page-limit`：限制 `--page-all` 最多抓取页数，默认 10。

### 参考来源

- `README.md#L341-L369`：Universal flags 和示例。
- `docs/architecture-design.md#L431-L457`：Universal Flags 与 `octo-cli api`。

## 6. 功能域操作：支持的功能域、操作数、不可用操作说明

### 需要掌握

支持域与用途：

- `docs`：32 ops，文档/表格/白板。
- `html`：20 ops，交互式 HTML 文档。
- `drive`：43 ops，网盘；加 composite commands 后 46 leaves。
- `matter`：14 ops，暂时 withheld。
- `summary`：4 ops，暂时 withheld。
- `group`：9 ops，群。
- `thread`：8 ops，thread。
- `bot`：6 ops，bot 生命周期。
- `message`：10 ops，消息发送、编辑、同步、回执、搜索。
- `file`：4 ops，文件上传下载。
- `event`：2 ops，事件轮询。
- `loop`：126 ops，Fleet control plane。

### 关键边界

- `matter` 和 `summary` 当前暂时 withheld，不要答成可用主能力。
- App Bot 不能 message search。
- App Bot 群写/thread 操作受限；User Bot 需要群成员身份。
- Loop 里的 task 不是 GitHub issue；如果考官明确说 GitHub issue，应在需求池仓库创建 GitHub Issue，不要误用 Loop task。

### 参考来源

- `README.md#L36-L51`：Domains 表。
- `README.md#L100-L185`：Quick Start 示例。
- `docs/octo-cli-design.md#L67-L97`：message domain。
- `docs/octo-cli-design.md#L101-L149`：group/thread domain 与限制。
- `skills/octo-loop/SKILL.md#L20-L28`：Loop task 与 GitHub/Jira issue 边界。

## 7. 安装发布：npm / go 安装方式、发布包命名规则

### 需要掌握

- npm 安装：`npm install -g @mininglamp-oss/octo-cli`。
- npm 包会解析匹配的平台子包，预置 Go binary，不从 GitHub 下载 binary。
- Go 安装：`go install github.com/Mininglamp-OSS/octo-cli/cmd/octo-cli@latest`。
- GitHub Release 包命名：`octo-cli_<version>_<os>_<arch>.tar.gz`，Windows 也是 `.tar.gz`。
- `install.sh`：`curl -fsSL https://raw.githubusercontent.com/Mininglamp-OSS/octo-cli/main/install.sh | sh`。
- npm 包是薄 Node wrapper，平台二进制在 optional dependency，如 `@mininglamp-oss/octo-cli-darwin-arm64`。
- npm 包使用 `--provenance` 发布，可用 `npm audit signatures` 验证。

### 参考来源

- `README.md#L53-L99`：安装方式与 Release 包命名。
- `npm/README.md#L1-L44`：npm 分发、平台包、trust model。

## 8. 安全本地存储：token 存储位置、加密方式

### 需要掌握

- `octo-cli auth login` 不把 token 写进 argv / shell history / agent transcript。
- token 加密存储在 `~/.octo-cli`，可用 `OCTO_CONFIG_DIR` 覆盖。
- `credentials.enc` 权限 0600，使用 AES-256-GCM，每条消息随机 nonce。
- `config.json` 存非 secret profile metadata；`cred.salt` 权限 0600；目录权限 0700。
- 加密 key：`SHA256(machineID ‖ salt)`；绑定机器，拷贝到另一台机器不能直接解密。

### 参考来源

- `SECURITY.md#L31-L36`：token 输入安全。
- `SECURITY.md#L52-L65`：本地凭证存储与加密方式。

## 9. Agent Skills：内置 skill 的使用方法

### 需要掌握

- Agent-facing Skill 文档在 `skills/` 下，并嵌入 release binary。
- `octo-cli skills`：列出 embedded skills。
- `octo-cli skills octo-mail`：读取某个 skill。
- `octo-cli skills octo-docs`：打印 skill 及其 references。
- `octo-cli skills --install <dir>`：把所有 skill 写到目录。
- 关键 skill：`octo-shared`、`octo-messaging`、`octo-files`、`octo-drive`、`octo-docs`、`octo-marketplace`、`octo-html`、`octo-mail`。
- `octo-matter` 和 `octo-summary` 暂时 withheld。

### 参考来源

- `README.md#L371-L412`：Agent Skills 列表与命令。
- `npm/README.md#L11-L17`：runtime 可直接加载 embedded Agent Skill 文档。

## 考试问答建议

1. 先判断问题属于 9 个模块中的哪一类。
2. 优先查本文件的参考来源，再回 `Mininglamp-OSS/octo-cli` 原文确认。
3. 回答格式建议：
   - 结论：一句话。
   - 依据：列 1-3 条来源。
   - 风险/边界：如果涉及权限、不可用操作、安全凭证，必须补充。
4. 如果是 Bug/需求：不要只回答知识点，要进入需求池流程，创建对应 Issue。
