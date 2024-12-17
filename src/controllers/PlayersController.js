/*
 * @Author: yzy
 * @Date: 2024-12-14 01:21:58
 * @LastEditors: yzy
 * @LastEditTime: 2024-12-16 14:11:38
 */
const { redisClient } = require('../config/database');

// 获取在线玩家列表
exports.onlinePlayers = async (req, res) => {
    try {
        const currentUsername = req.body.currentUsername;

        // 检查 currentUsername 是否存在
        if (!currentUsername) {
            console.warn('No currentUsername provided in the request body');
            return res.status(400).json({ message: 'currentUsername is required' });
        }

        console.log('Current Username:', currentUsername);

        // 获取所有用户名映射键
        const userKeys = await redisClient.keys('user:*');
        console.log('User Keys:', userKeys);

        // 获取所有会话 ID
        const sessionIds = await Promise.all(
            userKeys.map((key) => redisClient.get(key))
        );
        console.log('Session IDs:', sessionIds);

        // 获取所有玩家数据
        const playerDataPromises = sessionIds.map((sessionId) =>
            redisClient.get(`session:${sessionId}`)
        );
        const playerDataList = await Promise.all(playerDataPromises);

        // 解析并过滤玩家数据过滤当前玩家和无效数据
        const players = playerDataList
            .map((data) => {
                try {
                    return JSON.parse(data);
                } catch (error) {
                    console.error('Failed to parse player data:', data, error);
                    return null;
                }
            })
            .filter(
                (player) => player && player.username !== currentUsername
            ); 

        console.log('Filtered Players:', players);

        // 添加 level 和 exp 的日志输出
        players.forEach((player) => {
            console.log(`Player: ${player.username}, Level: ${player.level}, Exp: ${player.exp}`);
        });

        res.json({ players });
        console.log('Response Sent Successfully');

    } catch (err) {
        console.error('Error in onlinePlayers function:', err);
        res.status(500).json({ message: 'Failed to sync players' });
    }
};


exports.syncPlayerState = async (req, res) => {
    const { sessionId, position, health, level, exp, username } = req.body;

    if (!sessionId) {
        return res.status(400).json({ message: 'sessionId is required' });
    }

    try {
        // 从 Redis 获取玩家数据
        const playerData = await redisClient.get(`session:${sessionId}`);
        if (!playerData) {
            return res.status(404).json({ message: 'Player session not found' });
        }

        // 解析玩家数据并更新
        const player = JSON.parse(playerData);
        player.position = position || player.position;
        player.health = health ?? player.health;
        player.level = level ?? player.level;
        player.exp = exp ?? player.exp;
        player.username = username ?? player.username;

        // 更新 Redis缓存
        await redisClient.set(`session:${sessionId}`, JSON.stringify(player), 'EX', 3600);

        console.log(`Player state updated: ${sessionId}`);
        // 返回更新后的玩家数据，包括 username 和 sessionId
        res.json({
            message: 'Player state updated successfully',
            username: player.username,
            sessionId: sessionId,
            position: player.position,
            health: player.health,
            level: player.level,
            exp: player.exp
        });
    } catch (err) {
        console.error('Error syncing player state:', err);
        res.status(500).json({ message: 'Failed to sync player state' });
    }
};


// 心跳包
exports.heartbeat = async (req, res) => {
    const { sessionId } = req.body;

    if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
    }

    const sessionKey = `session:${sessionId}`;
    const sessionExists = await redisClient.exists(sessionKey);

    if (sessionExists) {
        await redisClient.expire(sessionKey, 3600); // 刷新 TTL 为 1 小时
        res.json({ message: 'Heartbeat received, session updated.' });
    } else {
        res.status(404).json({ message: 'Session not found.' });
    }
};

// 僵尸会话清理
const clearZombieSessions = async () => {
    try {
        const keys = await redisClient.keys('session:*');

        for (const key of keys) {
            const ttl = await redisClient.ttl(key);
            if (ttl < 0) {
                console.log(`Deleting expired session: ${key}`);
                await redisClient.del(key);
            }
        }
    } catch (err) {
        console.error('Error clearing zombie sessions:', err);
    }
};

// 每隔 10 分钟清理一次
setInterval(clearZombieSessions, 10 * 60 * 1000);
