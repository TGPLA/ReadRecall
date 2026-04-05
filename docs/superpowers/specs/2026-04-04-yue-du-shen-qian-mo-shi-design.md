# 阅读器浅色/深色模式切换 - 设计文档

## 1. 目标

为阅读器页面实现「浅色」和「深色」两种模式的完整切换，使用 CSS 变量管理配色，通过右侧工具栏的太阳/月亮图标触发切换，带 0.3s 过渡动画。

## 2. 配色方案

### 浅色模式 (light)

| 变量名 | 色值 | 用途 |
|--------|------|------|
| --ye-du-bei-jing | #F4F4F4 | 网页/阅读器外层背景 |
| --zhi-zhen-bei-jing | #FFFFFF | 阅读纸张容器 |
| --zheng-wen-yan-se | #1A1A2E | 正文文字 |
| --biao-ti-yan-se | #A04030 | 标题文字（棕红色） |
| --ci-yao-wen-zi | #6B7280 | 次要文字 |
| --gong-ju-lan-bei-jing | rgba(0,0,0,0.06) | 工具栏按钮背景 |
| --bian-kuang-yan-se | #E5E7EB | 边框/分割线 |

### 深色模式 (dark)

| 变量名 | 色值 | 用途 |
|--------|------|------|
| --ye-du-bei-jing | #1A1A1A | 网页/阅读器外层背景 |
| --zhi-zhen-bei-jing | #252525 | 阅读纸张容器（浮在背景上的深色纸） |
| --zheng-wen-yan-se | #C8C8D0 | 正文文字（柔灰，不刺眼） |
| --biao-ti-yan-se | #E07080 | 标题文字（带粉红感的红） |
| --ci-yao-wen-zi | #8B8B96 | 次要文字 |
| --gong-ju-lan-bei-jing | rgba(255,255,255,0.08) | 工具栏按钮背景 |
| --bian-kuang-yan-se | #333340 | 边框/分割线 |

## 3. 架构设计

### 3.1 CSS 变量层（新建 `YueDuSeCai.css`）

在 `:root` 定义浅色变量，在 `[data-theme="dark"]` 覆盖为深色值。

### 3.2 主题 Hook 层（修改 `useZhuTi.ts`）

扩展现有 `ZHU_TI_PEIZHI`，增加：
- 标题颜色 (`titleColor`)
- 次要文字颜色 (`secondaryColor`)
- 页面背景颜色 (`pageBackground`)
- 纸张背景颜色 (`paperBackground`)
- 移除 eye 护眼模式（用户确认不需要）

简化为 `light` / `dark` 两种模式切换。

### 3.3 UI 组件层（6 个文件变更）

| 文件 | 变更内容 |
|------|---------|
| `YueDuSeCai.css` (新建) | CSS 变量定义 |
| `useZhuTi.ts` (修改) | 扩展配色方案 + 简化为 light/dark |
| `YouCeGongJuTiao.tsx` (修改) | 主题按钮改为太阳/月亮图标切换 |
| `EPUBReader.tsx` (修改) | 外层容器改用 CSS 变量 |
| `EPUBYueDuQuYu.tsx` (修改) | 纸张容器改用 CSS 变量 |
| `YueDuQiDingBuDaoHang.tsx` (修改) | 导航栏改用 CSS 变量 |

### 3.4 切换流程

```
用户点击工具栏「太阳/月亮」图标
    → useZhuTi.setZhuTi('light'|'dark')
    → localStorage 持久化
    → EPUBReader 容器设置 data-theme 属性
    → CSS 变量自动切换
    → 所有子组件通过 var() 引用同步更新
    → 全局 * 选择器已配置 0.3s transition
```

## 4. 关键技术决策

1. **CSS 变量 vs inline style**：选择 CSS 变量，因为可以一次性定义、全局生效、过渡动画自动支持
2. **data-theme 类选择器**：在 EPUBReader 最外层 div 上设置 `data-theme="light|dark"`，CSS 变量作用域限定在阅读器内，不影响全局其他页面
3. **复用现有 useZhuTi**：扩展而非重写，保持与现有 EPUB rendition.themes.override 的兼容性
4. **移除 eye 模式**：用户确认只需 light/dark 两种

## 5. 文件行数约束

每个文件控制在 100 行以内。如超长则拆分。
