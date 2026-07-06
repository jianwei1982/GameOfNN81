/**
 * 评分管理器类
 * 负责积分计算、连击系数、积分抽奖和日志记录
 */
class ScoreManager {
    constructor(storageAdapter) {
        this.storage = storageAdapter || new LocalStorageAdapter();
        this.reset();
        this.persistedScore = 0;
        this.persistedLogs = [];
    }

    /**
     * 异步初始化：从存储加载积分和日志
     */
    async init() {
        this.persistedScore = await this.storage.loadScore();
        this.persistedLogs = await this.storage.loadLogs();
    }

    /**
     * 重置游戏相关数据（保留持久化积分）
     */
    reset() {
        this.score = 0;
        this.correctCount = 0;
        this.incorrectCount = 0;
        this.totalQuestions = 0;
        this.answeredQuestions = 0;

        // 连击追踪
        this.correctStreak = 0;
        this.wrongStreak = 0;
        this.maxCorrectStreak = 0;
        this.maxWrongStreak = 0;

        // 每道题的详细得分记录
        this.questionScores = [];
    }

    /**
     * 获取总积分（持久化积分 + 当前游戏积分）
     */
    getTotalScore() {
        return this.persistedScore + this.score;
    }

    /**
     * 设置总题目数
     */
    setTotalQuestions(total) {
        this.totalQuestions = total;
    }

    /**
     * 获取当前连击系数
     * @param {boolean} isCorrect - 当前答题是否正确
     * @returns {{ streak: number, coefficient: number, isCorrect: boolean }}
     */
    getStreakInfo(isCorrect) {
        const streak = isCorrect ? this.correctStreak + 1 : this.wrongStreak + 1;
        const coefficient = this.calculateCoefficient(isCorrect, streak);
        return { streak, coefficient, isCorrect };
    }

    /**
     * 获取当前累计连击信息（供界面在题目之间显示）
     */
    getCurrentStreakInfo() {
        if (this.correctStreak > 0) {
            const nextStreak = this.correctStreak + 1;
            const coeff = this.calculateCoefficient(true, nextStreak);
            return { streak: this.correctStreak, coefficient: coeff, isCorrect: true };
        }
        if (this.wrongStreak > 0) {
            const nextStreak = this.wrongStreak + 1;
            const coeff = this.calculateCoefficient(false, nextStreak);
            return { streak: this.wrongStreak, coefficient: coeff, isCorrect: false };
        }
        return { streak: 0, coefficient: 1.0, isCorrect: true };
    }

    /**
     * 计算系数
     * 正确：第1次1.0, 第2次1.1, 第3次1.2, 第4次1.3, 第5次1.4, 第6次+1.5
     * 错误：第1次1.0, 第2次1.2, 第3次1.4, 第4次+1.5
     */
    calculateCoefficient(isCorrect, streak) {
        if (isCorrect) {
            if (streak >= 6) return 1.5;
            return 1.0 + (streak - 1) * 0.1;
        } else {
            if (streak >= 4) return 1.5;
            return 1.0 + (streak - 1) * 0.2;
        }
    }

    /**
     * 记录答题结果
     * @param {boolean} isCorrect - 是否答对
     * @returns {{ scoreChange: number, streak: number, coefficient: number, totalScore: number }}
     */
    async recordAnswer(isCorrect) {
        this.answeredQuestions++;

        const streakInfo = this.getStreakInfo(isCorrect);
        const coefficient = streakInfo.coefficient;

        // 计算积分变化
        const baseScore = 10;
        let scoreChange;

        if (isCorrect) {
            this.correctCount++;
            this.correctStreak++;
            this.wrongStreak = 0;
            scoreChange = Math.round(baseScore * coefficient);

            if (this.correctStreak > this.maxCorrectStreak) {
                this.maxCorrectStreak = this.correctStreak;
            }
        } else {
            this.incorrectCount++;
            this.wrongStreak++;
            this.correctStreak = 0;
            scoreChange = -Math.round(baseScore * coefficient);

            if (this.wrongStreak > this.maxWrongStreak) {
                this.maxWrongStreak = this.wrongStreak;
            }
        }

        this.score += scoreChange;

        // 记录每题的详细得分
        this.questionScores.push({
            questionIndex: this.answeredQuestions,
            isCorrect,
            streak: streakInfo.streak,
            coefficient,
            scoreChange,
            balanceAfter: this.score
        });

        // 记录持久化日志
        await this.addLog({
            type: isCorrect ? 'correct' : 'wrong',
            detail: `第${this.answeredQuestions}题 ${isCorrect ? '答对' : '答错'}（连击${streakInfo.streak}次，系数${coefficient}）`,
            scoreChange: isCorrect ? `+${scoreChange}` : scoreChange,
            balanceAfter: this.getTotalScore()
        });

        return {
            scoreChange,
            streak: streakInfo.streak,
            coefficient,
            totalScore: this.getTotalScore()
        };
    }

    /**
     * 积分抽红包
     * @returns {{ success: boolean, prize: number|null, message: string }}
     */
    async drawLottery() {
        const result = await this.storage.drawLottery();
        if (result.success) {
            this.persistedScore = result.balanceAfter;
        }
        return result;
    }

    /**
     * 添加日志条目
     */
    async addLog(entry) {
        const logEntry = await this.storage.addLog(entry);
        this.persistedLogs.push(logEntry);
    }

    /**
     * 清空所有日志记录
     */
    async clearLogs() {
        this.persistedLogs = [];
        await this.storage.clearLogs();
    }

    /**
     * 获取最近的日志
     */
    getRecentLogs(count = 50) {
        return this.persistedLogs.slice(-count).reverse();
    }

    /**
     * 获取所有日志
     */
    async getAllLogs() {
        this.persistedLogs = await this.storage.loadLogs();
        return this.persistedLogs;
    }

    /**
     * 游戏结束时持久化积分（将游戏积分合并到持久化积分）
     */
    async finalizeGameScore() {
        this.persistedScore += this.score;
        this.score = 0;
        await this.storage.saveScore(this.persistedScore);
    }

    /**
     * 计算当前正确率
     */
    updateAccuracy() {
        if (this.answeredQuestions === 0) return 0;
        return Math.round((this.correctCount / this.answeredQuestions) * 100);
    }

    /**
     * 获取统计信息
     */
    getStatistics() {
        return {
            score: this.score,
            totalScore: this.getTotalScore(),
            correctCount: this.correctCount,
            incorrectCount: this.incorrectCount,
            totalQuestions: this.totalQuestions,
            answeredQuestions: this.answeredQuestions,
            accuracy: this.updateAccuracy(),
            maxCorrectStreak: this.maxCorrectStreak,
            maxWrongStreak: this.maxWrongStreak
        };
    }

    /**
     * 获取当前进度
     */
    getProgress() {
        return {
            current: this.answeredQuestions,
            total: this.totalQuestions,
            remaining: this.totalQuestions - this.answeredQuestions
        };
    }

    /**
     * 检查游戏是否结束
     */
    isGameComplete() {
        return this.answeredQuestions >= this.totalQuestions;
    }
}

// 支持Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoreManager;
}