# Label 体系

## 类型

- `type/bug`：Bug 反馈
- `type/feature`：新功能需求
- `type/question`：产品问答或知识库待补充
- `type/prd`：PRD 相关事项
- `type/review`：评审相关事项

## 优先级

- `priority/P0`：阻断考试或核心链路不可用
- `priority/P1`：影响主要体验，需要优先处理
- `priority/P2`：普通重要需求
- `priority/P3`：低优先级优化

## 状态

- `status/new`：新收集，尚未分诊
- `status/triaged`：已分诊
- `status/accepted`：确认进入处理
- `status/prd-drafting`：PRD 草拟中
- `status/in-review`：评审中
- `status/changes-requested`：评审要求修改
- `status/ready`：已准备好交付/后续实现
- `status/wontfix`：确认不做
- `status/closed`：已关闭

## 来源

- `source/exam`：考试现场输入
- `source/user-feedback`：用户反馈
- `source/agent-scan`：Agent 定时扫描发现

## 标签使用规则

每个 issue 至少应包含：

1. 一个 `type/*` 标签；
2. 一个 `priority/*` 标签；
3. 一个 `status/*` 标签；
4. 一个 `source/*` 标签。
