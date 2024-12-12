/*
 * @Author: yzy
 * @Date: 2024-12-11 19:23:07
 * @LastEditors: yzy
 * @LastEditTime: 2024-12-11 19:23:23
 */
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    questId: { type: String, required: true },
    playerId: { type: String, required: true }, // 与 PostgreSQL 中的用户表关联
    status: { type: String, default: 'pending' },
    rewardClaimed: { type: Boolean, default: false },
    details: { type: Object, default: {} },
});

module.exports = mongoose.model('Task', TaskSchema);
