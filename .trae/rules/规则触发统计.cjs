/**
 * 规则触发统计系统
 * 用于统计各规则的触发次数和触发场景
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '规则触发统计.json');

// 从目录动态获取所有规则文件
function getAllRules() {
  const files = fs.readdirSync(__dirname);
  const rules = {};
  
  files.forEach(file => {
    // 匹配规则文件：以.md结尾，且不是说明文档
    if (file.endsWith('.md') && 
        !file.startsWith('项目规则') && 
        !file.startsWith('规则触发') &&
        !file.startsWith('vscode')) {
      const ruleName = file.replace('.md', '');
      rules[ruleName] = { triggers: [], count: 0 };
    }
  });
  
  return rules;
}

// 初始化数据库
function initDB() {
  const allRules = getAllRules();
  
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      rules: allRules
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }
  
  // 如果已有数据，合并新规则
  const existingData = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  let hasNewRules = false;
  
  Object.keys(allRules).forEach(ruleName => {
    if (!existingData.rules[ruleName]) {
      existingData.rules[ruleName] = { triggers: [], count: 0 };
      hasNewRules = true;
    }
  });
  
  if (hasNewRules) {
    existingData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(existingData, null, 2), 'utf8');
  }
  
  return existingData;
}

// 记录规则触发
function recordTrigger(ruleName, context = '') {
  const db = initDB();
  
  if (!db.rules[ruleName]) {
    db.rules[ruleName] = { triggers: [], count: 0 };
  }
  
  db.rules[ruleName].triggers.push({
    timestamp: new Date().toISOString(),
    context: context
  });
  db.rules[ruleName].count++;
  db.lastUpdated = new Date().toISOString();
  
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  console.log(`✅ 已记录: ${ruleName}`);
}

// 获取统计报告
function getReport() {
  const db = initDB();
  const ruleCount = Object.keys(db.rules).length;
  
  console.log(`\n========== 规则触发统计报告 (${ruleCount} 个规则) ==========\n`);
  
  const sortedRules = Object.entries(db.rules)
    .sort((a, b) => b[1].count - a[1].count);
  
  sortedRules.forEach(([name, data], index) => {
    const bar = '█'.repeat(Math.min(data.count, 20));
    console.log(`${index + 1}. ${name}`);
    console.log(`   触发次数: ${data.count} ${bar}`);
    if (data.triggers.length > 0) {
      const lastTrigger = data.triggers[data.triggers.length - 1];
      console.log(`   最近触发: ${lastTrigger.timestamp}`);
    }
    console.log('');
  });
  
  console.log(`最后更新: ${db.lastUpdated}`);
  console.log('\n=======================================\n');
}

// 导出数据为 CSV
function exportCSV() {
  const db = initDB();
  let csv = '规则名称,触发次数,最近触发时间\n';
  
  Object.entries(db.rules).forEach(([name, data]) => {
    const lastTime = data.triggers.length > 0 
      ? data.triggers[data.triggers.length - 1].timestamp 
      : '从未触发';
    csv += `${name},${data.count},${lastTime}\n`;
  });
  
  const csvPath = path.join(__dirname, '规则触发统计.csv');
  fs.writeFileSync(csvPath, csv, 'utf8');
  console.log(`✅ CSV 已导出: ${csvPath}`);
}

// 列出所有可用规则
function listRules() {
  const db = initDB();
  console.log('\n========== 可用规则列表 ==========\n');
  
  Object.keys(db.rules).forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
  });
  
  console.log(`\n共 ${Object.keys(db.rules).length} 个规则`);
  console.log('\n===================================\n');
}

// 命令行接口
const command = process.argv[2];
const ruleName = process.argv[3];
const context = process.argv[4] || '';

switch (command) {
  case 'record':
    if (!ruleName) {
      console.error('❌ 请提供规则名称: node 规则触发统计.cjs record "规则名称" "上下文描述"');
      process.exit(1);
    }
    recordTrigger(ruleName, context);
    break;
  case 'report':
    getReport();
    break;
  case 'export':
    exportCSV();
    break;
  case 'list':
    listRules();
    break;
  default:
    console.log(`
用法:
  node 规则触发统计.cjs record "规则名称" "上下文描述"  - 记录规则触发
  node 规则触发统计.cjs report                           - 查看统计报告
  node 规则触发统计.cjs export                           - 导出 CSV 文件
  node 规则触发统计.cjs list                             - 列出所有规则

示例:
  node 规则触发统计.cjs record "文件操作规范" "创建新组件时检查行数"
  node 规则触发统计.cjs record "任务与功能验证规范" "完成登录功能后验证"
    `);
}
