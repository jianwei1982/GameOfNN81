/**
 * ScoreManager类的测试文件
 */

const ScoreManager = require('../js/ScoreManager.js');

describe('ScoreManager', () => {
    let scoreManager;

    beforeEach(() => {
        scoreManager = new ScoreManager();
    });

    describe('基本功能测试', () => {
        test('应该能够创建ScoreManager实例', () => {
            expect(scoreManager).toBeInstanceOf(ScoreManager);
        });

        test('初始状态应该正确', () => {
            const stats = scoreManager.getStatistics();
            expect(stats.score).toBe(0);
            expect(stats.correctCount).toBe(0);
            expect(stats.incorrectCount).toBe(0);
            expect(stats.accuracy).toBe(0);
        });

        test('应该能够记录正确答案', () => {
            scoreManager.recordAnswer(true);
            const stats = scoreManager.getStatistics();
            
            expect(stats.correctCount).toBe(1);
            expect(stats.score).toBe(10);
            expect(stats.accuracy).toBe(100);
        });

        test('应该能够记录错误答案', () => {
            scoreManager.recordAnswer(false);
            const stats = scoreManager.getStatistics();
            
            expect(stats.incorrectCount).toBe(1);
            expect(stats.score).toBe(0);
            expect(stats.accuracy).toBe(0);
        });
    });

    describe('统计计算测试', () => {
        test('应该正确计算混合答题的统计信息', () => {
            scoreManager.recordAnswer(true);  // 正确
            scoreManager.recordAnswer(false); // 错误
            scoreManager.recordAnswer(true);  // 正确
            
            const stats = scoreManager.getStatistics();
            expect(stats.correctCount).toBe(2);
            expect(stats.incorrectCount).toBe(1);
            expect(stats.score).toBe(20);
            expect(stats.accuracy).toBe(67); // 2/3 ≈ 67%
        });

        test('重置功能应该正常工作', () => {
            scoreManager.recordAnswer(true);
            scoreManager.reset();
            
            const stats = scoreManager.getStatistics();
            expect(stats.score).toBe(0);
            expect(stats.correctCount).toBe(0);
            expect(stats.incorrectCount).toBe(0);
            expect(stats.accuracy).toBe(0);
        });
    });
});