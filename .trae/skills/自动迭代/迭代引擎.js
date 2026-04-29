/**
 * 自动迭代引擎 - 阅读回响技能体系
 *
 * 功能：
 * 1. 扫描代码增量，检测新文件/修改文件
 * 2. 识别文件类型，更新模块导航表
 * 3. 提取Bug解决方案，补充速查表
 * 4. 校验技能文档一致性
 *
 * 使用方式：
 *   node 迭代引擎.js [上次扫描时间ISO字符串]
 *
 * 示例：
 *   node 迭代引擎.js                                    # 扫描最近7天
 *   node 迭代引擎.js 2026-04-01T00:00:00Z              # 指定时间后
 */

const fs = require('fs')
const path = require('path')

// ==================== 配置区 ====================

const 项目根目录 = path.join(__dirname, '../../..')
const 技能目录 = path.join(项目根目录, '.trae/skills')
const 复盘存档目录 = path.join(项目根目录, 'archived_复盘存档')

// 扫描范围配置
const 扫描配置 = {
  前端: {
    根目录: path.join(项目根目录, 'src'),
    文件模式: [
      { 目录: 'features/books/components', 类型: '组件', 后缀: '.tsx' },
      { 目录: 'features/books/hooks', 类型: 'Hook', 后缀: '.ts' },
      { 目录: 'features/practice', 类型: '练习组件', 后缀: '.tsx' },
      { 目录: 'features/user/components', 类型: '用户组件', 后缀: '.tsx' },
      { 目录: 'shared/services', 类型: '服务', 后缀: '.ts' },
      { 目录: 'shared/utils', 类型: '工具', 后缀: '.ts' },
      { 目录: 'infrastructure/hooks', 类型: '基础设施', 后缀: '.tsx' },
    ]
  },
  后端: {
    根目录: path.join(项目根目录, 'backend'),
    文件模式: [
      { 目录: 'controllers', 类型: '控制器', 后缀: '.go' },
      { 目录: 'services', 类型: '服务', 后缀: '.go' },
      { 目录: 'models', 类型: '模型', 后缀: '.go' },
      { 目录: 'middleware', 类型: '中间件', 后缀: '.go' },
    ]
  }
}

// ==================== 核心功能 ====================

/**
 * 扫描目录获取所有匹配文件
 * @param {string} 根目录 - 根目录路径
 * @param {Array} 文件模式 - 文件匹配模式数组
 * @returns {Array} 排序后的文件列表
 */
function 扫描目录(根目录, 文件模式) {
  const 结果 = []

  for (const 模式 of 文件模式) {
    const 完整路径 = path.join(根目录, 模式.目录)
    if (!fs.existsSync(完整路径)) continue

    try {
      const 文件列表 = fs.readdirSync(完整路径, { withFileTypes: true })
      for (const 文件 of 文件列表) {
        if (文件.isFile() && 文件.name.endsWith(模式.后缀) && !文件.name.endsWith('.test.ts')) {
          const 文件路径 = path.join(完整路径, 文件.name)
          try {
            const 统计 = fs.statSync(文件路径)
            结果.push({
              名称: path.basename(文件.name, 模式.后缀),
              完整路径: 文件路径,
              类型: 模式.类型,
              修改时间: 统计.mtime,
              大小: 统计.size
            })
          } catch (e) {
            console.warn(`⚠️ 无法读取文件 ${文件路径}:`, e.message)
          }
        }
      }
    } catch (e) {
      console.warn(`⚠️ 无法扫描目录 ${完整路径}:`, e.message)
    }
  }

  return 结果.sort((a, b) => b.修改时间 - a.修改时间)
}

/**
 * 检测代码增量
 * @param {Date} 上次扫描时间戳 - 上次扫描的时间
 * @returns {Object} 增量结果
 */
