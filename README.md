# 99乘法表网页游戏

一个交互式的数学练习应用，帮助用户通过选择题的方式练习乘法运算。

## 功能特点

- 🎯 **自定义题目数量**：支持10、20、50、100题选择
- 📊 **实时统计**：显示得分、进度和正确率
- 🎨 **响应式设计**：适配桌面和移动设备
- ⚡ **即时反馈**：错误答案高亮显示正确答案
- 🔄 **重新开始**：支持快速重新开始游戏

## 技术栈

- **前端**：原生HTML、CSS、JavaScript
- **测试**：Jest + fast-check
- **部署**：Netlify

## 本地开发

### 安装依赖

```bash
npm install
```

### 运行测试

```bash
# 运行所有测试
npm test

# 监听模式运行测试
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

### 本地服务器

```bash
# 使用Python启动本地服务器
npm run serve

# 或者使用任何静态文件服务器
# 例如：npx serve .
```

然后在浏览器中访问 `http://localhost:8000`

## 部署

### Netlify部署

1. **自动部署**：将代码推送到GitHub，连接到Netlify即可自动部署
2. **手动部署**：将整个项目文件夹拖拽到Netlify部署页面

### 部署配置

项目包含以下Netlify配置文件：

- `netlify.toml`：主要配置文件
- `_redirects`：路由重定向规则
- `_headers`：HTTP头部设置

### 环境要求

- Node.js 18+（仅用于开发和测试）
- 现代浏览器（支持ES6+）

## 项目结构

```
├── index.html          # 主页面
├── styles.css          # 样式文件
├── js/                 # JavaScript源码
│   ├── GameController.js
│   ├── QuestionGenerator.js
│   ├── ScoreManager.js
│   ├── UIRenderer.js
│   └── main.js
├── tests/              # 测试文件
├── netlify.toml        # Netlify配置
├── _redirects          # 重定向规则
├── _headers            # HTTP头部
└── package.json        # 项目配置
```

## 游戏规则

1. 选择题目数量（10、20、50、100题）
2. 回答1×1到9×9范围内的乘法题目
3. 每题提供四个选项，选择正确答案
4. 实时查看得分和正确率
5. 游戏结束后查看详细统计

## 开发

### 添加新功能

1. 在相应的JavaScript类中添加功能
2. 编写对应的单元测试和属性测试
3. 更新UI渲染逻辑（如需要）
4. 运行测试确保功能正常

### 测试策略

- **单元测试**：测试具体功能和边界情况
- **属性测试**：使用fast-check验证通用属性
- **集成测试**：测试组件间的交互

## 许可证

MIT License