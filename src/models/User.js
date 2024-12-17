/*
 * @Author: yzy
 * @Date: 2024-12-11
 * @LastEditors: yzy
 * @LastEditTime: 2024-12-12 15:18:39
 */
const db = require('../config/PostgreSQLDB').pool; // 使用连接池

// 查询用户通过用户名
const getUserByUsername = async (username) => {
    const query = `SELECT * FROM users WHERE username = $1`;
    const values = [username];
    try {
        const result = await db.query(query, values);
        return result.rows[0] || null; // 如果没找到用户，返回 null
    } catch (err) {
        console.error('Error fetching user by username:', err);
        throw new Error('Database query error');
    }
};

// 创建用户
const createUser = async (username, isGuest, passwordHash = null) => {
    const query = `
        INSERT INTO users (username, is_guest, password_hash)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [username, isGuest, passwordHash];
    try {
        const result = await db.query(query, values);
        return result.rows[0]; // 返回新创建的用户
    } catch (err) {
        console.error('Error creating user:', err);
        throw new Error('Database query error');
    }
};

module.exports = {
    getUserByUsername,
    createUser,
};