function 检测增量(上次扫描时间戳) {
  const 增量 = {
    新文件: [],
    修改文件: [],
    按领域: {
      前端: [],
      后端: []
    }
  }

  for (const [领域, 配置] of Object.entries(扫描配置)) {
    const 文件列表 = 扫描目录(配置.根目录, 配置.文件模式)
    for (const 文件 of 文件列表) {
      if (文件.修改时间 > 上次扫描时间戳) {
        增量.修改文件.push(文件)
        增量.按领域[领域].push(文件)
      }
    }
  }

  return 增量
}

/**
 * 从复盘存档提取解决方案
 * @param {number} 限制 - 返回数量限制
 * @returns {Array} 解决方案列表
 */
function 提取解决方案(限制 = 5) {
  if (!fs.existsSync(复盘存档目录)) {
    console.log('📂 复盘存档目录不存在，跳过解决方案提取')
    return []
  }

  try {
    const 存档文件 = fs.readdirSync(复盘存档目录)
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        名称: f,
        路径: path.join(复盘存档目录, f),
        时间: fs.statSync(path.join(复盘存档目录, f)).mtime
      }))
      .sort((a, b) => b.时间 - a.时间)
      .slice(0, 限制)

    return 存档文件.map(存档 => {
      try {
        const 内容 = fs.readFileSync(存档.路径, 'utf-8')
        return {
          来源: 存档.名称.replace('.md', ''),
          路径: 存档.路径,
          问题: 提取问题描述(内容),
          解决方案: 提取解决方案内容(内容),
          关键词: 提取关键词(内容)
        }
      } catch (e) {
        return {
          来源: 存档.名称.replace('.md', ''),
          路径: 存档.路径,
          问题: '读取失败',
          解决方案: '读取失败',
          关键词: []
        }
      }
    })
  } catch (e) {
    console.warn('⚠️ 无法读取复盘存档目录:', e.message)
    return []
  }
}

/**
 * 提取问题描述
 */
function 提取问题描述(内容) {
  const 匹配器 = [
    /#\s*(.+问题|Bug|故障)[^\n]*\n([^\n]+)/,
    /##\s*(问题|症状)[^\n]*\n([^\n]+)/,
    /^#\s*(.+)$/m
  ]

  for (const 匹配 of 匹配器) {
    const 结果 = 内容.match(匹配)
    if (结果) return 结果[结果.length - 1].trim().slice(0, 100)
  }
  return '未分类问题'
}

/**
 * 提取解决方案内容
 */
function 提取解决方案内容(内容) {
  const 匹配器 = [
    /##\s*(解决方案|修复|修复方案)[^\n]*\n([\s\S]+?)(?=##|# {1,3}[A-Z]|$)/,
    /```\n([\s\S]+?)```/,
  ]

  for (const 匹配 of 匹配器) {
    const 结果 = 内容.match(匹配)
    if (结果) return 结果[结果.length - 1].trim().slice(0, 300)
  }
  return '待提取'
}

/**
 * 提取内容关键词
 */
function 提取关键词(内容) {
  const 关键模式 = [
    { 模式: /划线|高亮|Hook/i, 标签: '划线笔记' },
    { 模式: /翻页|page|epub|阅读器/i, 标签: 'EPUB' },
    { 模式: /上传|upload|导入/i, 标签: '上传' },
    { 模式: /登录|认证|auth/i, 标签: '认证' },
    { 模式: /数据库|sql|mysql/i, 标签: '数据库' },
    { 模式: /部署|docker|nginx/i, 标签: '部署' },
    { 模式: /测试|test|vitest|playwright/i, 标签: '测试' },
    { 模式: /样式|css|tailwind/i, 标签: '样式' },
    { 模式: /状态|state|context/i, 标签: '状态管理' },
    { 模式: /AI|智谱|zhipu/i, 标签: 'AI服务' },
  ]

  return 关键模式
    .filter(({ 模式 }) => 模式.test(内容))
    .map(({ 标签 }) => 标签)
}

/**
 * 生成模块导航Markdown表格
 */
