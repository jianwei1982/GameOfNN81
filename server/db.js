const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'game_of_nn81',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    charset: 'utf8mb4'
});

async function initializeDatabase() {
    const conn = await pool.getConnection();
    try {
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS score (
                id    INT PRIMARY KEY DEFAULT 1,
                score INT NOT NULL DEFAULT 0,
                CHECK (id = 1)
            )
        `);
        await conn.execute(`
            INSERT IGNORE INTO score (id, score) VALUES (1, 0)
        `);
        await conn.execute(`
            CREATE TABLE IF NOT EXISTS logs (
                id            INT AUTO_INCREMENT PRIMARY KEY,
                timestamp     DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                type          ENUM('correct','wrong','lottery') NOT NULL,
                detail        VARCHAR(255) NOT NULL,
                score_change  INT NOT NULL,
                balance_after INT NOT NULL,
                INDEX idx_timestamp (timestamp DESC),
                INDEX idx_type (type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('数据库表已就绪');
    } finally {
        conn.release();
    }
}

module.exports = { pool, initializeDatabase };