/*
 * @Author: yzy
 * @Date: 2024-12-11 16:02:22
 * @LastEditors: yzy
 * @LastEditTime: 2024-12-12 14:54:20
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // 用于密码加密

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true }, // 用户名，必须唯一
    isGuest: { type: Boolean, default: false }, // 是否为访客
    password_hash: { type: String }, // 加密后的密码
    progress: { type: Object, default: {} }, // 进度数据（JSON 格式）
    logoutPosition: { type: Object, default: { x: 0, y: 0 } }, // 登出位置
    createdAt: { type: Date, default: Date.now }, // 创建时间
    updatedAt: { type: Date, default: Date.now }, // 更新时间
});

// 使用 pre 钩子在更新时自动设置 updatedAt 字段
UserSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

/**
 * 静态方法：根据用户名获取用户
 * @param {String} username 用户名
 * @returns {Promise<Object>} 返回用户文档或 null
 */
UserSchema.statics.getUserByUsername = async function (username) {
    return await this.findOne({ username });
};

/**
 * 静态方法：创建用户
 * @param {String} username 用户名
 * @param {Boolean} isGuest 是否为访客
 * @param {String} [password] 密码（仅适用于非访客用户）
 * @returns {Promise<Object>} 返回创建的用户文档
 */
UserSchema.statics.createUser = async function (username, isGuest, password = null) {
    let password_hash = null;

    // 如果不是访客，必须提供密码
    if (!isGuest) {
        if (!password) {
            throw new Error('Password is required for non-guest users');
        }
        // 加密密码
        const saltRounds = 10;
        password_hash = await bcrypt.hash(password, saltRounds);
    }

    // 创建用户
    const user = new this({
        username,
        isGuest,
        password_hash,
    });

    return await user.save();
};

// 导出模型
module.exports = mongoose.model('User', UserSchema);
