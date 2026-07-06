/**
 * 游戏控制器类
 * 负责管理游戏状态和流程，协调各组件间的交互
 */
class GameController {
    constructor(storageAdapter) {
        this.questionGenerator = new QuestionGenerator();
        this.scoreManager = new ScoreManager(storageAdapter);
        this.uiRenderer = new UIRenderer(this);

        // 音效
        this.correctSound = new Audio('sound/kara-yippee.ogg');
        this.wrongSound = new Audio('sound/kara-not-that-one.ogg');

        this.FIXED_QUESTION_COUNT = 45;

        this.gameState = {
            currentQuestionIndex: 0,
            questions: [],
            isGameActive: false,
            questionType: 'division'
        };

        this.initializeEventListeners();
    }

    /**
     * 异步初始化：加载持久化数据并显示开始界面
     */
    async init() {
        await this.scoreManager.init();
        this.uiRenderer.renderStartScreen(this.scoreManager.getTotalScore());
    }

    /**
     * 初始化事件监听器
     */
    initializeEventListeners() {
        document.addEventListener('click', (e) => {
            // 开始答题按钮
            if (e.target.id === 'start-game-btn') {
                this.startGame();
            }

            // 退出游戏按钮
            if (e.target.id === 'exit-game-btn') {
                this.exitGame();
            }

            // 答案选择按钮
            if (e.target.classList.contains('answer-btn') && this.gameState.isGameActive) {
                const selectedIndex = parseInt(e.target.dataset.answer);
                this.submitAnswer(selectedIndex);
            }

            // 重新开始按钮
            if (e.target.id === 'restart-btn') {
                this.resetGame();
            }

            // 清空积分按钮（开始界面）
            if (e.target.id === 'clear-score-btn') {
                this.clearScore();
            }

            // 清空积分记录按钮（开始界面）
            if (e.target.id === 'clear-logs-btn') {
                this.clearLogHistory();
            }

            // 抽红包入口按钮（开始界面）
            if (e.target.id === 'lottery-btn-start') {
                this.showLottery();
            }

            // 抽红包入口按钮（结果界面）
            if (e.target.id === 'lottery-btn-result') {
                this.showLottery();
            }

            // 拆红包按钮
            if (e.target.id === 'open-packet-btn') {
                this.openLotteryPacket();
            }

            // 关闭红包按钮
            if (e.target.id === 'close-lottery-btn') {
                this.closeLottery();
            }

            // 红包关闭X按钮
            if (e.target.id === 'lottery-close-x') {
                this.closeLottery();
            }

            // 日志面板切换
            if (e.target.id === 'log-toggle' || e.target.closest('#log-toggle')) {
                this.toggleLogPanel();
            }

            // 积分记录入口（开始界面）
            if (e.target.id === 'log-btn-start') {
                this.showLogHistory();
            }

            // 关闭积分记录弹窗
            if (e.target.id === 'log-history-close') {
                this.hideLogHistory();
            }

            // 积分记录筛选按钮
            if (e.target.classList.contains('filter-type-btn')) {
                document.querySelectorAll('.filter-type-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.refreshLogHistory();
            }

            });

        // 积分记录日期筛选（change事件）
        document.addEventListener('change', (e) => {
            if (e.target.id === 'filter-date') {
                this.refreshLogHistory();
            }
        });
    }

    /**
     * 开始游戏（固定45题，仅除法）
     */
    startGame() {
        try {
            const questionType = 'division';

            this.gameState.currentQuestionIndex = 0;
            this.gameState.isGameActive = true;
            this.gameState.questionType = questionType;

            // 重置管理器
            this.scoreManager.reset();
            this.scoreManager.setTotalQuestions(this.FIXED_QUESTION_COUNT);
            this.questionGenerator.reset();
            this.questionGenerator.setQuestionType(questionType);

            // 生成题目
            this.gameState.questions = this.questionGenerator.generateQuestions(this.FIXED_QUESTION_COUNT);

            if (!this.gameState.questions || this.gameState.questions.length !== this.FIXED_QUESTION_COUNT) {
                throw new Error('题目生成失败');
            }

            // 显示第一题
            this.showCurrentQuestion();

            console.log(`游戏开始：${this.FIXED_QUESTION_COUNT}题除法模式`);
        } catch (error) {
            console.error('开始游戏时发生错误:', error);
            this.handleGameError('游戏启动失败，请重试');
        }
    }

    /**
     * 显示当前题目
     */
    showCurrentQuestion() {
        try {
            if (this.gameState.currentQuestionIndex < this.gameState.questions.length) {
                const currentQuestion = this.gameState.questions[this.gameState.currentQuestionIndex];
                const progress = this.scoreManager.getProgress();
                const stats = this.scoreManager.getStatistics();
                const totalScore = this.scoreManager.getTotalScore();

                if (!currentQuestion || !currentQuestion.options || currentQuestion.options.length !== 4) {
                    throw new Error('题目数据不完整');
                }

                const streakInfo = this.scoreManager.getCurrentStreakInfo();
                this.uiRenderer.renderGameScreen(currentQuestion, progress, stats, totalScore, streakInfo);

                console.log(`显示第${this.gameState.currentQuestionIndex + 1}题: ${currentQuestion.dividend} ÷ ${currentQuestion.divisor}`);
            } else {
                console.warn('没有更多题目可显示');
                this.endGame();
            }
        } catch (error) {
            console.error('显示题目时发生错误:', error);
            this.handleGameError('显示题目失败');
        }
    }

    /**
     * 提交答案
     */
    async submitAnswer(selectedIndex) {
        try {
            if (!this.gameState.isGameActive) {
                console.warn('游戏未激活，忽略答案提交');
                return;
            }

            if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > 3) {
                console.warn('无效的答案索引:', selectedIndex);
                return;
            }

            const currentQuestion = this.gameState.questions[this.gameState.currentQuestionIndex];
            if (!currentQuestion) {
                throw new Error('当前题目不存在');
            }

            const selectedAnswer = currentQuestion.options[selectedIndex];
            const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

            // 记录用户答案
            currentQuestion.userAnswer = selectedAnswer;
            currentQuestion.isCorrect = isCorrect;

            // 记录答案并获取积分变化
            const answerResult = await this.scoreManager.recordAnswer(isCorrect);

            // 找到正确答案的索引
            const correctIndex = currentQuestion.options.indexOf(currentQuestion.correctAnswer);

            const isLastQuestion = this.gameState.currentQuestionIndex === this.gameState.questions.length - 1;

            // 获取最新统计数据
            const stats = this.scoreManager.getStatistics();
            const totalScore = this.scoreManager.getTotalScore();

            // 显示视觉反馈
            this.uiRenderer.highlightCorrectAnswer(correctIndex, selectedIndex, isLastQuestion);
            this.uiRenderer.updateGameStats(stats, totalScore);
            this.uiRenderer.showScoreChange(isCorrect, answerResult.scoreChange, answerResult.coefficient);

            // 更新连击显示
            this.uiRenderer.updateStreakDisplay({
                streak: answerResult.streak,
                coefficient: answerResult.coefficient,
                isCorrect
            });

            console.log(`第${this.gameState.currentQuestionIndex + 1}题: ${isCorrect ? '正确' : '错误'}, 积分变化: ${answerResult.scoreChange > 0 ? '+' : ''}${answerResult.scoreChange}`);

            // 播放音效
            if (isCorrect) {
                this.correctSound.currentTime = 0;
                this.correctSound.play().catch(e => console.log('播放正确音效失败:', e));
            } else {
                this.wrongSound.currentTime = 0;
                this.wrongSound.play().catch(e => console.log('播放错误音效失败:', e));
            }

            if (isCorrect) {
                if (isLastQuestion) {
                    setTimeout(() => this.endGame(), 1000);
                } else {
                    setTimeout(() => this.nextQuestion(), 1000);
                }
            } else {
                if (isLastQuestion) {
                    setTimeout(() => this.endGame(), 2000);
                } else {
                    setTimeout(() => this.nextQuestion(), 2000);
                }
            }
        } catch (error) {
            console.error('提交答案时发生错误:', error);
            this.handleGameError('答案提交失败');
        }
    }

