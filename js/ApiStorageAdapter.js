/**
 * API 存储适配器
 * 通过 REST API 调用后端 MySQL 存储
 */
class ApiStorageAdapter {
    constructor(baseUrl) {
        this.baseUrl = baseUrl || '/api';
    }

    async request(method, path, body) {
        const url = `${this.baseUrl}${path}`;
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (body !== undefined) {
            options.body = JSON.stringify(body);
        }
        const res = await fetch(url, options);
        const data = await res.json();
        if (!res.ok && data.error) {
            throw new Error(data.message || '请求失败');
        }
        return data;
    }

    async loadScore() {
        try {
            const data = await this.request('GET', '/score');
            return data.score;
        } catch (e) {
            console.warn('API 加载积分失败:', e);
            return 0;
        }
    }

    async saveScore(score) {
        try {
            await this.request('PUT', '/score', { score });
        } catch (e) {
            console.warn('API 保存积分失败:', e);
        }
    }

    async adjustScore(delta) {
        try {
            const data = await this.request('PATCH', '/score', { delta });
            return data.score;
        } catch (e) {
            console.warn('API 调整积分失败:', e);
            return 0;
        }
    }

    async loadLogs() {
        try {
            const data = await this.request('GET', '/logs?limit=1000');
            // 服务器返回倒序（最新在前），转为正序（最早在前）以保持缓存一致性
            return (data.logs || []).reverse();
        } catch (e) {
            console.warn('API 加载日志失败:', e);
            return [];
        }
    }

    async addLog(entry) {
        try {
            const data = await this.request('POST', '/logs', entry);
            return { ...entry, timestamp: data.timestamp, id: data.id };
        } catch (e) {
            console.warn('API 添加日志失败:', e);
            return entry;
        }
    }

    async drawLottery() {
        const res = await fetch(`${this.baseUrl}/lottery`, { method: 'POST' });
        const data = await res.json();
        return data;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiStorageAdapter;
}