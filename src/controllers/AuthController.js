const { pgPool, redisClient, executeQuery } = require('../config/database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { GameServer } = require('../services/GameServer');

// User Login
exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const client = await pgPool.connect();
        const userResult = await executeQuery(
            'SELECT id, username, is_guest, progress, logout_position, level, exp, hp, password_hash FROM users WHERE username = $1',
            [username]
        );
        client.release();

        if (userResult.rowCount === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check for existing session
        const existingSessionId = await redisClient.get(`user:${username}`);
        if (existingSessionId) {
            // Update the existing session
            await redisClient.set(`session:${existingSessionId}`, JSON.stringify(user), 'EX', 3600); // 1 hour TTL
            return res.json({
                message: 'Login successful',
                sessionId: existingSessionId,
                userName:username,
                level: user.level,
                exp: user.exp,
                health: user.health,
                position: user.logout_position, // 返回玩家位置
            });
        }

        // Create a new session
        const sessionId = uuidv4();
        await redisClient.set(`session:${sessionId}`, JSON.stringify(user), 'EX', 3600); // 1 hour TTL
        await redisClient.set(`user:${username}`, sessionId, 'EX', 3600); // Link username to sessionId

        return res.json({
            message: 'Login successful',
            sessionId,
            userName:username,
            level: user.level,
            exp: user.exp,
            position: user.logout_position, // 返回玩家位置
        });
    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

exports.guestLogin = async (req, res) => {
    try {
        const client = await pgPool.connect();
        const guestId = uuidv4();
        const username = `Guest${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`;

        const initialPosition = { x: 0, y: 0 }; // 初始位置

        const insertGuestQuery = `
            INSERT INTO users (id, username, is_guest, progress, logout_position, level, exp, hp, password_hash)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id, username, is_guest, progress, logout_position, level, exp, hp;
        `;

        const guestUser = await executeQuery(insertGuestQuery, [
            guestId,
            username,
            true,
            '{}', // 初始进度
            JSON.stringify(initialPosition), // 初始位置
            1,    // 初始等级
            0,    // 初始经验值
            100,  // 初始生命值
            null, // 游客无密码
        ]);
        client.release();

        const user = guestUser.rows[0];

        // Create a new session
        const sessionId = uuidv4();
        await redisClient.set(`session:${sessionId}`, JSON.stringify(user), 'EX', 3600); // 1 hour TTL
        await redisClient.set(`user:${username}`, sessionId, 'EX', 3600);

        return res.json({
            message: 'Guest login successful',
            sessionId,
            userName:username,
            level: user.level,
            exp: user.exp,
            position: user.logout_position, // 返回玩家位置
        });
    } catch (err) {
        console.error('Error during guest login:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


// Logout
exports.logout = async (req, res) => {
    const { sessionId } = req.body;
    try {
        const sessionKey = `session:${sessionId}`;
        const sessionData = await redisClient.get(sessionKey);

        if (!sessionData) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const user = JSON.parse(sessionData);
        await redisClient.del(sessionKey);
        await redisClient.del(`user:${user.username}`);
        await redisClient.del(`playerState:${user.username}`);

        const userName = user.username;
        const query = `
            UPDATE users
            SET updated_at = NOW(),
                logout_position = $1
            WHERE username = $2
        `;
        const logoutPosition = { x: user.x, y: user.y };
        await executeQuery(query, [logoutPosition, userName]);
        return res.json({ message: 'Logout successful' });
    } catch (err) {
        console.error('Error during logout:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

