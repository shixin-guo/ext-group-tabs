#!/usr/bin/env node

/**
 * 验证所有语言包的JSON键是否一致
 * 检查_locales目录下所有语言的messages.json文件
 */

const fs = require('fs');
const path = require('path');

// 支持的语言列表
const supportedLocales = ['en', 'ru', 'zh', 'hi', 'es', 'fr', 'ar', 'bn', 'pt'];

// 颜色输出
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function loadMessagesFile(locale) {
  const filePath = path.join(__dirname, '_locales', locale, 'messages.json');
  
  if (!fs.existsSync(filePath)) {
    log(`❌ 语言包文件不存在: ${filePath}`, 'red');
    return null;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const messages = JSON.parse(content);
    return messages;
  } catch (error) {
    log(`❌ 解析JSON文件失败 ${filePath}: ${error.message}`, 'red');
    return null;
  }
}

function getAllKeys(obj, prefix = '') {
  const keys = [];
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // 递归处理嵌套对象
        keys.push(...getAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
  }
  
  return keys.sort();
}

function validateLocales() {
  log('🔍 开始验证语言包...', 'blue');
  log('', 'reset');
  
  const localeData = {};
  const allKeys = new Set();
  
  // 加载所有语言包
  for (const locale of supportedLocales) {
    const messages = loadMessagesFile(locale);
    if (messages) {
      localeData[locale] = messages;
      const keys = getAllKeys(messages);
      keys.forEach(key => allKeys.add(key));
      log(`✅ 加载语言包: ${locale} (${keys.length} 个键)`, 'green');
    }
  }
  
  log('', 'reset');
  log(`📊 总共发现 ${allKeys.size} 个唯一键`, 'blue');
  log('', 'reset');
  
  // 检查每个语言包是否包含所有键
  let hasErrors = false;
  const allKeysArray = Array.from(allKeys).sort();
  
  for (const locale of supportedLocales) {
    if (!localeData[locale]) continue;
    
    const localeKeys = getAllKeys(localeData[locale]);
    const missingKeys = allKeysArray.filter(key => !localeKeys.includes(key));
    const extraKeys = localeKeys.filter(key => !allKeysArray.includes(key));
    
    if (missingKeys.length === 0 && extraKeys.length === 0) {
      log(`✅ ${locale}: 所有键都匹配 (${localeKeys.length} 个键)`, 'green');
    } else {
      hasErrors = true;
      log(`❌ ${locale}: 键不匹配`, 'red');
      
      if (missingKeys.length > 0) {
        log(`   缺少的键 (${missingKeys.length}):`, 'yellow');
        missingKeys.forEach(key => log(`     - ${key}`, 'yellow'));
      }
      
      if (extraKeys.length > 0) {
        log(`   多余的键 (${extraKeys.length}):`, 'yellow');
        extraKeys.forEach(key => log(`     + ${key}`, 'yellow'));
      }
    }
  }
  
  log('', 'reset');
  
  // 显示所有键的列表
  if (process.argv.includes('--show-keys')) {
    log('📋 所有键的完整列表:', 'blue');
    allKeysArray.forEach((key, index) => {
      log(`   ${index + 1}. ${key}`, 'reset');
    });
    log('', 'reset');
  }
  
  // 检查特定键是否存在
  if (process.argv.includes('--check-key')) {
    const keyToCheck = process.argv[process.argv.indexOf('--check-key') + 1];
    if (keyToCheck) {
      log(`🔍 检查键 "${keyToCheck}" 在所有语言包中的存在情况:`, 'blue');
      for (const locale of supportedLocales) {
        if (!localeData[locale]) continue;
        const localeKeys = getAllKeys(localeData[locale]);
        const exists = localeKeys.includes(keyToCheck);
        log(`   ${locale}: ${exists ? '✅ 存在' : '❌ 不存在'}`, exists ? 'green' : 'red');
      }
    }
  }
  
  // 总结
  if (hasErrors) {
    log('❌ 验证失败: 发现键不匹配的问题', 'red');
    process.exit(1);
  } else {
    log('✅ 验证成功: 所有语言包的键都完全匹配!', 'green');
    process.exit(0);
  }
}

// 显示帮助信息
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  log('🌐 语言包验证工具', 'bold');
  log('', 'reset');
  log('用法: node validate-locales.js [选项]', 'reset');
  log('', 'reset');
  log('选项:', 'blue');
  log('  --show-keys     显示所有键的完整列表', 'reset');
  log('  --check-key KEY 检查特定键在所有语言包中的存在情况', 'reset');
  log('  --help, -h      显示此帮助信息', 'reset');
  log('', 'reset');
  log('示例:', 'blue');
  log('  node validate-locales.js', 'reset');
  log('  node validate-locales.js --show-keys', 'reset');
  log('  node validate-locales.js --check-key "options_title"', 'reset');
  process.exit(0);
}

// 运行验证
validateLocales();