function 生成导航Markdown(标题, 文件列表, 根路径标记) {
  if (!文件列表 || 文件列表.length === 0) return ''

  const 唯一路径 = [...new Set(文件列表.map(f => f.完整路径.replace(/[/\\][^/\\]+$/, '')))]
  const 相对路径 = 唯一路径[0]?.replace(项目根目录, '') || 根路径标记

  let md = `\n#### ${标题}\n\n`
  md += `**路径**: \`${相对路径}\`\n\n`
  md += `| 名称 | 类型 | 说明 |\n`
  md += `|------|------|------|\n`

  for (const 文件 of 文件列表) {
    const 说明 = 生成文件说明(文件.名称)
    md += `| \`${文件.名称}\` | ${文件.类型} | ${说明} |\n`
  }

  return md
}

/**
 * 根据文件名生成说明
 */
function 生成文件说明(文件名) {
  return 文件名
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/[_-]/g, ' ')
    .replace(/\s+/, ' ')
    .trim()
    .slice(0, 30)
}

/**
 * 主迭代函数
 * @param {Object} 选项 - 迭代选项
 * @returns {Promise<Object>} 迭代结果
 */
async function 执行迭代(选项 = {}) {
  console.log('🔄 开始技能迭代...')
  console.log('=' .repeat(50))

  const 结果 = {
    时间: new Date().toISOString(),
    增量: { 新文件: [], 修改文件: [], 按领域: { 前端: [], 后端: [] } },
    解决方案: [],
    建议: []
  }

  // 1. 扫描增量
  const 扫描起始时间 = 选项.上次扫描时间 || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  console.log(`\n📂 扫描时间范围: ${扫描起始时间.toISOString()} 之后`)
  console.log('')

  const 增量 = 检测增量(扫描起始时间)
  结果.增量 = 增量

  console.log(`📊 代码变更统计:`)
  console.log(`   - 总修改文件: ${增量.修改文件.length}`)
  console.log(`   - 前端文件: ${增量.按领域.前端.length}`)
  console.log(`   - 后端文件: ${增量.按领域.后端.length}`)
  console.log('')

  if (增量.修改文件.length > 0) {
    console.log('📝 修改文件列表:')
    增量.修改文件.slice(0, 10).forEach((文件, i) => {
      const 相对路径 = 文件.完整路径.replace(项目根目录, '').replace(/\\/g, '/')
      console.log(`   ${i + 1}. [${文件.类型}] ${相对路径}`)
    })
    if (增量.修改文件.length > 10) {
      console.log(`   ... 还有 ${增量.修改文件.length - 10} 个文件`)
    }
    console.log('')
  }

  // 2. 提取解决方案
  if (选项.包含复盘) {
    console.log('📋 扫描复盘存档...')
    结果.解决方案 = 提取解决方案(选项.解决方案数量 || 5)

    if (结果.解决方案.length > 0) {
      console.log(`   发现 ${结果.解决方案.length} 个复盘文件:\n`)
      结果.解决方案.forEach((方案, i) => {
        console.log(`   ${i + 1}. ${方案.来源}`)
        console.log(`      问题: ${方案.问题.slice(0, 50)}...`)
        console.log(`      标签: ${方案.关键词.join(', ') || '无'}`)
        console.log('')
      })
    } else {
      console.log('   未发现新的复盘文件\n')
    }
  }

  // 3. 生成建议
  结果.建议 = 生成建议(结果)

  console.log('💡 迭代建议:')
  结果.建议.forEach((建议, i) => {
    console.log(`   ${i + 1}. ${建议}`)
  })
  console.log('')

  // 4. 输出摘要
  输出摘要(结果)

  return 结果
}

/**
 * 生成迭代建议
 */
function 生成建议(结果) {
  const 建议 = []

  if (结果.增量.修改文件.length > 0) {
    建议.push(`更新 skills/前端开发/SKILL.md 模块导航表 (${结果.增量.按领域.前端.length} 个前端文件)`)
  }

  if (结果.增量.按领域.后端.length > 0) {
    建议.push(`更新 skills/后端开发/SKILL.md 模块导航表 (${结果.增量.按领域.后端.length} 个后端文件)`)
  }

  if (结果.解决方案.length > 0) {
    建议.push(`补充 skills/测试调试/SKILL.md 速查表 (${结果.解决方案.length} 个解决方案)`)
  }

  if (建议.length === 0) {
    建议.push('当前无需更新技能文档')
  }

  return 建议
}

