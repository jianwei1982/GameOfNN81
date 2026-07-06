module.exports = function(err, req, res, next) {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}:`, err.message);

    if (err.code === 'INSUFFICIENT_FUNDS') {
        return res.status(400).json({ error: true, message: err.message, code: err.code });
    }

    res.status(500).json({ error: true, message: '服务内部错误，请稍后重试' });
};