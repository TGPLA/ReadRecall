---
name: "项目开发技能库"
description: "阅读回响项目的任务路由入口。当收到任何开发需求时，首先加载此技能以识别任务领域，然后自动加载对应的L2领域技能。"
---

# 阅读回响 - AI 任务识别与路由

## 核心原则

拿到用户需求后，**第一时间判断属于哪个领域**，立即加载对应领域的 SKILL.md。

## 执行流程（必须遵守）

```
第一步: 识别任务类型 → 加载 L2
第二步: L2 引导到 L3（列出该领域的所有模块）
第三步: L3 引导到 L4（具体实现文件）
```

---

## 领域映射表（L2 路由）

| 任务领域 | 关键词 | 加载路径 |
|---------|--------|---------|
| **前端开发** | React、组件、页面、UI、样式、Tailwind、Hook、状态管理 | `skills/前端开发/SKILL.md` |
| **后端开发** | Go、API、数据库、控制器、中间件、智谱AI、服务 | `skills/后端开发/SKILL.md` |
| **部署运维** | Docker、Nginx、SSH、服务器、端口映射、环境配置 | `skills/部署运维/SKILL.md` |
| **测试调试** | 测试、Vitest、Playwright、Bug修复、控制台错误 | `skills/测试调试/SKILL.md` |

### 详细关键词匹配规则

#### → 前端开发 (skills/前端开发/SKILL.md)

**触发条件（满足任一即加载）：**
- 组件相关：`组件` `Modal` `Drawer` `Card` `Button` `Form` `Select` `Dialog`
- 页面相关：`页面` `路由` `视图` `Page` `Reader` `Shelf` `Settings`
- 功能模块：
  - 书籍管理：`EPUB` `书架` `导入` `上传` `阅读器` `翻页` `目录`
  - 划线笔记：`划线` `高亮` `笔记` `标注` `HuaXian` `BiJi`
  - 练习系统：`复述` `概念解释` `AI评价` `练习` `FuShu` `GaiNian`
  - 用户系统：`登录` `注册` `认证` `设置` `密码` `Auth` `User`
- 技术栈：`React` `TypeScript` `Tailwind` `CSS` `Hook` `useState` `useEffect`
- 状态管理：`Context` `Store` `Zustand` `localStorage`

#### → 后端开发 (skills/后端开发/SKILL.md)

**触发条件（满足任一即加载）：**
- Go代码：`Go` `gin` `controller` `service` `model` `middleware`
- API接口：`API` `接口` `路由` `routes` `handler` `endpoint`
- 数据库：`MySQL` `SQL` `数据库` `查询` `migration` `表结构`
- AI服务：`智谱` `zhipu` `AI` `evaluate` `selection` `concepts`
- 认证授权：`JWT` `auth` `token` `login` `password`
- 文件处理：`EPUB上传` `文件存储` `uploads`

#### → 部署运维 (skills/部署运维/SKILL.md)

**触发条件（满足任一即加载）：**
- 容器化：`Docker` `docker-compose` `容器` `镜像`
- 服务器：`Nginx` `部署` `服务器` `域名` `SSL` `反向代理`
- 连接配置：`SSH` `隧道` `端口映射` `.env` `环境变量`
- 数据库运维：`数据库初始化` `迁移` `备份` `远程连接`

#### → 测试调试 (skills/测试调试/SKILL.md)

**触发条件（满足任一即加载）：**
- 单元测试：`Vitest` `测试用例` `it(` `describe(` `expect(`
- E2E测试：`Playwright` `E2E` `浏览器测试` `page.click`
- Bug修复：`报错` `错误` `bug` `异常` `控制台` `console.error`
- 常见问题：
  - 运行时错误：`Cannot access` `before initialization` `useCallback` `依赖数组`
  - 网络错误：`Failed to fetch` `网络请求失败` `API错误` `401` `403` `500`
  - 渲染问题：`白屏` `不显示` `空白` `卡顿` `无响应`

---

## 模糊需求的处理策略

当用户需求不够明确时：

1. **先询问再路由**：向用户确认具体涉及哪个模块
2. **多领域同时加载**：如果需求跨多个领域，同时加载多个 L2 技能
3. **默认前端优先**：无法判断时，默认加载"前端开发"技能（本项目以前端为主）

---

## 示例对话

### 示例1：明确的前端需求
```
用户: 帮我优化EPUB阅读器的翻页功能
→ 识别: 前端开发 + 书籍管理模块
→ 加载: skills/前端开发/SKILL.md
→ 下钻: skills/前端开发/modules/书籍管理.md
→ 定位: src/features/books/hooks/useEPUBReaderFanYeHeYeMa.ts
```

### 示例2：跨领域需求
```
用户: EPUB上传后保存到数据库
→ 识别: 前端(上传UI) + 后端(API+数据库)
→ 同时加载:
  - skills/前端开发/SKILL.md (导入弹窗部分)
  - skills/后端开发/SKILL.md (控制器+模型部分)
```

### 示例3：Bug修复
```
用户: 划线数据同步有问题
→ 识别: 测试调试 + 前端开发
→ 加载: skills/测试调试/SKILL.md
→ 匹配常见问题: 划线数据同步
→ 定位: archived_复盘存档/划线数据同步问题_2026-04-08.md
```

---

## 注意事项

⚠️ **必须严格遵守的规则：**
1. 收到需求后的**第一个动作**就是识别领域并加载对应技能
2. 不要跳过 L2 直接进入编码，这会导致上下文缺失
3. 如果在 L2/L3 层级找不到解决方案，再使用通用编程能力
4. 每次完成任务后，将新经验补充到对应的 L4 文件中（持续迭代）
