#!/usr/bin/env node

/**
 * 部署后检查脚本
 * 验证部署的网站是否正常工作
 */

const https = require('https');
const http = require('http');

// 从命令行参数获取URL，或使用默认的本地地址
const url = process.argv[2] || 'http://localhost:8000';

console.log(`🔍 检查部署状态: ${url}\n`);

function checkUrl(targetUrl) {
  return new Promise((resolve, reject) => {
    const client = targetUrl.startsWith('https') ? https : http;
    
    const req = client.get(targetUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
  });
}

async function runChecks() {
  try {
    console.log('1️⃣ 检查主页访问...');
    const response = await checkUrl(url);
    
    if (response.statusCode === 200) {
      console.log('✅ 主页可以正常访问');
    } else {
      console.log(`❌ 主页返回状态码: ${response.statusCode}`);
      return false;
    }
    
    console.log('\n2️⃣ 检查页面内容...');
    const body = response.body;
    
    // 检查关键内容
    const checks = [
      { name: 'HTML文档类型', test: () => body.includes('<!DOCTYPE html>') },
      { name: '页面标题', test: () => body.includes('99乘法表游戏') },
      { name: 'CSS样式表', test: () => body.includes('styles.css') },
      { name: 'JavaScript文件', test: () => body.includes('js/main.js') },
      { name: '游戏界面元素', test: () => body.includes('id="app"') },
      { name: '开始界面', test: () => body.includes('id="start-screen"') },
      { name: '题目数量选项', test: () => body.includes('data-count=') }
    ];
    
    let allPassed = true;
    checks.forEach(check => {
      if (check.test()) {
        console.log(`  ✅ ${check.name}`);
      } else {
        console.log(`  ❌ ${check.name}`);
        allPassed = false;
      }
    });
    
    console.log('\n3️⃣ 检查HTTP头部...');
    const headers = response.headers;
    
    if (headers['content-type'] && headers['content-type'].includes('text/html')) {
      console.log('  ✅ 正确的Content-Type');
    } else {
      console.log('  ⚠️  Content-Type可能不正确');
    }
    
    if (headers['cache-control']) {
      console.log('  ✅ 缓存控制头部已设置');
    } else {
      console.log('  ⚠️  未检测到缓存控制头部');
    }
    
    console.log('\n4️⃣ 检查资源文件...');
    
    // 检查CSS文件
    try {
      const cssUrl = url.endsWith('/') ? url + 'styles.css' : url + '/styles.css';
      const cssResponse = await checkUrl(cssUrl);
      
      if (cssResponse.statusCode === 200) {
        console.log('  ✅ CSS文件可访问');
      } else {
        console.log(`  ❌ CSS文件访问失败 (${cssResponse.statusCode})`);
        allPassed = false;
      }
    } catch (error) {
      console.log('  ❌ CSS文件检查失败');
      allPassed = false;
    }
    
    // 检查主要JS文件
    try {
      const jsUrl = url.endsWith('/') ? url + 'js/main.js' : url + '/js/main.js';
      const jsResponse = await checkUrl(jsUrl);
      
      if (jsResponse.statusCode === 200) {
        console.log('  ✅ JavaScript文件可访问');
      } else {
        console.log(`  ❌ JavaScript文件访问失败 (${jsResponse.statusCode})`);
        allPassed = false;
      }
    } catch (error) {
      console.log('  ❌ JavaScript文件检查失败');
      allPassed = false;
    }
    
    console.log('\n' + '='.repeat(50));
    if (allPassed) {
      console.log('🎉 部署检查通过！网站运行正常');
      console.log('\n📋 建议的后续测试:');
      console.log('1. 在浏览器中手动测试游戏功能');
      console.log('2. 测试不同设备和屏幕尺寸');
      console.log('3. 检查浏览器控制台是否有错误');
      console.log('4. 验证所有游戏流程');
      return true;
    } else {
      console.log('❌ 部署检查发现问题！请检查上述错误');
      return false;
    }
    
  } catch (error) {
    console.log(`❌ 检查失败: ${error.message}`);
    console.log('\n可能的原因:');
    console.log('- 网站还未完全部署');
    console.log('- URL不正确');
    console.log('- 网络连接问题');
    console.log('- 服务器配置问题');
    return false;
  }
}

// 显示使用说明
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('使用方法:');
  console.log('  node scripts/post-deploy-check.js [URL]');
  console.log('');
  console.log('示例:');
  console.log('  node scripts/post-deploy-check.js https://your-site.netlify.app');
  console.log('  node scripts/post-deploy-check.js http://localhost:8000');
  console.log('');
  console.log('如果不提供URL，将检查 http://localhost:8000');
  process.exit(0);
}

// 运行检查
runChecks().then(success => {
  process.exit(success ? 0 : 1);
});