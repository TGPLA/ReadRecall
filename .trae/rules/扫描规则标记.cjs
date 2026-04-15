/**
 * 扫描代码中的规则触发标记
 * 用法: node 扫描规则标记.cjs [文件路径或目录]
 */

const fs = require('fs');
const path = require('path');

const MARKER_PATTERN = /\/\/\s*@规则触发:\s*([^\[]+)(?:\[(.*?)\])?/g;
const STATS_PATH = path.join(__dirname, '规则触发统计.json');

// 初始化统计文件
function initStats() {
  if (!fs.existsSync(STATS_PATH)) {
    const initial = {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      rules: {}
    };
    fs.writeFileSync(STATS_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(STATS_PATH, 'utf8'));
}

// 扫描单个文件
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const matches = [];
  let match;
  
  while ((match = MARKER_PATTERN.exec(content)) !== null) {
    matches.push({
      ruleName: match[1].trim(),
      context: match[2] || '',
      file: filePath,
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  return matches;
}

// 递归扫描目录
function scanDirectory(dirPath, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const results = [];
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      results.push(...scanDirectory(fullPath, extensions));
    } else if (stat.isFile() && extensions.some(ext => file.endsWith(ext))) {
      const matches = scanFile(fullPath);
      results.push(...matches);
    }
  });
  
  return results;
}

// 更新统计数据
function updateStats(markers) {
  const stats = initStats();
  
  markers.forEach(marker => {
    if (!stats.rules[marker.ruleName]) {
      stats.rules[marker.ruleName] = { triggers: [], count: 0 };
    }
    
    // 检查是否已存在相同位置的记录（避免重复）
    const exists = stats.rules[marker.ruleName].triggers.some(t => 
      t.file === marker.file && t.line === marker.line
    );
    
    if (!exists) {
      stats.rules[marker.ruleName].triggers.push({
        timestamp: new Date().toISOString(),
        context: marker.context,
        file: marker.file,
        line: marker.line
      });
      stats.rules[marker.ruleName].count++;
    }
  });
  
  stats.lastUpdated = new Date().toISOString();
  fs.writeFileSync(STATS_PATH, JSON.stringify(stats, null, 2));
  
  return markers.length;
}

// 主函数
function main() {
  const targetPath = process.argv[2] || path.join(__dirname, '..', '..', 'src');
  
  console.log(`扫描目录: ${targetPath}\n`);
  
  let markers = [];
  
  if (fs.statSync(targetPath).isFile()) {
    markers = scanFile(targetPath);
  } else {
    markers = scanDirectory(targetPath);
  }
  
  if (markers.length === 0) {
    console.log('未找到规则触发标记');
    return;
  }
  
  console.log(`找到 ${markers.length} 个标记:\n`);
  markers.forEach((m, i) => {
    console.log(`${i + 1}. ${m.ruleName}`);
    console.log(`   文件: ${m.file}:${m.line}`);
    if (m.context) console.log(`   描述: ${m.context}`);
    console.log('');
  });
  
  const newCount = updateStats(markers);
  console.log(`✅ 已更新统计，新增 ${newCount} 条记录`);
  console.log(`📊 查看报告: node 规则触发统计.cjs report`);
}

main();
