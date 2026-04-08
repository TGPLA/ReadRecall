# 项目规则索引

## 规则同步机制

- 当用户要求新增**严格执行**的规则时，必须自动同步到 `.trae/rules/` 目录
- 本目录是规则的**执行层**，所有需要强制执行的规则都必须写在这里
- `03_开发协议.md` 是规则的**定义层**，用于记录规则的来源和说明

## 规则文件列表

| 文件 | 内容 |
|------|------|
| `rules_file.md` | 文件操作、命名规范、行数限制、新旧代码处理 |
| `rules_directory.md` | 第三方参考目录、归档目录 |
| `rules_version.md` | 版本号管理 |
| `rules_debug.md` | 前端调试流程 |
| `rules_architecture.md` | 架构变更同步 |
| `rules_testing.md` | 后端 API 本地集成测试规范 |
| `rules_verification.md` | 任务闭环验证：立即验证、文档同步、引用验证、立即提交 |
| `rules_functional_integrity.md` | 功能完整性校验：状态→逻辑→UI→交互→持久化五要素验证 |
| `rules_connection.md` | 数据库/服务器自动连接：自动获取配置，不要麻烦用户 |
| `projectcentric.md` | 模式优化护栏：评估任务与当前模式的匹配度，确保最佳执行质量 |
| `rules_language.md` | 全局语言规范：代码注释、变量函数命名、对话交流统一使用中文 |
