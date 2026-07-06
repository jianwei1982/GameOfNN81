module.exports = function(pool) {
    const router = require('express').Router();

    const PRIZES = [
        { amount: 0.5, weight: 30 },
        { amount: 0.8, weight: 22 },
        { amount: 1.2, weight: 18 },
        { amount: 1.8, weight: 15 },
        { amount: 2.5, weight: 10 },
        { amount: 4.0, weight: 5 }
    ];
    const TOTAL_WEIGHT = PRIZES.reduce((s, p) => s + p.weight, 0);
    const COST = 100;

    // 抽奖（原子操作：验证+扣分+写日志）
    router.post('/', async (req, res, next) => {
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            // 读取当前积分
            const [rows] = await conn.execute('SELECT score FROM score WHERE id = 1');
            const currentScore = rows.length > 0 ? rows[0].score : 0;

            if (currentScore < COST) {
                await conn.rollback();
                return res.status(400).json({
                    success: false,
                    message: `积分不足，还需要${COST - currentScore}分`
                });
            }

            // 扣分
            await conn.execute('UPDATE score SET score = score - ? WHERE id = 1', [COST]);
            const balanceAfter = currentScore - COST;

            // 计算奖品
            let random = Math.random() * TOTAL_WEIGHT;
            let prize = PRIZES[0].amount;
            for (const p of PRIZES) {
                random -= p.weight;
                if (random <= 0) { prize = p.amount; break; }
            }

            // 写日志
            const detail = `抽红包消耗${COST}积分，获得${prize}元`;
            await conn.execute(
                'INSERT INTO logs (type, detail, score_change, balance_after) VALUES (?, ?, ?, ?)',
                ['lottery', detail, -COST, balanceAfter]
            );

            await conn.commit();

            res.json({ success: true, prize, message: `恭喜获得${prize}元！`, balanceAfter });
        } catch (err) {
            await conn.rollback().catch(() => {});
            next(err);
        } finally {
            conn.release();
        }
    });

    return router;
};