/**
 * 主入口文件
 * 初始化游戏应用
 */

// 全局游戏控制器实例
let gameController = null;

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 检查必要的DOM元素是否存在
        const requiredElements = [
            'start-screen', 'game-screen', 'result-screen',
            'current-question', 'total-questions', 'current-score', 'accuracy',
            'question-text', 'final-score', 'final-accuracy', 'correct-count', 'incorrect-count',
            'start-game-btn', 'lottery-overlay', 'open-packet-btn', 'close-lottery-btn'
        ];

        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        if (missingElements.length > 0) {
            throw new Error(`缺少必要的DOM元素: ${missingElements.join(', ')}`);
        }

        // 检查必要的CSS类是否存在
        const requiredClasses = ['.answer-btn'];
        const missingClasses = requiredClasses.filter(selector => !document.querySelector(selector));
        if (missingClasses.length > 0) {
            console.warn(`缺少CSS类元素: ${missingClasses.join(', ')}`);
        }

        // 显示加载状态
        const loadingEl = document.createElement('div');
        loadingEl.id = 'loading-indicator';
        loadingEl.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #666;
            font-size: 18px;
            z-index: 9999;
            background: rgba(255,255,255,0.9);
            padding: 20px 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;
        loadingEl.textContent = '加载中...';
        document.body.appendChild(loadingEl);

        // 根据配置选择存储适配器
        let storageAdapter;
        if (window.API_BASE_URL) {
            console.log('使用 API 存储适配器, API_BASE_URL:', window.API_BASE_URL);
            storageAdapter = new ApiStorageAdapter(window.API_BASE_URL);
        } else {
            console.log('使用 localStorage 存储适配器');
            storageAdapter = new LocalStorageAdapter();
        }

        // 创建游戏控制器实例
        gameController = new GameController(storageAdapter);

        // 异步初始化（加载持久化数据）
        await gameController.init();

        // 移除加载指示
        loadingEl.remove();

        // 将游戏控制器暴露到全局作用域 (用于调试)
        if (typeof window !== 'undefined') {
            window.gameController = gameController;
        }

        console.log('数学闯关游戏已成功初始化');
        console.log('可用的调试命令:');
        console.log('- gameController.getGameState() - 获取游戏状态');
        console.log('- gameController.getComponentsStatus() - 获取组件状态');
        console.log('- gameController.skipCurrentQuestion() - 跳过当前题目');

    } catch (error) {
        console.error('游戏初始化失败:', error);

        // 显示错误信息给用户
        const errorMessage = document.createElement('div');
        errorMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #dc3545;
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            z-index: 9999;
            font-family: Arial, sans-serif;
        `;
        errorMessage.innerHTML = `
            <h3>游戏初始化失败</h3>
            <p>${error.message}</p>
            <p>请刷新页面重试</p>
        `;
        document.body.appendChild(errorMessage);
    }
});

// 全局错误处理
window.addEventListener('error', function(e) {
    console.error('游戏发生未捕获的错误:', e.error);

    if (gameController && typeof gameController.handleGameError === 'function') {
        gameController.handleGameError('发生意外错误，游戏将重置');
    }
});

// 防止页面刷新时丢失游戏状态的警告
window.addEventListener('beforeunload', function(e) {
    if (gameController && gameController.isGameInProgress()) {
        e.preventDefault();
        e.returnValue = '游戏正在进行中，确定要离开吗？';
        return e.returnValue;
    }
});

// 页面可见性变化处理
document.addEventListener('visibilitychange', function() {
    if (gameController) {
        if (document.hidden) {
            console.log('页面隐藏，游戏可能需要暂停');
        } else {
            console.log('页面重新可见');
        }
    }
});

// 键盘快捷键支持
document.addEventListener('keydown', function(e) {
    if (!gameController) return;

    if (gameController.isGameInProgress()) {
        const key = e.key;
        if (['1', '2', '3', '4'].includes(key)) {
            const answerIndex = parseInt(key) - 1;
            const answerButton = document.querySelector(`.answer-btn[data-answer="${answerIndex}"]`);
            if (answerButton && !answerButton.disabled) {
                answerButton.click();
            }
        }
    }

    // ESC键重置游戏或关闭红包/记录弹窗
    if (e.key === 'Escape') {
        const lotteryOverlay = document.getElementById('lottery-overlay');
        if (lotteryOverlay && lotteryOverlay.style.display !== 'none' && lotteryOverlay.style.display !== '') {
            if (gameController.closeLottery) {
                gameController.closeLottery();
            }
            return;
        }
        const logHistoryOverlay = document.getElementById('log-history-overlay');
        if (logHistoryOverlay && logHistoryOverlay.style.display !== 'none' && logHistoryOverlay.style.display !== '') {
            if (gameController.hideLogHistory) {
                gameController.hideLogHistory();
            }
            return;
        }
        if (confirm('确定要重置游戏吗？')) {
            gameController.resetGame();
        }
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { gameController };
}