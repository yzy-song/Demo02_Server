const { redisClient } = require('../config/database');

// 获取在线玩家列表
exports.onlinePlayers = async (req, res) => {
    try {
        const currentUsername = req.body.currentUsername;

        if (!currentUsername) {
            console.warn('No currentUsername provided in the request body');
            return res.status(400).json({ message: 'currentUsername is required' });
        }

        const userKeys = await redisClient.keys('user:*');
        const sessionIds = await Promise.all(userKeys.map((key) => redisClient.get(key)));

        const playerDataPromises = sessionIds.map((sessionId) => redisClient.get(`session:${sessionId}`));
        const playerDataList = await Promise.all(playerDataPromises);

        const players = playerDataList
            .map((data) => {
                try {
                    return JSON.parse(data);
                } catch {
                    return null;
                }
            })
            .filter((player) => player && player.username !== currentUsername);

        res.json({ players });
    } catch (err) {
        console.error('Error fetching online players:', err);
        res.status(500).json({ message: 'Failed to fetch online players' });
    }
};
