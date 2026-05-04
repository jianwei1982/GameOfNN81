/**
 * 题目生成器类
 * 负责生成1×1到9×9范围内的乘法/除法题目和四选一答案选项
 */
class QuestionGenerator {
    constructor() {
        this.usedQuestions = new Set();
        this.questionType = 'multiplication'; // 'multiplication' 或 'division'
    }

    /**
     * 设置题目类型
     * @param {string} type - 'multiplication', 'division' 或 'mixed'
     */
    setQuestionType(type) {
        if (type === 'mixed') {
            this.questionType = 'mixed';
        } else if (type === 'division') {
            this.questionType = 'division';
        } else {
            this.questionType = 'multiplication';
        }
    }

    /**
     * 获取题目类型
     * @returns {string} 题目类型
     */
    getQuestionType() {
        return this.questionType;
    }

    /**
     * 生成指定数量的题目
     * @param {number} count - 题目数量
     * @returns {Array} 题目数组
     */
    generateQuestions(count) {
        const questions = [];
        this.usedQuestions.clear();

        while (questions.length < count) {
            const question = this.generateSingleQuestion();

            const questionKey = question.questionType === 'division'
                ? `D${question.dividend}÷${question.divisor}`
                : `M${question.multiplicand}x${question.multiplier}`;

            if (!this.usedQuestions.has(questionKey)) {
                this.usedQuestions.add(questionKey);
                questions.push(question);
            }
        }

        return this.shuffleArray(questions);
    }

    /**
     * 生成单个题目（根据当前题目类型）
     * @returns {Object} 题目对象
     */
    generateSingleQuestion() {
        if (this.questionType === 'mixed') {
            // 混合模式：随机选择乘法或除法
            return Math.random() < 0.5
                ? this.generateMultiplicationQuestion()
                : this.generateDivisionQuestion();
        } else if (this.questionType === 'division') {
            return this.generateDivisionQuestion();
        } else {
            return this.generateMultiplicationQuestion();
        }
    }

    /**
     * 生成单个乘法题目
     * @returns {Object} 题目对象
     */
    generateMultiplicationQuestion() {
        const multiplicand = Math.floor(Math.random() * 8) + 2; // 2-9
        const multiplier = Math.floor(Math.random() * 8) + 2;   // 2-9
        const correctAnswer = multiplicand * multiplier;
        const options = this.createMultipleChoice(correctAnswer);

        return {
            questionType: 'multiplication',
            multiplicand,
            multiplier,
            correctAnswer,
            options,
            userAnswer: null,
            isCorrect: null
        };
    }

    /**
     * 生成单个除法题目
     * @returns {Object} 题目对象
     */
    generateDivisionQuestion() {
        // 先随机生成除数和商（2-9），然后计算被除数
        const divisor = Math.floor(Math.random() * 8) + 2;  // 2-9
        const quotient = Math.floor(Math.random() * 8) + 2; // 2-9
        const dividend = divisor * quotient;                // 4-81
        const correctAnswer = quotient;
        const options = this.createMultipleChoice(correctAnswer);

        return {
            questionType: 'division',
            dividend,
            divisor,
            correctAnswer,
            options,
            userAnswer: null,
            isCorrect: null
        };
    }

    /**
     * 创建四选一答案选项
     * @param {number} correctAnswer - 正确答案
     * @returns {Array} 四个选项的数组
     */
    createMultipleChoice(correctAnswer) {
        const options = [correctAnswer];
        const usedNumbers = new Set([correctAnswer]);

        while (options.length < 4) {
            // 生成错误选项：正确答案±1到±10的随机值
            const offset = Math.floor(Math.random() * 20) - 10; // -10到+10
            const option = Math.max(1, correctAnswer + offset);

            if (!usedNumbers.has(option)) {
                options.push(option);
                usedNumbers.add(option);
            }
        }

        return this.shuffleArray(options);
    }

    /**
     * 确保题目唯一性
     * @param {Array} questions - 题目数组
     * @returns {boolean} 是否所有题目都唯一
     */
    ensureUniqueness(questions) {
        const questionKeys = new Set();
        
        for (const question of questions) {
            const key = `${question.multiplicand}x${question.multiplier}`;
            if (questionKeys.has(key)) {
                return false;
            }
            questionKeys.add(key);
        }
        
        return true;
    }

    /**
     * Fisher-Yates洗牌算法
     * @param {Array} array - 要洗牌的数组
     * @returns {Array} 洗牌后的数组
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * 重置生成器状态
     */
    reset() {
        this.usedQuestions.clear();
    }
}

// 支持Node.js环境
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QuestionGenerator;
}