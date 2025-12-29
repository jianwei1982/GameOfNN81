#!/usr/bin/env node

/**
 * 部署前检查脚本
 * 验证所有必要的文件和配置是否正确
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始部署前检查...\n');

// 检查必要文件
const requiredFiles = [
  'index.html',
  'styles.css',
  'js/main.js',
  'js/GameController.js',
  'js/QuestionGenerator.js',
  'js/ScoreManager.js',
  'js/UIRenderer.js',
  'netlify.toml',
  '_redirects',
  '_headers'
];

let allFilesExist = true;

console.log('📁 检查必要文件:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

// 检查HTML文件中的路径
console.log('\n🔗 检查HTML文件路径:');
try {
  const htmlContent = fs.readFileSync('index.html', 'utf8');
  
  // 检查CSS路径
  if (htmlContent.includes('href="styles.css"')) {
    console.log('  ✅ CSS路径正确');
  } else {
    console.log('  ❌ CSS路径可能有问题');
    allFilesExist = false;
  }
  
  // 检查JavaScript路径
  const jsFiles = [
    'js/QuestionGenerator.js',
    'js/ScoreManager.js', 
    'js/UIRenderer.js',
    'js/GameController.js',
    'js/main.js'
  ];
  
  jsFiles.forEach(jsFile => {
    if (htmlContent.includes(`src="${jsFile}"`)) {
      console.log(`  ✅ ${jsFile} 路径正确`);
    } else {
      console.log(`  ❌ ${jsFile} 路径可能有问题`);
      allFilesExist = false;
    }
  });
  
} catch (error) {
  console.log('  ❌ 无法读取index.html文件');
  allFilesExist = false;
}

// 检查Netlify配置
console.log('\n⚙️  检查Netlify配置:');
try {
  const netlifyConfig = fs.readFileSync('netlify.toml', 'utf8');
  
  if (netlifyConfig.includes('publish = "."')) {
    console.log('  ✅ 发布目录配置正确');
  } else {
    console.log('  ⚠️  发布目录配置可能需要调整');
  }
  
  if (netlifyConfig.includes('[[redirects]]')) {
    console.log('  ✅ 重定向规则已配置');
  } else {
    console.log('  ⚠️  未找到重定向规则');
  }
  
} catch (error) {
  console.log('  ❌ 无法读取netlify.toml文件');
  allFilesExist = false;
}

// 检查文件大小（优化建议）
console.log('\n📊 文件大小检查:');
try {
  const cssSize = fs.statSync('styles.css').size;
  const htmlSize = fs.statSync('index.html').size;
  
  console.log(`  📄 index.html: ${(htmlSize / 1024).toFixed(2)} KB`);
  console.log(`  🎨 styles.css: ${(cssSize / 1024).toFixed(2)} KB`);
  
  let totalJsSize = 0;
  const jsFiles = ['js/main.js', 'js/GameController.js', 'js/QuestionGenerator.js', 'js/ScoreManager.js', 'js/UIRenderer.js'];
  
  jsFiles.forEach(file => {
    if (fs.existsSync(file)) {
      const size = fs.statSync(file).size;
      totalJsSize += size;
      console.log(`  📜 ${file}: ${(size / 1024).toFixed(2)} KB`);
    }
  });
  
  console.log(`  📦 总JavaScript大小: ${(totalJsSize / 1024).toFixed(2)} KB`);
  
  if (totalJsSize > 100 * 1024) {
    console.log('  ⚠️  JavaScript文件较大，考虑压缩优化');
  }
  
} catch (error) {
  console.log('  ⚠️  无法获取文件大小信息');
}

// 最终结果
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 部署检查通过！项目已准备好部署到Netlify');
  console.log('\n📋 部署步骤:');
  console.log('1. 将代码推送到GitHub仓库');
  console.log('2. 在Netlify中连接GitHub仓库');
  console.log('3. 设置构建命令为: npm run build');
  console.log('4. 设置发布目录为: .');
  console.log('5. 点击部署');
  process.exit(0);
} else {
  console.log('❌ 部署检查失败！请修复上述问题后重试');
  process.exit(1);
}