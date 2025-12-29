/**
 * 游戏控制器类
 * 负责管理游戏状态和流程，协调各组件间的交互
 */
class GameController {
    constructor() {
        this.questionGenerator = new QuestionGenerator();
        this.scoreManager = new ScoreManager();
        this.uiRenderer = new UIRenderer();
        
        this.gameState = {
            currentQuestionIndex: 0,
            questions: [],
            isGameActive: false,
            selectedQuestionCount: 10
        };
        
        this.initializeEventListeners();
    }

    /**
     * 初始化事件监听器
     */
    initializeEventListeners() {
        // 使用事件委托来处理动态内容
        document.addEventListener('click', (e) => {
            // 题目数量选择按钮
            if (e.target.classList.contains('count-btn')) {
                const count = parseInt(e.target.dataset.count);
                this.startGame(count);
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
        });
    }

    /**
     * 开始游戏
     * @param {number} questionCount - 题目数量
     */
    startGame(questionCount = 10) {
        try {
            // 验证输入参数
            if (!Number.isInteger(questionCount) || questionCount <= 0) {
                console.warn('无效的题目数量，使用默认值10');
                questionCount = 10;
            }
            
            this.gameState.selectedQuestionCount = questionCount;
            this.gameState.currentQuestionIndex = 0;
            this.gameState.isGameActive = true;
            
            // 重置管理器
            this.scoreManager.reset();
            this.scoreManager.setTotalQuestions(questionCount);
            this.questionGenerator.reset();
            
            // 生成题目
            this.gameState.questions = this.questionGenerator.generateQuestions(questionCount);
            
            // 验证题目生成是否成功
            if (!this.gameState.questions || this.gameState.questions.length !== questionCount) {
                throw new Error('题目生成失败');
            }
            
            // 显示第一题
            this.showCurrentQuestion();
            
            console.log(`游戏开始：${questionCount}题模式`);
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
                
                // 验证题目数据完整性
                if (!currentQuestion || !currentQuestion.options || currentQuestion.options.length !== 4) {
                    throw new Error('题目数据不完整');
                }
                
                this.uiRenderer.renderGameScreen(currentQuestion, progress, stats);
                
                console.log(`显示第${this.gameState.currentQuestionIndex + 1}题: ${currentQuestion.multiplicand} × ${currentQuestion.multiplier}`);
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
     * @param {number} selectedIndex - 选择的答案索引
     */
    submitAnswer(selectedIndex) {
        try {
            if (!this.gameState.isGameActive) {
                console.warn('游戏未激活，忽略答案提交');
                return;
            }
            
            // 验证输入参数
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
            
            // 更新得分
            this.scoreManager.recordAnswer(isCorrect);
            
            // 找到正确答案的索引
            const correctIndex = currentQuestion.options.indexOf(currentQuestion.correctAnswer);
            
            // 检查是否是最后一题
            const isLastQuestion = this.gameState.currentQuestionIndex === this.gameState.questions.length - 1;
            
            // 显示视觉反馈 (需求 9.1, 9.5)
            this.uiRenderer.highlightCorrectAnswer(correctIndex, selectedIndex, isLastQuestion);
            
            // 记录答题日志
            console.log(`第${this.gameState.currentQuestionIndex + 1}题答题结果: ${isCorrect ? '正确' : '错误'}, 选择: ${selectedAnswer}, 正确答案: ${currentQuestion.correctAnswer}`);
            
            if (isCorrect) {
                // 答对了，直接进入下一题或结束游戏
                if (isLastQuestion) {
                    setTimeout(() => this.endGame(), 1000);
                } else {
                    setTimeout(() => this.nextQuestion(), 1000);
                }
            } else {
                // 答错了
                if (isLastQuestion) {
                    // 最后一题答错，等待2秒后显示结果界面 (需求 9.3)
                    setTimeout(() => this.endGame(), 2000);
                } else {
                    // 不是最后一题，等待2秒后进入下一题 (需求 9.2)
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
    endGame() {
        try {
            this.gameState.isGameActive = false;
            const finalStats = this.scoreManager.getStatistics();
            
            // 验证统计数据
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
     * 重置游戏
     */
    resetGame() {
        try {
            this.gameState.isGameActive = false;
            this.gameState.currentQuestionIndex = 0;
            this.gameState.questions = [];
            
            this.scoreManager.reset();
            this.questionGenerator.reset();
            
            this.uiRenderer.renderStartScreen();
            
            console.log('游戏已重置');
        } catch (error) {
            console.error('重置游戏时发生错误:', error);
            this.handleGameError('游戏重置失败');
        }
    }

    /**
     * 处理游戏错误
     * @param {string} message - 错误消息
     */
    handleGameError(message) {
        console.error('游戏错误:', message);
        
        // 重置游戏状态
        this.gameState.isGameActive = false;
        
        // 显示错误消息给用户
        if (this.uiRenderer && typeof this.uiRenderer.showErrorFeedback === 'function') {
            this.uiRenderer.showErrorFeedback(message);
        }
        
        // 返回到开始界面
        setTimeout(() => {
            this.resetGame();
        }, 3000);
    }

    /**
     * 获取当前游戏状态
     * @returns {Object} 游戏状态
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
     * @returns {boolean} 游戏是否进行中
     */
    isGameInProgress() {
        return this.gameState.isGameActive;
    }

    /**
     * 获取当前题目信息
     * @returns {Object|null} 当前题目信息
     */
    getCurrentQuestion() {
        if (this.gameState.currentQuestionIndex < this.gameState.questions.length) {
            return this.gameState.questions[this.gameState.currentQuestionIndex];
        }
        return null;
    }

    /**
     * 获取游戏进度百分比
     * @returns {number} 进度百分比 (0-100)
     */
    getProgressPercentage() {
        if (this.gameState.questions.length === 0) return 0;
        return Math.round((this.gameState.currentQuestionIndex / this.gameState.questions.length) * 100);
    }

    /**
     * 暂停游戏
     */
    pauseGame() {
        if (this.gameState.isGameActive) {
            this.gameState.isGameActive = false;
            console.log('游戏已暂停');
        }
    }

    /**
     * 恢复游戏
     */
    resumeGame() {
        if (!this.gameState.isGameActive && this.gameState.questions.length > 0) {
            this.gameState.isGameActive = true;
            console.log('游戏已恢复');
        }
    }

    /**
     * 跳过当前题目 (调试用)
     */
    skipCurrentQuestion() {
        if (this.gameState.isGameActive && this.gameState.questions.length > 0) {
            console.log('跳过当前题目');
            this.nextQuestion();
        }
    }

    /**
     * 获取所有组件的状态信息 (调试用)
     * @returns {Object} 组件状态信息
     */
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