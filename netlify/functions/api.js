const serverless = require('serverless-http');
const { app, initializeDatabase } = require('../../server/app');

let handler = null;

exports.handler = async (event, context) => {
    // 冷启动时初始化数据库连接池
    if (!handler) {
        try {
            await initializeDatabase();
        } catch (err) {
            console.error('数据库初始化失败:', err.message);
        }
        handler = serverless(app);
    }
    context.callbackWaitsForEmptyEventLoop = false;
    return handler(event, context);
};