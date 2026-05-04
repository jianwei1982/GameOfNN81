/**
 * 界面渲染器类
 * 负责渲染不同的游戏界面和处理视觉反馈
 */
class UIRenderer {
    constructor() {
        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            result: document.getElementById('result-screen')
        };
        
        this.elements = {
            currentQuestion: document.getElementById('current-question'),
            totalQuestions: document.getElementById('total-questions'),
            currentScore: document.getElementById('current-score'),
            accuracy: document.getElementById('accuracy'),
            questionText: document.getElementById('question-text'),
            answerButtons: document.querySelectorAll('.answer-btn'),
            finalScore: document.getElementById('final-score'),
            finalAccuracy: document.getElementById('final-accuracy'),
            correctCount: document.getElementById('correct-count'),
            incorrectCount: document.getElementById('incorrect-count')
        };
    }

    /**
     * 渲染开始界面
     */
    renderStartScreen() {
        this.hideAllScreens();
        this.screens.start.classList.add('active');
    }

    /**
     * 渲染游戏界面
     * @param {Object} question - 题目对象
     * @param {Object} progress - 进度信息
     * @param {Object} stats - 统计信息
     */
    renderGameScreen(question, progress, stats) {
        try {
            this.hideAllScreens();
            this.screens.game.classList.add('active');
            
            // 验证输入数据
            if (!question || !progress || !stats) {
                throw new Error('渲染游戏界面时缺少必要数据');
            }
            
            // 更新进度
            this.updateProgress(progress.current + 1, progress.total);
            
            // 更新统计信息
            this.updateStats(stats);
            
            // 显示题目
            this.displayQuestion(question);
            
            // 重置答案按钮状态
            this.resetAnswerButtons();
            
            console.log('游戏界面渲染完成');
        } catch (error) {
            console.error('渲染游戏界面时发生错误:', error);
            this.showErrorFeedback('界面渲染失败');
        }
    }

    /**
     * 渲染结果界面
     * @param {Object} stats - 最终统计信息
     */
    renderResultScreen(stats) {
        try {
            this.hideAllScreens();
            this.screens.result.classList.add('active');
            
            // 验证统计数据
            if (!stats) {
                throw new Error('缺少统计数据');
            }
            
            // 安全地更新结果显示
            if (this.elements.finalScore) {
                this.elements.finalScore.textContent = stats.score || 0;
            }
            if (this.elements.finalAccuracy) {
                this.elements.finalAccuracy.textContent = `${stats.accuracy || 0}%`;
            }
            if (this.elements.correctCount) {
                this.elements.correctCount.textContent = stats.correctCount || 0;
            }
            if (this.elements.incorrectCount) {
                this.elements.incorrectCount.textContent = stats.incorrectCount || 0;
            }
            
            console.log('结果界面渲染完成:', stats);
        } catch (error) {
            console.error('渲染结果界面时发生错误:', error);
            this.showErrorFeedback('结果显示失败');
        }
    }

    /**
     * 显示题目
     * @param {Object} question - 题目对象
     */
    displayQuestion(question) {
        let questionText;
        if (question.questionType === 'division') {
            questionText = `${question.dividend} ÷ ${question.divisor} = ?`;
        } else {
            questionText = `${question.multiplicand} × ${question.multiplier} = ?`;
        }

        this.elements.questionText.textContent = questionText;
        
        // 设置答案选项
        this.elements.answerButtons.forEach((button, index) => {
            button.textContent = question.options[index];
            button.dataset.answer = index;
        });
    }

    /**
     * 高亮正确答案
     * @param {number} correctIndex - 正确答案的索引
     * @param {number} selectedIndex - 用户选择的索引
     * @param {boolean} isLastQuestion - 是否是最后一题
     */
    highlightCorrectAnswer(correctIndex, selectedIndex, isLastQuestion = false) {
        // 禁用所有答案选项的交互 (需求 9.5)
        this.disableAnswerOptions();
        
        this.elements.answerButtons.forEach((button, index) => {
            if (index === correctIndex) {
                // 高亮正确答案 (需求 9.1)
                button.classList.add('correct');
                // 添加动画效果
                button.style.transform = 'scale(1.05)';
                button.style.transition = 'all 0.3s ease';
            } else if (index === selectedIndex && selectedIndex !== correctIndex) {
                // 高亮错误答案
                button.classList.add('incorrect');
                // 添加震动效果
                button.style.animation = 'shake 0.5s ease-in-out';
            } else {
                // 其他选项变暗
                button.style.opacity = '0.5';
            }
        });
        
        // 如果是最后一题且答错，立即显示"再来一次"按钮 (需求 9.3)
        if (isLastQuestion && selectedIndex !== correctIndex) {
            this.showRestartButtonEarly();
        }
    }

    /**
     * 更新进度显示
     * @param {number} current - 当前题目数
     * @param {number} total - 总题目数
     */
    updateProgress(current, total) {
        this.elements.currentQuestion.textContent = current;
        this.elements.totalQuestions.textContent = total;
    }

    /**
     * 更新统计信息显示
     * @param {Object} stats - 统计信息
     */
    updateStats(stats) {
        this.elements.currentScore.textContent = stats.score;
        this.elements.accuracy.textContent = `${stats.accuracy}%`;
    }

    /**
     * 重置答案按钮状态
     */
    resetAnswerButtons() {
        this.elements.answerButtons.forEach(button => {
            button.disabled = false;
            button.classList.remove('correct', 'incorrect');
            // 重置样式
            button.style.transform = '';
            button.style.transition = '';
            button.style.animation = '';
            button.style.opacity = '';
        });
    }

    /**
     * 禁用答案选项交互 (需求 9.5)
     */
    disableAnswerOptions() {
        this.elements.answerButtons.forEach(button => {
            button.disabled = true;
        });
    }

    /**
     * 启用答案选项交互
     */
    enableAnswerOptions() {
        this.elements.answerButtons.forEach(button => {
            button.disabled = false;
        });
    }

    /**
     * 显示正确答案反馈动画
     * @param {number} correctIndex - 正确答案索引
     */
    showCorrectAnswerFeedback(correctIndex) {
        const correctButton = this.elements.answerButtons[correctIndex];
        correctButton.classList.add('correct');
        
        // 添加成功动画效果
        correctButton.style.transform = 'scale(1.1)';
        correctButton.style.transition = 'all 0.3s ease';
        
        // 短暂延迟后恢复
        setTimeout(() => {
            correctButton.style.transform = 'scale(1.05)';
        }, 200);
    }

    /**
     * 显示错误答案反馈动画
     * @param {number} selectedIndex - 用户选择的索引
     */
    showIncorrectAnswerFeedback(selectedIndex) {
        const selectedButton = this.elements.answerButtons[selectedIndex];
        selectedButton.classList.add('incorrect');
        
        // 添加错误震动动画
        selectedButton.style.animation = 'shake 0.5s ease-in-out';
    }

    /**
     * 在最后一题答错时提前显示重新开始按钮 (需求 9.3)
     */
    showRestartButtonEarly() {
        // 这个方法会在GameController中调用，在2秒延迟后显示结果界面
        // 这里可以添加一些过渡动画
        console.log('准备显示重新开始按钮...');
    }

    /**
     * 添加视觉反馈延迟处理 (需求 9.2)
     * @param {Function} callback - 延迟后执行的回调函数
     * @param {number} delay - 延迟时间（毫秒）
     */
    addFeedbackDelay(callback, delay = 2000) {
        setTimeout(callback, delay);
    }

    /**
     * 隐藏所有界面
     */
    hideAllScreens() {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        document.body.classList.add('loading');
        console.log('Loading...');
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        document.body.classList.remove('loading');
        console.log('Loading complete');
    }

    /**
     * 显示成功反馈动画
     * @param {string} message - 成功消息
     */
    showSuccessFeedback(message = '答对了！') {
        this.showTemporaryMessage(message, 'success');
    }

    /**
     * 显示错误反馈动画
     * @param {string} message - 错误消息
     */
    showErrorFeedback(message = '答错了，正确答案已高亮显示') {
        this.showTemporaryMessage(message, 'error');
    }

    /**
     * 验证UI组件完整性
     * @returns {Object} 验证结果
     */
    validateUIComponents() {
        const validation = {
            isValid: true,
            missingElements: [],
            errors: []
        };
        
        try {
            // 检查屏幕元素
            Object.entries(this.screens).forEach(([name, element]) => {
                if (!element) {
                    validation.missingElements.push(`screen: ${name}`);
                    validation.isValid = false;
                }
            });
            
            // 检查UI元素
            Object.entries(this.elements).forEach(([name, element]) => {
                if (!element) {
                    validation.missingElements.push(`element: ${name}`);
                    validation.isValid = false;
                }
            });
            
            // 检查答案按钮
            if (this.elements.answerButtons.length !== 4) {
                validation.errors.push(`答案按钮数量不正确: ${this.elements.answerButtons.length}/4`);
                validation.isValid = false;
            }
            
        } catch (error) {
            validation.errors.push(`验证过程中发生错误: ${error.message}`);
            validation.isValid = false;
        }
        
        return validation;
    }

    /**
     * 显示临时消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型 ('success' 或 'error')
     */
    showTemporaryMessage(message, type = 'info') {
        // 创建消息元素
        const messageEl = document.createElement('div');
        messageEl.className = `feedback-message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
            animation: fadeIn 0.3s ease-in-out;
        `;
        
        document.body.appendChild(messageEl);
        
        // 2秒后移除消息
        setTimeout(() => {
            messageEl.style.animation = 'fadeOut 0.3s ease-in-out';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 2000);
    }
}