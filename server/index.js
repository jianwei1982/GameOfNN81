const { app, initializeDatabase } = require('./app');

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