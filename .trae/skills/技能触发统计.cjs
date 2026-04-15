/**
 * 技能触发统计系统
 * 用于统计各技能的触发次数和触发场景
 */

const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '技能触发统计.json');

// 从目录动态获取所有技能
function getAllSkills() {
  const skillDirs = fs.readdirSync(__dirname, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory() && fs.existsSync(path.join(__dirname, dirent.name, 'SKILL.md')))
    .map(dirent => dirent.name);
  
  const skills = {};
  skillDirs.forEach(skillName => {
    skills[skillName] = { triggers: [], count: 0 };
  });
  
  return skills;
}

// 初始化数据库
function initDB() {
  const allSkills = getAllSkills();
  
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      skills: allSkills
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }
  
  // 如果已有数据，合并新技能
  const existingData = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  let hasNewSkills = false;
  
  Object.keys(allSkills).forEach(skillName => {
    if (!existingData.skills[skillName]) {
      existingData.skills[skillName] = { triggers: [], count: 0 };
      hasNewSkills = true;
    }
  });
  
  if (hasNewSkills) {
    existingData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_PATH, JSON.stringify(existingData, null, 2), 'utf8');
  }
  
  return existingData;
}

// 记录技能触发
function recordTrigger(skillName, context = '') {
  const db = initDB();
  
  if (!db.skills[skillName]) {
    db.skills[skillName] = { triggers: [], count: 0 };
  }
  
  db.skills[skillName].triggers.push({
    timestamp: new Date().toISOString(),
    context: context
  });
  db.skills[skillName].count++;
  db.lastUpdated = new Date().toISOString();
  
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
  console.log(`✅ 已记录技能触发: ${skillName}`);
}

// 获取统计报告
function getReport() {
  const db = initDB();
  const skillCount = Object.keys(db.skills).length;
  
  console.log(`\n========== 技能触发统计报告 (${skillCount} 个技能) ==========\n`);
  
  const sortedSkills = Object.entries(db.skills)
    .sort((a, b) => b[1].count - a[1].count);
  
  sortedSkills.forEach(([name, data], index) => {
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
  console.log('\n========================================\n');
}

// 导出数据为 CSV
function exportCSV() {
  const db = initDB();
  let csv = '技能名称,触发次数,最近触发时间\n';
  
  Object.entries(db.skills).forEach(([name, data]) => {
    const lastTime = data.triggers.length > 0 
      ? data.triggers[data.triggers.length - 1].timestamp 
      : '从未触发';
    csv += `${name},${data.count},${lastTime}\n`;
  });
  
  const csvPath = path.join(__dirname, '技能触发统计.csv');
  fs.writeFileSync(csvPath, csv, 'utf8');
  console.log(`✅ CSV 已导出: ${csvPath}`);
}

// 列出所有可用技能
function listSkills() {
  const db = initDB();
  console.log('\n========== 可用技能列表 ==========\n');
  
  Object.keys(db.skills).forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
  });
  
  console.log(`\n共 ${Object.keys(db.skills).length} 个技能`);
  console.log('\n===================================\n');
}

// 命令行接口
const command = process.argv[2];
const skillName = process.argv[3];
const context = process.argv[4] || '';

switch (command) {
  case 'record':
    if (!skillName) {
      console.error('❌ 请提供技能名称: node 技能触发统计.cjs record "技能名称" "上下文描述"');
      process.exit(1);
    }
    recordTrigger(skillName, context);
    break;
  case 'report':
    getReport();
    break;
  case 'export':
    exportCSV();
    break;
  case 'list':
    listSkills();
    break;
  default:
    console.log(`
用法:
  node 技能触发统计.cjs record "技能名称" "上下文描述"  - 记录技能触发
  node 技能触发统计.cjs report                           - 查看统计报告
  node 技能触发统计.cjs export                           - 导出 CSV 文件
  node 技能触发统计.cjs list                             - 列出所有技能

示例:
  node 技能触发统计.cjs record "头脑风暴" "探索登录功能需求"
  node 技能触发统计.cjs record "任务拆解" "拆解复杂任务"
    `);
}
