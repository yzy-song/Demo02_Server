/*
 * @Author: yzy
 * @Date: 2024-12-11 16:02:22
 * @LastEditors: yzy
 * @LastEditTime: 2024-12-12 14:09:06
 */
const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Demo02',
    password: '123456',
    port: 5432,
});

// 封装连接函数
const connectPostgres = async () => {
    try {
        const client = await pool.connect();
        console.log('PostgreSQL connected');
        client.release(); // 释放连接
    } catch (err) {
        console.error('PostgreSQL connection error:', err.stack);
        process.exit(1); // 退出进程
    }
};

module.exports = { pool, connectPostgres };
