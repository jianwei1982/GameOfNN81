/**
 * 界面渲染器类
 * 负责渲染不同的游戏界面和视觉反馈
 */
class UIRenderer {
    constructor(gameController) {
        this.gameController = gameController;

        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            result: document.getElementById('result-screen')
        };

        this.lotteryOverlay = document.getElementById('lottery-overlay');
        this.lotteryClosed = document.getElementById('lottery-closed');
        this.lotteryOpening = document.getElementById('lottery-opening');
        this.lotteryOpened = document.getElementById('lottery-opened');

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
            incorrectCount: document.getElementById('incorrect-count'),
            maxStreakCorrect: document.getElementById('max-streak-correct'),
            maxStreakIncorrect: document.getElementById('max-streak-incorrect'),
            startScore: document.getElementById('start-score'),
            streakType: document.getElementById('streak-type'),
            streakCount: document.getElementById('streak-count'),
            streakCoeff: document.getElementById('streak-coeff'),
            scoreChange: document.getElementById('score-change'),
            logBody: document.getElementById('log-body'),
            logList: document.getElementById('log-list'),
            logToggleIcon: document.getElementById('log-toggle-icon')
        };

        this.totalQuestionsDisplay = document.getElementById('total-questions');
    }

    /**
     * 渲染开始界面
     */
    renderStartScreen(totalScore = 0) {
        this.hideAllScreens();
        this.hideLotteryScreen(totalScore);
        this.screens.start.classList.add('active');

        if (this.elements.startScore) {
            this.elements.startScore.textContent = totalScore;
        }
    }

    /**
     * 更新开始界面的积分显示
     */
    updateStartScreenScore(totalScore) {
        if (this.elements.startScore) {
            this.elements.startScore.textContent = totalScore;
        }
    }

    /**
     * 渲染游戏界面
     */
    renderGameScreen(question, progress, stats, totalScore, streakInfo) {
        try {
            this.hideAllScreens();
            this.hideLotteryScreen();
            this.screens.game.classList.add('active');

            if (!question || !progress || !stats) {
                throw new Error('渲染游戏界面时缺少必要数据');
            }

            // 更新进度
            this.updateProgress(progress.current + 1, progress.total);

            // 更新统计信息
            this.updateGameStats(stats, totalScore);

            // 显示题目
            this.displayQuestion(question);

            // 重置答案按钮状态
            this.resetAnswerButtons();

            // 显示累计连击信息（如果有答题历史的话）
            this.elements.scoreChange.textContent = '';
            this.elements.scoreChange.className = 'score-change';
            if (streakInfo) {
                this.updateStreakDisplay(streakInfo);
            } else {
                this.elements.streakType.textContent = '连续';
                this.elements.streakCount.textContent = '0';
                this.elements.streakCoeff.textContent = '1.0';
            }

            // 更新日志
            this.refreshLogList();

            console.log('游戏界面渲染完成');
        } catch (error) {
            console.error('渲染游戏界面时发生错误:', error);
            this.showErrorFeedback('界面渲染失败');
        }
    }

    /**
     * 更新游戏统计信息
     */
    updateGameStats(stats, totalScore) {
        if (this.elements.currentScore) {
            this.elements.currentScore.textContent = totalScore;
        }
        if (this.elements.accuracy) {
            this.elements.accuracy.textContent = `${stats.accuracy}%`;
        }
    }

    /**
     * 更新连击显示
     */
    updateStreakDisplay(streakInfo) {
        const { streak, coefficient, isCorrect } = streakInfo;

        if (this.elements.streakCount) {
            this.elements.streakCount.textContent = streak;
        }
        if (this.elements.streakCoeff) {
            this.elements.streakCoeff.textContent = coefficient.toFixed(1);
        }
        if (this.elements.streakType) {
            if (streak === 0) {
                this.elements.streakType.textContent = '连续';
            } else if (isCorrect) {
                this.elements.streakType.textContent = '✅ 连对';
            } else {
                this.elements.streakType.textContent = '❌ 连错';
            }
        }
    }

    /**
     * 显示积分变化动画
     */
    showScoreChange(isCorrect, scoreChange, coefficient) {
        const el = this.elements.scoreChange;
        if (!el) return;

        if (isCorrect) {
            el.textContent = `+${scoreChange}`;
            el.className = 'score-change score-up';
        } else {
            el.textContent = scoreChange;
            el.className = 'score-change score-down';
        }

        // 清除动画
        el.style.animation = 'none';
        el.offsetHeight; // 触发回流
        el.style.animation = 'scorePop 0.8s ease-out forwards';

        setTimeout(() => {
            el.textContent = '';
            el.className = 'score-change';
        }, 1200);
    }

    /**
     * 渲染结果界面
     */
    renderResultScreen(stats) {
        try {
            this.hideAllScreens();
            this.screens.result.classList.add('active');

            if (!stats) {
                throw new Error('缺少统计数据');
            }

            if (this.elements.finalScore) {
                this.elements.finalScore.textContent = stats.totalScore || 0;
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
            if (this.elements.maxStreakCorrect) {
                this.elements.maxStreakCorrect.textContent = stats.maxCorrectStreak || 0;
            }
            if (this.elements.maxStreakIncorrect) {
                this.elements.maxStreakIncorrect.textContent = stats.maxWrongStreak || 0;
            }

            console.log('结果界面渲染完成:', stats);
        } catch (error) {
            console.error('渲染结果界面时发生错误:', error);
            this.showErrorFeedback('结果显示失败');
        }
    }

    /**
     * 更新结果界面的积分显示（抽奖后同步）
     */
    updateResultScreenScore(stats) {
        if (this.elements.finalScore) {
            this.elements.finalScore.textContent = stats.totalScore || 0;
        }
    }

    /**
     * 显示题目
     */
    displayQuestion(question) {
        const questionText = `${question.dividend} ÷ ${question.divisor} = ?`;
        this.elements.questionText.textContent = questionText;

        this.elements.answerButtons.forEach((button, index) => {
            button.textContent = question.options[index];
            button.dataset.answer = index;
        });
    }

    /**
     * 高亮正确答案
     */
    highlightCorrectAnswer(correctIndex, selectedIndex, isLastQuestion = false) {
        this.disableAnswerOptions();

        this.elements.answerButtons.forEach((button, index) => {
            if (index === correctIndex) {
                button.classList.add('correct');
                button.style.transform = 'scale(1.05)';
                button.style.transition = 'all 0.3s ease';
            } else if (index === selectedIndex && selectedIndex !== correctIndex) {
                button.classList.add('incorrect');
                button.style.animation = 'shake 0.5s ease-in-out';
            } else {
                button.style.opacity = '0.5';
            }
        });

        if (isLastQuestion && selectedIndex !== correctIndex) {
            this.showRestartButtonEarly();
        }
    }

    /**
     * 更新进度显示
     */
    updateProgress(current, total) {
        if (this.elements.currentQuestion) {
            this.elements.currentQuestion.textContent = current;
        }
        if (this.totalQuestionsDisplay) {
            this.totalQuestionsDisplay.textContent = total;
        }
    }

    /**
     * 重置答案按钮状态
     */
    resetAnswerButtons() {
        this.elements.answerButtons.forEach(button => {
            button.disabled = false;
            button.classList.remove('correct', 'incorrect');
            button.style.transform = '';
            button.style.transition = '';
            button.style.animation = '';
            button.style.opacity = '';
        });
    }

    /**
     * 禁用答案选项
     */
    disableAnswerOptions() {
        this.elements.answerButtons.forEach(button => {
            button.disabled = true;
        });
    }

    /**
     * 启用答案选项
     */
    enableAnswerOptions() {
        this.elements.answerButtons.forEach(button => {
            button.disabled = false;
        });
    }

    /**
     * 显示正确答案反馈
     */
    showCorrectAnswerFeedback(correctIndex) {
        const correctButton = this.elements.answerButtons[correctIndex];
        correctButton.classList.add('correct');
        correctButton.style.transform = 'scale(1.1)';
        correctButton.style.transition = 'all 0.3s ease';

        setTimeout(() => {
            correctButton.style.transform = 'scale(1.05)';
        }, 200);
    }

    /**
     * 显示错误答案反馈
     */
    showIncorrectAnswerFeedback(selectedIndex) {
        const selectedButton = this.elements.answerButtons[selectedIndex];
        selectedButton.classList.add('incorrect');
        selectedButton.style.animation = 'shake 0.5s ease-in-out';
    }

    showRestartButtonEarly() {
        console.log('准备显示重新开始按钮...');
    }

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
     * 显示抽红包界面（关闭状态）
     */
    showLotteryScreen(totalScore) {
        this.lotteryOverlay.style.display = 'flex';
        this.lotteryClosed.style.display = 'block';
        this.lotteryOpening.style.display = 'none';
        this.lotteryOpened.style.display = 'none';

        const balanceEl = document.getElementById('lottery-balance-before');
        if (balanceEl) balanceEl.textContent = totalScore;
    }

    /**
     * 开红包动画，显示抽奖结果
     */
    showLotteryResult(prize, totalScore) {
        // 切换到开红包阶段
        this.lotteryClosed.style.display = 'none';
        this.lotteryOpening.style.display = 'flex';
        this.lotteryOpened.style.display = 'none';

        const amountEl = document.getElementById('lottery-result-amount');
        if (amountEl) amountEl.textContent = prize.toFixed(2);

        // 开红包动画时长
        setTimeout(() => {
            // 切换到已打开阶段
            this.lotteryOpening.style.display = 'none';
            this.lotteryOpened.style.display = 'flex';

            const openedEl = document.getElementById('lottery-result-opened');
            if (openedEl) openedEl.textContent = prize.toFixed(2);

            const balanceAfter = document.getElementById('lottery-balance-after');
            if (balanceAfter) balanceAfter.textContent = totalScore;
        }, 1200);
    }

    /**
     * 积分不足提示
     */
    showLotteryError(message) {
        const container = document.getElementById('lottery-container');
        if (!container) return;

        // 闪现错误提示
        const errorEl = document.createElement('div');
        errorEl.className = 'lottery-error-msg';
        errorEl.textContent = message;
        errorEl.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            font-size: 1.1em;
            z-index: 10;
            text-align: center;
            animation: fadeIn 0.3s ease;
        `;
        container.appendChild(errorEl);

        setTimeout(() => {
            if (errorEl.parentNode) {
                errorEl.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    if (errorEl.parentNode) errorEl.parentNode.removeChild(errorEl);
                }, 300);
            }
        }, 2000);
    }

    /**
     * 关闭抽红包界面
     */
    hideLotteryScreen() {
        this.lotteryOverlay.style.display = 'none';
        this.lotteryClosed.style.display = 'block';
        this.lotteryOpening.style.display = 'none';
        this.lotteryOpened.style.display = 'none';
    }

    /**
     * 切换日志面板
     */
    toggleLogPanel() {
        if (!this.elements.logBody || !this.elements.logToggleIcon) return;

        const computedDisplay = window.getComputedStyle(this.elements.logBody).display;
        const isOpen = computedDisplay !== 'none';
        this.elements.logBody.style.display = isOpen ? 'none' : 'block';
        this.elements.logToggleIcon.textContent = isOpen ? '▶' : '▼';

        if (!isOpen) {
            this.refreshLogList();
        }
    }

    /**
     * 显示积分历史弹窗
     */
    showLogHistory(allLogs) {
        const overlay = document.getElementById('log-history-overlay');
        if (!overlay) return;

        overlay.style.display = 'flex';
        this.renderLogHistoryEntries(allLogs);
    }

    /**
     * 刷新积分历史显示（使用筛选后的数据）
     */
    refreshLogHistory(filteredLogs) {
        this.renderLogHistoryEntries(filteredLogs);
    }

    /**
     * 渲染积分历史记录条目
     */
    renderLogHistoryEntries(logs) {
        const list = document.getElementById('log-history-list');
        if (!list) return;

        list.innerHTML = '';

        if (!logs || logs.length === 0) {
            list.innerHTML = '<div class="log-empty">暂无记录</div>';
            return;
        }

        // 显示日志（最新在前）
        [...logs].reverse().forEach(log => {
            const row = document.createElement('div');
            row.className = `log-entry log-${log.type}`;

            const typeIcon = log.type === 'correct' ? '✅' :
                log.type === 'wrong' ? '❌' : '🎁';

            const changeClass = log.scoreChange > 0 ? 'log-change-up' :
                log.scoreChange < 0 ? 'log-change-down' : '';

            row.innerHTML = `
                <span class="log-time">${log.timestamp}</span>
                <span class="log-detail">${typeIcon} ${log.detail}</span>
                <span class="log-change ${changeClass}">${log.scoreChange > 0 ? '+' : ''}${log.scoreChange}</span>
                <span class="log-balance">余额: ${log.balanceAfter}</span>
            `;

            list.appendChild(row);
        });
    }

    /**
     * 隐藏积分历史弹窗
     */
    hideLogHistory() {
        const overlay = document.getElementById('log-history-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    /**
     * 刷新日志列表
     */
    refreshLogList() {
        if (!this.elements.logList || !this.gameController) return;

        const logs = this.gameController.getLogs() || [];
        this.elements.logList.innerHTML = '';

        if (logs.length === 0) {
            this.elements.logList.innerHTML = '<div class="log-empty">暂无记录</div>';
            return;
        }

        logs.forEach(log => {
            const row = document.createElement('div');
            row.className = `log-entry log-${log.type}`;

            const typeIcon = log.type === 'correct' ? '✅' :
                log.type === 'wrong' ? '❌' : '🎁';

            const changeClass = log.scoreChange > 0 ? 'log-change-up' :
                log.scoreChange < 0 ? 'log-change-down' : '';

            row.innerHTML = `
                <span class="log-time">${log.timestamp}</span>
                <span class="log-detail">${typeIcon} ${log.detail}</span>
                <span class="log-change ${changeClass}">${log.scoreChange > 0 ? '+' : ''}${log.scoreChange}</span>
                <span class="log-balance">余额: ${log.balanceAfter}</span>
            `;

            this.elements.logList.appendChild(row);
        });
    }

    showLoading() {
        document.body.classList.add('loading');
        console.log('Loading...');
    }

    hideLoading() {
        document.body.classList.remove('loading');
        console.log('Loading complete');
    }

    showSuccessFeedback(message = '答对了！') {
        this.showTemporaryMessage(message, 'success');
    }

    showErrorFeedback(message = '答错了，正确答案已高亮显示') {
        this.showTemporaryMessage(message, 'error');
    }

    /**
     * 验证UI组件完整性
     */
    validateUIComponents() {
        const validation = {
            isValid: true,
            missingElements: [],
            errors: []
        };

        try {
            Object.entries(this.screens).forEach(([name, element]) => {
                if (!element) {
                    validation.missingElements.push(`screen: ${name}`);
                    validation.isValid = false;
                }
            });

            Object.entries(this.elements).forEach(([name, element]) => {
                if (!element) {
                    validation.missingElements.push(`element: ${name}`);
                    validation.isValid = false;
                }
            });

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
     */
    showTemporaryMessage(message, type = 'info') {
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