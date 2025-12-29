/**
 * QuestionGenerator类的测试文件
 */

const QuestionGenerator = require('../js/QuestionGenerator.js');
const fc = require('fast-check');

describe('QuestionGenerator', () => {
    let generator;

    beforeEach(() => {
        generator = new QuestionGenerator();
    });

    describe('基本功能测试', () => {
        test('应该能够创建QuestionGenerator实例', () => {
            expect(generator).toBeInstanceOf(QuestionGenerator);
            expect(generator.usedQuestions).toBeInstanceOf(Set);
        });

        test('应该能够生成指定数量的题目', () => {
            const questions = generator.generateQuestions(5);
            expect(questions).toHaveLength(5);
        });

        test('生成的题目应该包含必要的属性', () => {
            const questions = generator.generateQuestions(1);
            const question = questions[0];
            
            expect(question).toHaveProperty('multiplicand');
            expect(question).toHaveProperty('multiplier');
            expect(question).toHaveProperty('correctAnswer');
            expect(question).toHaveProperty('options');
            expect(question.options).toHaveLength(4);
        });
    });

    describe('属性测试', () => {
        test('属性 5：题目范围约束 - Feature: multiplication-table-game, Property 5: 题目范围约束', () => {
            fc.assert(fc.property(
                fc.integer({ min: 1, max: 20 }), // 题目数量
                (count) => {
                    const questions = generator.generateQuestions(count);
                    
                    return questions.every(question => {
                        return question.multiplicand >= 1 && question.multiplicand <= 9 &&
                               question.multiplier >= 1 && question.multiplier <= 9;
                    });
                }
            ), { numRuns: 10 });
        });

        test('属性 6：题目唯一性 - Feature: multiplication-table-game, Property 6: 题目唯一性', () => {
            fc.assert(fc.property(
                fc.integer({ min: 1, max: 20 }), // 减少最大题目数量
                (count) => {
                    const questions = generator.generateQuestions(count);
                    return generator.ensureUniqueness(questions);
                }
            ), { numRuns: 10 });
        });

        test('属性 3：答案选项格式 - Feature: multiplication-table-game, Property 3: 答案选项格式', () => {
            fc.assert(fc.property(
                fc.integer({ min: 1, max: 10 }),
                (count) => {
                    const questions = generator.generateQuestions(count);
                    
                    return questions.every(question => {
                        // 检查选项数量
                        if (question.options.length !== 4) return false;
                        
                        // 检查是否包含正确答案
                        if (!question.options.includes(question.correctAnswer)) return false;
                        
                        // 检查选项是否唯一
                        const uniqueOptions = new Set(question.options);
                        return uniqueOptions.size === 4;
                    });
                }
            ), { numRuns: 10 });
        });
    });
});