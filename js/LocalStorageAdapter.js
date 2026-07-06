/**
 * localStorage 存储适配器
 * 用于开发/测试环境，保持现有 localStorage 行为但暴露 async 接口
 */
class LocalStorageAdapter {
    constructor() {
        this.storageKey = 'nn81_score_data';
    }

    async loadScore() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) return JSON.parse(saved).score || 0;
        } catch (e) {
            console.warn('加载持久化积分失败:', e);
        }
        return 0;
    }

    async saveScore(score) {
        try {
            const saved = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
            saved.score = score;
            localStorage.setItem(this.storageKey, JSON.stringify(saved));
        } catch (e) {
            console.warn('保存积分失败:', e);
        }
    }

    async adjustScore(delta) {
        const score = await this.loadScore();
        const newScore = score + delta;
        await this.saveScore(newScore);
        return newScore;
    }

    async loadLogs() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) return JSON.parse(saved).logs || [];
        } catch (e) {
            console.warn('加载日志失败:', e);
        }
        return [];
    }

    async addLog(entry) {
        try {
            const saved = JSON.parse(localStorage.getItem(this.storageKey) || '{"score":0,"logs":[]}');
            const logEntry = {
                timestamp: new Date().toLocaleString('zh-CN'),
                ...entry
            };
            saved.logs.push(logEntry);
            localStorage.setItem(this.storageKey, JSON.stringify(saved));
            return logEntry;
        } catch (e) {
            console.warn('添加日志失败:', e);
            return entry;
        }
    }

    async clearLogs() {
        try {
            const saved = JSON.parse(localStorage.getItem(this.storageKey) || '{"score":0,"logs":[]}');
            saved.logs = [];
            localStorage.setItem(this.storageKey, JSON.stringify(saved));
        } catch (e) {
            console.warn('清空日志失败:', e);
        }
    }

    async drawLottery() {
        const saved = JSON.parse(localStorage.getItem(this.storageKey) || '{"score":0,"logs":[]}');
        const cost = 100;

        if (saved.score < cost) {
            return { success: false, prize: null, message: `积分不足，还需要${cost - saved.score}分` };
        }

        saved.score -= cost;

        const prizes = [
            { amount: 0.5, weight: 30 },
            { amount: 0.8, weight: 22 },
            { amount: 1.2, weight: 18 },
            { amount: 1.8, weight: 15 },
            { amount: 2.5, weight: 10 },
            { amount: 4.0, weight: 5 }
        ];
        const totalWeight = prizes.reduce((s, p) => s + p.weight, 0);
        let random = Math.random() * totalWeight;
        let prize = prizes[0].amount;
        for (const p of prizes) {
            random -= p.weight;
            if (random <= 0) { prize = p.amount; break; }
        }

        const entry = {
            timestamp: new Date().toLocaleString('zh-CN'),
            type: 'lottery',
            detail: `抽红包消耗${cost}积分，获得${prize}元`,
            scoreChange: -cost,
            balanceAfter: saved.score
        };
        saved.logs.push(entry);
        localStorage.setItem(this.storageKey, JSON.stringify(saved));

        return { success: true, prize, message: `恭喜获得${prize}元！`, balanceAfter: saved.score };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocalStorageAdapter;
}