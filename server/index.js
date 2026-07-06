const express = require('express');
const path = require('path');
const { pool, initializeDatabase } = require('./db');
const errorHandler = require('./middleware/errorHandler');

require('dotenv').config();

const app = express();
app.use(express.json());

// CORS（允许一体化部署或跨域调试）
app.use(require('cors')());

// API 路由
app.use('/api/score', require('./routes/scores')(pool));
app.use('/api/logs', require('./routes/logs')(pool));
app.use('/api/lottery', require('./routes/lottery')(pool));

// 托管前端静态文件（在 API 路由之后，避免被 index.html 覆盖）
app.use(express.static(path.join(__dirname, '..')));

// SPA 回退：未匹配的路径返回 index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 错误处理
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await initializeDatabase();
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🎮 Game of NN81 服务已启动`);
            console.log(`   前端: http://localhost:${PORT}`);
            console.log(`   API:  http://localhost:${PORT}/api`);
        });
    } catch (err) {
        console.error('服务启动失败:', err);
        process.exit(1);
    }
}

start();