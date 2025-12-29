#!/usr/bin/env node

/**
 * 构建脚本 - 为静态网站准备部署
 * 虽然是静态网站，但我们仍然进行一些验证和优化
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建过程...\n');

// 1. 验证所有必要文件存在
console.log('1️⃣ 验证文件完整性...');
const requiredFiles = [
  'index.html',
  'styles.css',
  'js/main.js',
  'js/GameController.js',
  'js/QuestionGenerator.js',
  'js/ScoreManager.js',
  'js/UIRenderer.js'
];

let buildSuccess = true;

requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`❌ 缺少文件: ${file}`);
    buildSuccess = false;
  }
});

if (buildSuccess) {
  console.log('✅ 所有必要文件都存在');
}

// 2. 验证HTML语法（基本检查）
console.log('\n2️⃣ 验证HTML结构...');
try {
  const htmlContent = fs.readFileSync('index.html', 'utf8');
  
  // 检查基本HTML结构
  if (!htmlContent.includes('<!DOCTYPE html>')) {
    console.log('⚠️  缺少DOCTYPE声明');
  }
  
  if (!htmlContent.includes('<html')) {
    console.log('❌ 缺少html标签');
    buildSuccess = false;
  }
  
  if (!htmlContent.includes('<head>') || !htmlContent.includes('<body>')) {
    console.log('❌ 缺少head或body标签');
    buildSuccess = false;
  }
  
  // 检查必要的meta标签
  if (!htmlContent.includes('charset=')) {
    console.log('⚠️  建议添加charset meta标签');
  }
  
  if (!htmlContent.includes('viewport')) {
    console.log('⚠️  建议添加viewport meta标签以支持响应式设计');
  }
  
  console.log('✅ HTML结构验证通过');
  
} catch (error) {
  console.log('❌ 无法读取HTML文件');
  buildSuccess = false;
}

// 3. 验证JavaScript语法（基本检查）
console.log('\n3️⃣ 验证JavaScript文件...');
const jsFiles = [
  'js/QuestionGenerator.js',
  'js/ScoreManager.js',
  'js/UIRenderer.js',
  'js/GameController.js',
  'js/main.js'
];

jsFiles.forEach(file => {
  try {
    const jsContent = fs.readFileSync(file, 'utf8');
    
    // 基本语法检查
    if (jsContent.includes('class ') && !jsContent.includes('constructor')) {
      console.log(`⚠️  ${file}: 类定义可能缺少构造函数`);
    }
    
    // 检查是否有明显的语法错误
    const openBraces = (jsContent.match(/{/g) || []).length;
    const closeBraces = (jsContent.match(/}/g) || []).length;
    
    if (openBraces !== closeBraces) {
      console.log(`❌ ${file}: 大括号不匹配`);
      buildSuccess = false;
    }
    
  } catch (error) {
    console.log(`❌ 无法读取文件: ${file}`);
    buildSuccess = false;
  }
});

if (buildSuccess) {
  console.log('✅ JavaScript文件验证通过');
}

// 4. 检查资源引用
console.log('\n4️⃣ 验证资源引用...');
try {
  const htmlContent = fs.readFileSync('index.html', 'utf8');
  
  // 检查CSS引用
  const cssMatches = htmlContent.match(/href="([^"]+\.css)"/g);
  if (cssMatches) {
    cssMatches.forEach(match => {
      const cssFile = match.match(/href="([^"]+)"/)[1];
      if (!fs.existsSync(cssFile)) {
        console.log(`❌ CSS文件不存在: ${cssFile}`);
        buildSuccess = false;
      }
    });
  }
  
  // 检查JS引用
  const jsMatches = htmlContent.match(/src="([^"]+\.js)"/g);
  if (jsMatches) {
    jsMatches.forEach(match => {
      const jsFile = match.match(/src="([^"]+)"/)[1];
      if (!fs.existsSync(jsFile)) {
        console.log(`❌ JavaScript文件不存在: ${jsFile}`);
        buildSuccess = false;
      }
    });
  }
  
  console.log('✅ 资源引用验证通过');
  
} catch (error) {
  console.log('❌ 资源引用验证失败');
  buildSuccess = false;
}

// 5. 生成构建信息
console.log('\n5️⃣ 生成构建信息...');
const buildInfo = {
  buildTime: new Date().toISOString(),
  version: require('../package.json').version,
  files: {
    html: fs.existsSync('index.html'),
    css: fs.existsSync('styles.css'),
    js: jsFiles.reduce((acc, file) => {
      acc[file] = fs.existsSync(file);
      return acc;
    }, {})
  }
};

try {
  fs.writeFileSync('build-info.json', JSON.stringify(buildInfo, null, 2));
  console.log('✅ 构建信息已生成');
} catch (error) {
  console.log('⚠️  无法生成构建信息文件');
}

// 最终结果
console.log('\n' + '='.repeat(50));
if (buildSuccess) {
  console.log('🎉 构建成功！项目已准备好部署');
  console.log('\n📦 构建产物:');
  console.log('- index.html (主页面)');
  console.log('- styles.css (样式文件)');
  console.log('- js/ (JavaScript文件)');
  console.log('- netlify.toml (部署配置)');
  console.log('- _redirects (重定向规则)');
  console.log('- _headers (HTTP头部)');
  process.exit(0);
} else {
  console.log('❌ 构建失败！请修复上述问题后重试');
  process.exit(1);
}