    /**
     * 下一题
     */
    nextQuestion() {
        try {
            this.gameState.currentQuestionIndex++;

            if (this.gameState.currentQuestionIndex < this.gameState.questions.length) {
                this.showCurrentQuestion();
            } else {
                this.endGame();
            }
        } catch (error) {
            console.error('进入下一题时发生错误:', error);
            this.handleGameError('无法进入下一题');
        }
    }

    /**
     * 结束游戏
     */
    async endGame() {
        try {
            this.gameState.isGameActive = false;

            // 合并游戏积分到持久化积分
            await this.scoreManager.finalizeGameScore();

            const finalStats = this.scoreManager.getStatistics();

            if (!finalStats) {
                throw new Error('无法获取游戏统计数据');
            }

            this.uiRenderer.renderResultScreen(finalStats);

            console.log('游戏结束，最终统计:', finalStats);
        } catch (error) {
            console.error('结束游戏时发生错误:', error);
            this.handleGameError('游戏结束处理失败');
        }
    }

    /**
     * 退出游戏（保留当前积分）
     */
    async exitGame() {
        if (this.gameState.isGameActive) {
            this.gameState.isGameActive = false;
            await this.scoreManager.finalizeGameScore();
            this.uiRenderer.renderStartScreen(this.scoreManager.getTotalScore());
            console.log('游戏已退出，积分已保留');
        }
    }

