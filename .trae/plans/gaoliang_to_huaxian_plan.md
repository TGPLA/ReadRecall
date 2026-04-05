# 高亮 → 划线 重命名规划

## 概述
将项目中所有"高亮"(gaoliang)相关的命名统一改为"划线"(huaxian)，涉及 6 个文件。

---

## 需要修改的文件清单

### 1. useHuaXianChuTi.ts (核心 Hook，修改最多)
| 原命名 | 新命名 | 说明 |
|--------|--------|------|
| `GaoLiangYanSe` | `HuaXianYanSe` | 类型：划线颜色 |
| `GaoLiangXinXi` | `HuaXianXinXi` | 接口：划线信息 |
| `yanSe` | `yanSe` | 字段：颜色（保留） |
| `highlights` | `huaXianList` | 状态：划线列表 |
| `yingYongGaoLiang` | `yingYongHuaXian` | 函数：应用划线 |
| `handleHighlight` | `handleHuaXian` | 函数：处理划线 |
| `handleDeleteHighlight` | `handleDeleteHuaXian` | 函数：删除划线 |
| `handleDeleteHighlight` | `handleDeleteHuaXian` | 函数：删除划线 |
| `gaoliang_${userId}_${bookId}_${chapterId}` | `huaxian_${userId}_${bookId}_${chapterId}` | localStorage key |
| `handleHighlightClick` | `handleHuaXianClick` | 函数：点击划线 |
| console.log "高亮点击回调" | "划线点击回调" | 日志 |
| console.log "尝试应用高亮" | "尝试应用划线" | 日志 |
| console.log "高亮应用成功" | "划线应用成功" | 日志 |
| console.error "应用高亮失败" | "应用划线失败" | 日志 |
| showSuccess "已添加高亮标记" | "已添加划线" | 提示 |
| showSuccess "已删除高亮" | "已删除划线" | 提示 |
| showError "该文本已高亮" | "该文本已划线" | 提示 |
| `classMap` | `classMap` | 保持不变 |
| `styleMap` | `styleMap` | 保持不变 |

### 2. YouCeGongJuTiao.tsx (右侧工具栏)
| 原命名 | 新命名 | 说明 |
|--------|--------|------|
| `gaoliang` | `huaxian` | 按钮 key |
| `gaoliang: { ... title: '高亮' }` | `huaxian: { ... title: '划线' }` | 按钮配置 |
| `gaoLiangShuLiang` | `huaXianShuLiang` | props 名称 |

### 3. BiJiChouTi.tsx (笔记抽屉)
| 原命名 | 新命名 | 说明 |
|--------|--------|------|
| `GaoLiangXinXi` | `HuaXianXinXi` | import 类型 |
| `GaoLiangYanSe` | `HuaXianYanSe` | import 类型 |
| `highlights: GaoLiangXinXi[]` | `highlights: HuaXianXinXi[]` | props 类型 |
| `gaoLiang` | `huaXian` | 变量名 |
| `paiXuHouDeGaoLiang` | `paiXuHouDeHuaXian` | 变量名 |
| `handleDeleteHighlight` | `handleDeleteHuaXian` | props |

### 4. HuaXianCaiDan.tsx (划线菜单)
| 原命名 | 新命名 | 说明 |
|--------|--------|------|
| `GaoLiangYanSe` | `HuaXianYanSe` | import 类型 |
| `highlights` | `huaXianList` | state |
| `onHighlight` | `onHuaXian` | props 名称 |
| `handleHighlightClick` | `handleHuaXianClick` | 函数名 |
| `YAN_SE_XUAN_XIANG` | `YAN_SE_XUAN_XIANG` | 保持（颜色选择） |
| "保存高亮" 按钮 | "保存划线" 按钮 | UI |
| "高亮" 标签 | "划线" 标签 | UI |

### 5. useSouSuo.ts (搜索)
| 原命名 | 新命名 | 说明 |
|--------|--------|------|
| `qingChuGaoLiang` | `qingChuHuaXian` | 函数 |

### 6. MuLuChouTi.tsx (目录抽屉) - ⚠️ 不需要改
> 说明：此文件中的 `gaoLiangId` 表示"当前章节高亮"（目录中当前阅读到的章节），不是用户手动标记的划线，**保持不变**。

---

## 不需要修改的文件
- `MuLuChouTi.tsx` - 章节高亮状态（非划线功能）
- `EPUBReader.tsx` - 已使用 `highlights`，保持不变（语义：阅读高亮）

---

## 实施步骤
1. 修改 `useHuaXianChuTi.ts` - 最核心，先改这个
2. 修改 `YouCeGongJuTiao.tsx` - 工具栏按钮
3. 修改 `BiJiChouTi.tsx` - 笔记抽屉
4. 修改 `HuaXianCaiDan.tsx` - 划线菜单
5. 修改 `useSouSuo.ts` - 搜索
6. 全局搜索验证无遗漏

---

## 验证方式
- TypeScript 编译通过
- 功能测试：选中文字 → 点击划线 → 保存 → 笔记抽屉显示

---

## 修复记录

### 2025-04-05 修复内容

| 问题 | 位置 | 修复内容 |
|------|------|----------|
| **EPUBReader 报错** `Cannot read properties of undefined (reading 'length')` | [useEPUBReaderHuoChuLi.ts](file:///e:/阅读回响/src/features/books/hooks/useEPUBReaderHuoChuLi.ts#L104) | 在 return 对象中添加 `huaXianList: jiChu.huaXianList`，解决 `p.huaXianList.length` 读取 undefined 的问题 |
| **YouCeGongJuTiao 报错** `KE_PING_KUAN_DU is not defined` | [YouCeGongJuTiao.tsx](file:///e:/阅读回响/src/features/books/components/YouCeGongJuTiao.tsx#L8-L9) | 添加缺失的常量定义 `KE_PING_KUAN_DU = 1320` 和 `GU_DING_PIAN_YI = -64` |
| **工具栏位置错误** | [YouCeGongJuTiao.tsx](file:///e:/阅读回响/src/features/books/components/YouCeGongJuTiao.tsx#L9) | `GU_DING_PIAN_YI` 值从 20 改回 -64，恢复正确的定位逻辑 |

### 修复原因分析

重命名过程中遗漏了以下内容：
1. `useEPUBReaderHuoChuLi.ts` 返回对象中缺少 `huaXianList` 属性
2. `YouCeGongJuTiao.tsx` 中常量定义被删除后未恢复
3. `GU_DING_PIAN_YI` 常量值被误改