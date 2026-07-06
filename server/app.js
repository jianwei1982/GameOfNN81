const express = require('express');
const path = require('path');
const { pool, initializeDatabase } = require('./db');
const errorHandler = require('./middleware/errorHandler');

require('dotenv').config();

const app = express();
app.use(express.json());

// CORS
app.use(require('cors')());

// API 路由
app.use('/api/score', require('./routes/scores')(pool));
app.use('/api/logs', require('./routes/logs')(pool));
app.use('/api/lottery', require('./routes/lottery')(pool));

// 托管前端静态文件
app.use(express.static(path.join(__dirname, '..')));

// SPA 回退
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 错误处理
app.use(errorHandler);

module.exports = { app, initializeDatabase };