    /**
     * 清空积分（需要验证码 881225）
     */
    async clearScore() {
        const code = prompt('请输入验证码清空所有积分：');
        if (code !== '881225') {
            if (code !== null) {
                alert('验证码错误，积分未清空');
            }
            return;
        }
        this.scoreManager.persistedScore = 0;
        await this.scoreManager.storage.saveScore(0);
        this.uiRenderer.renderStartScreen(0);
    }

    /**
     * 清空积分记录（需要验证码 881225）
     */
    async clearLogHistory() {
        const code = prompt('请输入验证码清空所有积分记录：');
        if (code !== '881225') {
            if (code !== null) {
                alert('验证码错误，积分记录未清空');
            }
            return;
        }
        await this.scoreManager.clearLogs();
        this.uiRenderer.renderStartScreen(this.scoreManager.getTotalScore());
    }

    /**
     * 显示抽红包界面
     */
    showLottery() {
        const totalScore = this.scoreManager.getTotalScore();
        this.uiRenderer.showLotteryScreen(totalScore);
    }

    /**
     * 执行抽红包
     */
    async openLotteryPacket() {
        const result = await this.scoreManager.drawLottery();

        if (!result.success) {
            this.uiRenderer.showLotteryError(result.message);
            return;
        }

        const totalScore = this.scoreManager.getTotalScore();
        this.uiRenderer.showLotteryResult(result.prize, totalScore);

        // 更新开始界面的积分显示
        this.uiRenderer.updateStartScreenScore(totalScore);
    }

    /**
     * 关闭抽红包界面
     */
    closeLottery() {
        const totalScore = this.scoreManager.getTotalScore();
        this.uiRenderer.hideLotteryScreen(totalScore);

        // 如果结果界面可见，同步更新其积分显示
        const resultScreen = document.getElementById('result-screen');
        if (resultScreen && resultScreen.classList.contains('active')) {
            const stats = this.scoreManager.getStatistics();
            this.uiRenderer.updateResultScreenScore(stats);
        }
    }

    /**
     * 切换日志面板
     */
    toggleLogPanel() {
        this.uiRenderer.toggleLogPanel();
    }

