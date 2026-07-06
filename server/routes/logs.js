module.exports = function(pool) {
    const router = require('express').Router();

    // 查询日志（支持筛选）
    router.get('/', async (req, res, next) => {
        try {
            const { type, date, limit } = req.query;
            let sql = 'SELECT * FROM logs WHERE 1=1';
            const params = [];

            if (type && type !== 'all') {
                sql += ' AND type = ?';
                params.push(type);
            }
            if (date) {
                sql += ' AND DATE(timestamp) = ?';
                params.push(date);
            }

            sql += ' ORDER BY timestamp DESC';

            const maxLimit = parseInt(limit, 10) || 100;
            sql += ' LIMIT ?';
            params.push(Math.min(maxLimit, 1000));

            const [rows] = await pool.query(sql, params);

            // 格式化为前端兼容的格式
            const logs = rows.map(row => ({
                id: row.id,
                timestamp: new Date(row.timestamp).toLocaleString('zh-CN'),
                type: row.type,
                detail: row.detail,
                scoreChange: row.score_change,
                balanceAfter: row.balance_after
            }));

            res.json({ logs });
        } catch (err) {
            next(err);
        }
    });

    // 追加日志
    router.post('/', async (req, res, next) => {
        try {
            const { type, detail, scoreChange, balanceAfter } = req.body;
            if (!type || !detail) {
                return res.status(400).json({ error: true, message: '缺少必要字段' });
            }
            const [result] = await pool.execute(
                'INSERT INTO logs (type, detail, score_change, balance_after) VALUES (?, ?, ?, ?)',
                [type, detail, scoreChange, balanceAfter]
            );
            res.status(201).json({ id: result.insertId, timestamp: new Date().toLocaleString('zh-CN') });
        } catch (err) {
            next(err);
        }
    });

    // 清空日志
    router.delete('/', async (req, res, next) => {
        try {
            await pool.execute('TRUNCATE TABLE logs');
            res.json({ success: true });
        } catch (err) {
            next(err);
        }
    });

    return router;
};