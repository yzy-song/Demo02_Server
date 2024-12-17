/*
 * @Author: yzy
 * @Date: 2024-12-16 10:48:58
 * @LastEditors: yzy
 * @LastEditTime: 2024-12-17 12:51:04
 */
const { Pool } = require('pg');
const Redis = require('ioredis');

// PostgreSQL connection pool
const pgPool = new Pool({
    user: process.env.PG_USER || 'postgres',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DATABASE || 'Demo02',
    password: process.env.PG_PASSWORD || '123456',
    port: process.env.PG_PORT || 5432,
});

// Redis client
const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'redis-18098.c277.us-east-1-3.ec2.redns.redis-cloud.com',
    port: process.env.REDIS_PORT || 18098,
    password: process.env.REDIS_PASSWORD || 'KicOY5a53Pfxw2yEqnhPVgaFCBnHba9T',
});

async function initDatabase() {
    try {
        // Test PostgreSQL connection
        const pgClient = await pgPool.connect();
        console.log('Connected to PostgreSQL database.');
        pgClient.release();

        // Test Redis connection
        await redisClient.ping();
        console.log('Connected to Redis database.');
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1); // Exit if database initialization fails
    }
}
const executeQuery = async (query, params = []) => {
    const client = await pgPool.connect();
    try {
        const result = await client.query(query, params);
        return result;
    } catch (err) {
        console.error('Database query error:', err);
        throw err;
    } finally {
        client.release();
    }
};

module.exports = { pgPool, redisClient, executeQuery };


module.exports = {
    pgPool,
    redisClient,
    executeQuery,
    initDatabase,
};