    /**
     * 重置游戏
     */
    async resetGame() {
        try {
            this.gameState.isGameActive = false;
            this.gameState.currentQuestionIndex = 0;
            this.gameState.questions = [];

            await this.scoreManager.init();
            this.questionGenerator.reset();

            this.uiRenderer.renderStartScreen(this.scoreManager.getTotalScore());

            console.log('游戏已重置');
        } catch (error) {
            console.error('重置游戏时发生错误:', error);
            this.handleGameError('游戏重置失败');
        }
    }

    /**
     * 处理游戏错误
     */
    handleGameError(message) {
        console.error('游戏错误:', message);
        this.gameState.isGameActive = false;

        if (this.uiRenderer && typeof this.uiRenderer.showErrorFeedback === 'function') {
            this.uiRenderer.showErrorFeedback(message);
        }

        setTimeout(async () => {
            await this.resetGame();
        }, 3000);
    }

    /**
     * 获取当前游戏状态
     */
    getGameState() {
        return {
            ...this.gameState,
            stats: this.scoreManager.getStatistics(),
            progress: this.scoreManager.getProgress()
        };
    }

    /**
     * 检查游戏是否进行中
     */
    isGameInProgress() {
        return this.gameState.isGameActive;
    }

    /**
     * 获取当前题目信息
     */
    getCurrentQuestion() {
        if (this.gameState.currentQuestionIndex < this.gameState.questions.length) {
            return this.gameState.questions[this.gameState.currentQuestionIndex];
        }
        return null;
    }

    /**
     * 获取游戏进度百分比
     */
    getProgressPercentage() {
        if (this.gameState.questions.length === 0) return 0;
        return Math.round((this.gameState.currentQuestionIndex / this.gameState.questions.length) * 100);
    }

    /**
     * 获取最近日志（使用内存缓存，同步）
     */
    getLogs() {
        return this.scoreManager.getRecentLogs(100);
    }

    /**
     * 显示积分历史弹窗
     */
    async showLogHistory() {
        const allLogs = await this.scoreManager.getAllLogs();
        this.uiRenderer.showLogHistory(allLogs);
    }

    /**
     * 隐藏积分历史弹窗
     */
    hideLogHistory() {
        this.uiRenderer.hideLogHistory();
    }

    /**
     * 根据当前筛选条件刷新积分记录显示
     */
    async refreshLogHistory() {
        const allLogs = await this.scoreManager.getAllLogs();
        const activeFilter = document.querySelector('.filter-type-btn.active');
        const filterType = activeFilter ? activeFilter.dataset.filter : 'all';
        const filterDate = document.getElementById('filter-date') ? document.getElementById('filter-date').value : '';

        const filtered = allLogs.filter(log => {
            // 类型筛选
            if (filterType !== 'all' && log.type !== filterType) return false;
            // 日期筛选：日志的 timestamp 格式如 "2026/7/6 14:30:00"
            if (filterDate) {
                const logDate = log.timestamp.split(' ')[0];
                // 将各种日期格式统一为 YYYY-MM-DD 比较
                const logDateNormalized = logDate.replace(/\//g, '-');
                if (logDateNormalized !== filterDate) return false;
            }
            return true;
        });

        this.uiRenderer.refreshLogHistory(filtered);
    }

    pauseGame() {
        if (this.gameState.isGameActive) {
            this.gameState.isGameActive = false;
            console.log('游戏已暂停');
        }
    }

    resumeGame() {
        if (!this.gameState.isGameActive && this.gameState.questions.length > 0) {
            this.gameState.isGameActive = true;
            console.log('游戏已恢复');
        }
    }

    skipCurrentQuestion() {
        if (this.gameState.isGameActive && this.gameState.questions.length > 0) {
            console.log('跳过当前题目');
            this.nextQuestion();
        }
    }

    getComponentsStatus() {
        return {
            gameController: {
                isActive: this.gameState.isGameActive,
                currentIndex: this.gameState.currentQuestionIndex,
                totalQuestions: this.gameState.questions.length
            },
            scoreManager: this.scoreManager.getStatistics(),
            questionGenerator: {
                usedQuestionsCount: this.questionGenerator.usedQuestions ? this.questionGenerator.usedQuestions.size : 0
            }
        };
    }
}