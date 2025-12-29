/**
 * 评分管理器类
 * 负责计算得分、正确率和维护统计信息
 */
class ScoreManager {
    constructor() {
        this.reset();
    }

    /**
     * 重置统计数据
     */
    reset() {
        this.score = 0;
        this.correctCount = 0;
        this.incorrectCount = 0;
        this.totalQuestions = 0;
        this.answeredQuestions = 0;
    }

    /**
     * 设置总题目数
     * @param {number} total - 总题目数
     */
    setTotalQuestions(total) {
        this.totalQuestions = total;
    }

    /**
     * 记录答题结果
     * @param {boolean} isCorrect - 是否答对
     */
    recordAnswer(isCorrect) {
        this.answeredQuestions++;
        
        if (isCorrect) {
            this.correctCount++;
            this.score += 10; // 每题10分
        } else {
            this.incorrectCount++;
        }
    }

    /**
     * 计算当前得分
     * @returns {number} 当前得分
     */
    calculateScore() {
        return this.score;
    }

    /**
     * 更新正确率
     * @returns {number} 正确率百分比
     */
    updateAccuracy() {
        if (this.answeredQuestions === 0) {
            return 0;
        }
        return Math.round((this.correctCount / this.answeredQuestions) * 100);
    }

    /**
     * 获取统计信息
     * @returns {Object} 统计信息对象
     */
    getStatistics() {
        return {
            score: this.score,
            correctCount: this.correctCount,
            incorrectCount: this.incorrectCount,
            totalQuestions: this.totalQuestions,
            answeredQuestions: this.answeredQuestions,
            accuracy: this.updateAccuracy()
        };
    }

    /**
     * 获取当前进度
     * @returns {Object} 进度信息
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
     * @returns {boolean} 是否结束
     */
    isGameComplete() {
        return this.answeredQuestions >= this.totalQuestions;
    }
}

// 支持Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScoreManager;
}