/*
 * @Author: yzy
 * @Date: 2024-12-11
 * @LastEditors: yzy
 * @LastEditTime: 2024-12-12 15:20:06
 */
const db = require('../config/PostgreSQLDB').pool; // 使用连接池

// 查询所有任务
const getAllTasks = async () => {
    const query = `SELECT * FROM tasks`;
    try {
        const result = await db.query(query);
        return result.rows; // 返回所有任务
    } catch (err) {
        console.error('Error fetching tasks:', err);
        throw new Error('Database query error');
    }
};

// 创建任务
const createTask = async (name, description, reward) => {
    const query = `
        INSERT INTO tasks (name, description, reward)
        VALUES ($1, $2, $3)
        RETURNING *;
    `;
    const values = [name, description, reward];
    try {
        const result = await db.query(query, values);
        return result.rows[0]; // 返回新创建的任务
    } catch (err) {
        console.error('Error creating task:', err);
        throw new Error('Database query error');
    }
};

// 分配任务给用户
const assignTaskToUser = async (userId, taskId) => {
    const query = `
        INSERT INTO user_tasks (user_id, task_id, status, start_time)
        VALUES ($1, $2, 'in_progress', CURRENT_TIMESTAMP)
        RETURNING *;
    `;
    const values = [userId, taskId];
    try {
        const result = await db.query(query, values);
        return result.rows[0]; // 返回分配的任务记录
    } catch (err) {
        console.error('Error assigning task to user:', err);
        throw new Error('Database query error');
    }
};

module.exports = {
    getAllTasks,
    createTask,
    assignTaskToUser,
};
