/**
 * 扫描代码中的技能触发标记
 * 自动识别代码中的 // @技能触发:技能名称[描述] 标记并更新统计
 */

const fs = require('fs');
const path = require('path');

// 技能触发标记正则表达式
const SKILL_TRIGGER_PATTERN = /\/\/\s*@技能触发:\s*([^\[]+)(?:\[(.*?)\])?/g;

// 扫描单个文件
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [];
  let match;
  
  while ((match = SKILL_TRIGGER_PATTERN.exec(content)) !== null) {
    matches.push({
      skillName: match[1].trim(),
      context: match[2] ? match[2].trim() : '',
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  return matches;
}

// 递归扫描目录
function scanDirectory(dirPath, results = []) {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    
    // 跳过 node_modules 和 .git 目录
    if (item.name === 'node_modules' || item.name === '.git' || item.name === 'archived_旧版归档') {
      continue;
    }
    
    if (item.isDirectory()) {
      scanDirectory(fullPath, results);
    } else if (item.isFile() && isCodeFile(item.name)) {
      const matches = scanFile(fullPath);
      if (matches.length > 0) {
        results.push({
          file: fullPath,
          matches: matches
        });
      }
    }
  }
  
  return results;
}

// 判断是否为代码文件
function isCodeFile(filename) {
  const codeExtensions = ['.js', '.ts', '.tsx', '.jsx', '.vue', '.py', '.java', '.go', '.rs', '.c', '.cpp', '.h', '.md'];
  return codeExtensions.some(ext => filename.endsWith(ext));
}

// 更新技能统计
function updateSkillStats(results) {
  const statsPath = path.join(__dirname, '技能触发统计.json');
  let stats;
  
  if (fs.existsSync(statsPath)) {
    stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
  } else {
    stats = { version: '1.0', lastUpdated: new Date().toISOString(), skills: {} };
  }
  
  let totalNewTriggers = 0;
  
  results.forEach(({ file, matches }) => {
    matches.forEach(match => {
      const { skillName, context } = match;
      
      if (!stats.skills[skillName]) {
        stats.skills[skillName] = { triggers: [], count: 0 };
      }
      
      // 检查是否已存在相同的触发记录（避免重复）
      const exists = stats.skills[skillName].triggers.some(t => 
        t.context === context && t.file === file
      );
      
      if (!exists) {
        stats.skills[skillName].triggers.push({
          timestamp: new Date().toISOString(),
          context: context,
          file: file
        });
        stats.skills[skillName].count++;
        totalNewTriggers++;
      }
    });
  });
  
  stats.lastUpdated = new Date().toISOString();
  fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf8');
  
  return totalNewTriggers;
}

// 主函数
function main() {
  const targetPath = process.argv[2] || path.join(__dirname, '..', '..');
  
  console.log(`\n🔍 正在扫描: ${targetPath}\n`);
  
  const results = scanDirectory(targetPath);
  
  if (results.length === 0) {
    console.log('未发现技能触发标记');
    return;
  }
  
  console.log(`发现 ${results.length} 个文件包含技能触发标记:\n`);
  
  results.forEach(({ file, matches }) => {
    console.log(`📄 ${file}`);
    matches.forEach(match => {
      console.log(`   行 ${match.line}: @技能触发:${match.skillName}${match.context ? `[${match.context}]` : ''}`);
    });
    console.log('');
  });
  
  const newTriggers = updateSkillStats(results);
  console.log(`✅ 已更新统计，新增 ${newTriggers} 条触发记录`);
  console.log(`📊 运行 "node 技能触发统计.cjs report" 查看完整报告\n`);
}

main();
