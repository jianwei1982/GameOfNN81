module.exports = function(pool) {
    const router = require('express').Router();

    // 获取积分
    router.get('/', async (req, res, next) => {
        try {
            const [rows] = await pool.execute('SELECT score FROM score WHERE id = 1');
            const score = rows.length > 0 ? rows[0].score : 0;
            res.json({ score });
        } catch (err) {
            next(err);
        }
    });

    // 设置积分
    router.put('/', async (req, res, next) => {
        try {
            const { score } = req.body;
            if (typeof score !== 'number') {
                return res.status(400).json({ error: true, message: 'score 必须是数字' });
            }
            await pool.execute('UPDATE score SET score = ? WHERE id = 1', [score]);
            res.json({ success: true });
        } catch (err) {
            next(err);
        }
    });

    // 按差值增减积分
    router.patch('/', async (req, res, next) => {
        try {
            const { delta } = req.body;
            if (typeof delta !== 'number') {
                return res.status(400).json({ error: true, message: 'delta 必须是数字' });
            }
            await pool.execute('UPDATE score SET score = score + ? WHERE id = 1', [delta]);
            const [rows] = await pool.execute('SELECT score FROM score WHERE id = 1');
            res.json({ success: true, score: rows[0].score });
        } catch (err) {
            next(err);
        }
    });

    return router;
};