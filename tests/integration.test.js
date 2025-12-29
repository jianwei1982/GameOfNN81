/**
 * 集成测试
 * 测试所有组件的协同工作 (简化版本)
 */

const QuestionGenerator = require('../js/QuestionGenerator');
const ScoreManager = require('../js/ScoreManager');

describe('组件集成测试 (简化版)', () => {
    let questionGenerator;
    let scoreManager;

    beforeEach(() => {
        questionGenerator = new QuestionGenerator();
        scoreManager = new ScoreManager();
    });

    test('应该能够协同工作完成完整游戏流程', () => {
        // 1. 初始化组件
        expect(questionGenerator).toBeInstanceOf(QuestionGenerator);
        expect(scoreManager).toBeInstanceOf(ScoreManager);

        // 2. 设置游戏参数
        const questionCount = 5;
        scoreManager.setTotalQuestions(questionCount);

        // 3. 生成题目
        const questions = questionGenerator.generateQuestions(questionCount);
        expect(questions).toHaveLength(questionCount);

        // 4. 模拟答题过程
        let correctAnswers = 0;
        questions.forEach((question, index) => {
            // 验证题目结构
            expect(question).toHaveProperty('multiplicand');
            expect(question).toHaveProperty('multiplier');
            expect(question).toHaveProperty('correctAnswer');
            expect(question).toHaveProperty('options');
            expect(question.options).toHaveLength(4);

            // 模拟选择正确答案
            const isCorrect = question.options.includes(question.correctAnswer);
            expect(isCorrect).toBe(true);

            // 记录答题结果 (模拟50%正确率)
            const shouldAnswerCorrectly = index % 2 === 0;
            scoreManager.recordAnswer(shouldAnswerCorrectly);
            
            if (shouldAnswerCorrectly) {
                correctAnswers++;
            }
        });

        // 5. 验证最终统计
        const finalStats = scoreManager.getStatistics();
        expect(finalStats.totalQuestions).toBe(questionCount);
        expect(finalStats.answeredQuestions).toBe(questionCount);
        expect(finalStats.correctCount).toBe(correctAnswers);
        expect(finalStats.incorrectCount).toBe(questionCount - correctAnswers);
        expect(finalStats.score).toBe(correctAnswers * 10);
        
        // 验证正确率计算
        const expectedAccuracy = Math.round((correctAnswers / questionCount) * 100);
        expect(finalStats.accuracy).toBe(expectedAccuracy);
    });

    test('应该正确处理数据传递和状态同步', () => {
        // 测试组件间的数据流
        const questionCount = 3;
        
        // 1. ScoreManager 设置
        scoreManager.setTotalQuestions(questionCount);
        expect(scoreManager.getProgress().total).toBe(questionCount);
        expect(scoreManager.getProgress().current).toBe(0);

        // 2. QuestionGenerator 生成题目
        const questions = questionGenerator.generateQuestions(questionCount);
        expect(questions).toHaveLength(questionCount);

        // 3. 验证题目唯一性 (QuestionGenerator 内部逻辑)
        const questionKeys = new Set();
        questions.forEach(question => {
            const key = `${question.multiplicand}x${question.multiplier}`;
            expect(questionKeys.has(key)).toBe(false);
            questionKeys.add(key);
        });

        // 4. 模拟逐题答题和状态更新
        questions.forEach((question, index) => {
            // 答题前的状态
            const progressBefore = scoreManager.getProgress();
            expect(progressBefore.current).toBe(index);

            // 模拟答题
            scoreManager.recordAnswer(true);

            // 答题后的状态
            const progressAfter = scoreManager.getProgress();
            expect(progressAfter.current).toBe(index + 1);
            
            const stats = scoreManager.getStatistics();
            expect(stats.correctCount).toBe(index + 1);
            expect(stats.score).toBe((index + 1) * 10);
        });
    });

    test('应该正确处理边界情况和错误恢复', () => {
        // 测试空题目数量
        const emptyQuestions = questionGenerator.generateQuestions(0);
        expect(emptyQuestions).toHaveLength(0);

        // 测试大量题目生成 (最多81题，因为9x9=81种组合)
        const maxQuestions = questionGenerator.generateQuestions(81);
        expect(maxQuestions).toHaveLength(81);
        
        // 验证所有题目都在1-9范围内
        maxQuestions.forEach(question => {
            expect(question.multiplicand).toBeGreaterThanOrEqual(1);
            expect(question.multiplicand).toBeLessThanOrEqual(9);
            expect(question.multiplier).toBeGreaterThanOrEqual(1);
            expect(question.multiplier).toBeLessThanOrEqual(9);
            expect(question.correctAnswer).toBe(question.multiplicand * question.multiplier);
        });

        // 测试ScoreManager重置功能
        scoreManager.setTotalQuestions(5);
        scoreManager.recordAnswer(true);
        scoreManager.recordAnswer(false);
        
        expect(scoreManager.getStatistics().answeredQuestions).toBe(2);
        
        scoreManager.reset();
        const resetStats = scoreManager.getStatistics();
        expect(resetStats.score).toBe(0);
        expect(resetStats.correctCount).toBe(0);
        expect(resetStats.incorrectCount).toBe(0);
        expect(resetStats.answeredQuestions).toBe(0);
    });

    test('应该维护组件状态的一致性', () => {
        // 测试多轮游戏的状态管理
        for (let round = 1; round <= 3; round++) {
            // 重置组件
            questionGenerator.reset();
            scoreManager.reset();
            
            // 开始新一轮
            const questionCount = round * 2; // 2, 4, 6题
            scoreManager.setTotalQuestions(questionCount);
            const questions = questionGenerator.generateQuestions(questionCount);
            
            expect(questions).toHaveLength(questionCount);
            expect(scoreManager.getProgress().total).toBe(questionCount);
            
            // 模拟完整答题
            questions.forEach(() => {
                scoreManager.recordAnswer(Math.random() > 0.5); // 随机答题
            });
            
            const finalStats = scoreManager.getStatistics();
            expect(finalStats.answeredQuestions).toBe(questionCount);
            expect(finalStats.totalQuestions).toBe(questionCount);
            expect(finalStats.correctCount + finalStats.incorrectCount).toBe(questionCount);
        }
    });
});