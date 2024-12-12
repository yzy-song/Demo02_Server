/*
 * @Author: yzy
 * @Date: 2024-12-11 19:24:34
 * @LastEditors: yzy
 * @LastEditTime: 2024-12-12 14:56:21
 */
const User = require('../models/User');
const Task = require('../models/Task');
const { sendSuccess, sendError } = require('../utils/ResponseHelper');

// 用户登录逻辑
const login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    try {
        const user = await User.getUserByUsername(username);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordMatch) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        return res.status(200).json({ success: true, message: 'Login successful', data: { user } });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ success: false, message: 'Error logging in', error: error.message });
    }
};


// 游客登录逻辑
const guestLogin = async (req, res) => {
    try {
        const guestUsername = `Guest${Date.now()}`;
        const user = await User.createUser(guestUsername, true);

        return res.status(200).json({ success: true, message: 'Guest login successful', data: { user } });
    } catch (error) {
        console.error('Error during guest login:', error);
        return res.status(500).json({ success: false, message: 'Error during guest login', error: error.message });
    }
};


module.exports = {
    login,
    guestLogin,
};