/**
 * 输出迭代摘要
 */
function 输出摘要(结果) {
  console.log('=' .repeat(50))
  console.log('📊 迭代摘要')
  console.log('=' .repeat(50))
  console.log(`执行时间: ${结果.时间}`)
  console.log(`修改文件: ${结果.增量.修改文件.length}`)
  console.log(`复盘方案: ${结果.解决方案.length}`)
  console.log(`建议操作: ${结果.建议.length}`)
  console.log('')
}

/**
 * 更新技能文档
 */
async function 更新技能文档(技能路径, 新内容, 选项 = {}) {
  if (!fs.existsSync(技能路径)) {
    console.warn(`⚠️ 技能文件不存在: ${技能路径}`)
    return false
  }

  try {
    const 现有内容 = fs.readFileSync(技能路径, 'utf-8')
    const 变更日志 = `\n\n---\n## ${new Date().toISOString().split('T')[0]} 自动更新\n${新内容}`

    // 检查是否已存在当天的更新
    if (现有内容.includes(new Date().toISOString().split('T')[0])) {
      console.log(`ℹ️ ${技能路径} 今日已更新，跳过`)
      return false
    }

    const 更新后内容 = 现有内容 + 变更日志
    fs.writeFileSync(技能路径, 更新后内容, 'utf-8')
    console.log(`✅ 已更新 ${path.basename(技能路径)}`)
    return true
  } catch (e) {
    console.error(`❌ 更新失败 ${技能路径}:`, e.message)
    return false
  }
}

/**
 * 更新模块导航表
 */
async function 更新模块导航表(增量结果) {
  console.log('\n🔧 更新模块导航表...')

  const 更新结果 = []

  // 更新前端技能
  if (增量结果.按领域.前端.length > 0) {
    const 前端技能路径 = path.join(技能目录, '前端开发/SKILL.md')
    const 新导航 = 生成导航Markdown('最近更新', 增量结果.按领域.前端, 'src/')

    const 成功 = await 更新技能文档(前端技能路径, 新导航)
    更新结果.push({ 技能: '前端开发', 成功 })
  }

  // 更新后端技能
  if (增量结果.按领域.后端.length > 0) {
    const 后端技能路径 = path.join(技能目录, '后端开发/SKILL.md')
    const 新导航 = 生成导航Markdown('最近更新', 增量结果.按领域.后端, 'backend/')

    const 成功 = await 更新技能文档(后端技能路径, 新导航)
    更新结果.push({ 技能: '后端开发', 成功 })
  }

  return 更新结果
}

// ==================== 导出 ====================

module.exports = {
  扫描目录,
  检测增量,
  提取解决方案,
  执行迭代,
  生成导航Markdown,
  更新技能文档,
  更新模块导航表,
  项目根目录,
  技能目录
}

// ==================== CLI 入口 ====================

if (require.main === module) {
  const 选项 = {
    上次扫描时间: process.argv[2] ? new Date(process.argv[2]) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    包含复盘: true,
    解决方案数量: 5
  }

  console.log(`\n🕐 扫描起始时间: ${选项.上次扫描时间.toISOString()}`)
  console.log('')

  执行迭代(选项)
    .then(async 结果 => {
      // 如果有修改文件，询问是否更新
      if (结果.增量.修改文件.length > 0 && process.argv.includes('--auto')) {
        console.log('\n🔧 执行自动更新...')
        await 更新模块导航表(结果.增量)
      }

      console.log('\n✅ 迭代完成')
      process.exit(0)
    })
    .catch(错误 => {
      console.error('\n❌ 迭代失败:', 错误)
      process.exit(1)
    })
}
