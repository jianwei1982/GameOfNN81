# 部署指南

本文档详细说明如何将99乘法表游戏部署到Netlify平台。

## 部署前准备

### 1. 运行部署检查

在部署前，运行以下命令检查项目是否准备就绪：

```bash
npm run deploy:check
```

这个脚本会检查：
- ✅ 所有必要文件是否存在
- ✅ HTML中的文件路径是否正确
- ✅ Netlify配置是否正确
- ✅ 文件大小和优化建议

### 2. 运行测试

确保所有测试通过：

```bash
npm test
```

## Netlify部署方式

### 方式一：Git集成部署（推荐）

1. **准备Git仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **连接Netlify**
   - 登录 [Netlify](https://netlify.com)
   - 点击 "New site from Git"
   - 选择GitHub并授权
   - 选择你的仓库

3. **配置构建设置**
   - **Build command**: `npm run build`
   - **Publish directory**: `.`
   - **Node version**: `18`

4. **部署**
   - 点击 "Deploy site"
   - 等待部署完成

### 方式二：拖拽部署

1. **准备文件**
   ```bash
   # 确保所有文件都在项目根目录
   npm run deploy:check
   ```

2. **手动部署**
   - 访问 [Netlify Deploy](https://app.netlify.com/drop)
   - 将整个项目文件夹拖拽到页面上
   - 等待上传和部署完成

## 部署配置文件说明

### netlify.toml
主要配置文件，包含：
- 构建设置
- 重定向规则
- HTTP头部配置
- 环境变量

### _redirects
简单的重定向规则文件，确保SPA路由正常工作。

### _headers
HTTP头部设置，包括：
- 安全头部
- 缓存策略
- 性能优化

## 部署后验证

### 1. 功能测试
访问部署的网站，测试以下功能：
- ✅ 页面正常加载
- ✅ 选择题目数量
- ✅ 游戏流程正常
- ✅ 得分统计正确
- ✅ 响应式设计工作正常

### 2. 性能检查
- 使用浏览器开发者工具检查加载时间
- 验证缓存策略是否生效
- 检查移动设备兼容性

### 3. SEO和可访问性
- 检查页面标题和描述
- 验证响应式设计
- 测试键盘导航

## 自动部署

### GitHub Actions（可选）

如果需要更高级的CI/CD流程，可以创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run deployment check
      run: npm run deploy:check
    
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v2.0
      with:
        publish-dir: '.'
        production-branch: main
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 环境变量

如果需要环境变量，在Netlify控制台中设置：

1. 进入站点设置
2. 选择 "Environment variables"
3. 添加所需变量

## 域名配置

### 自定义域名

1. 在Netlify控制台中选择 "Domain settings"
2. 点击 "Add custom domain"
3. 输入你的域名
4. 按照指示配置DNS记录

### HTTPS

Netlify自动为所有站点提供免费的Let's Encrypt SSL证书。

## 故障排除

### 常见问题

1. **404错误**
   - 检查 `_redirects` 文件是否正确
   - 确保所有文件路径使用相对路径

2. **JavaScript错误**
   - 检查浏览器控制台
   - 验证所有JS文件是否正确加载

3. **样式问题**
   - 检查CSS文件路径
   - 验证响应式设计

4. **构建失败**
   - 检查Node.js版本
   - 确保所有依赖都已安装

### 调试步骤

1. 检查Netlify构建日志
2. 使用浏览器开发者工具
3. 运行本地部署检查：`npm run deploy:check`
4. 测试本地服务器：`npm run serve`

## 监控和维护

### 性能监控
- 使用Netlify Analytics
- 配置Google Analytics（如需要）
- 监控Core Web Vitals

### 更新流程
1. 在本地开发和测试
2. 运行 `npm test` 和 `npm run deploy:check`
3. 提交代码到Git
4. 自动部署到Netlify

## 成本

- Netlify免费计划包括：
  - 100GB带宽/月
  - 300分钟构建时间/月
  - 无限个人和商业项目

对于这个静态游戏项目，免费计划完全足够。