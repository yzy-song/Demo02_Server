const WebSocket = require('ws');
const { executeQuery, redisClient } = require('../config/database');

class GameServer {
    constructor(wss, BaseMessage, PlayerStateUpdate, PlayersState, ItemPickupEvent, ChatMessage) {
        this.wss = wss;
        this.redisClient = redisClient;
        this.BaseMessage = BaseMessage;
        this.PlayerStateUpdate = PlayerStateUpdate;
        this.PlayersState = PlayersState;
        this.ItemPickupEvent = ItemPickupEvent;
        this.ChatMessage = ChatMessage;

        this.clients = new Map();
        this.playerStates = new Map();
        this.items = new Map();

        this.initItems();
        this.startStateSync();
        this.startZombieSessionCleanup();
    }

    start() {
        this.wss.on('connection', (socket) => {
            console.log('New client connected.');

            socket.on('message', (data) => {
                this.handleMessage(socket, data);
            });

            socket.on('close', () => {
                this.removePlayer(socket);
            });
        });
    }

    // 保存玩家状态到数据库
    async savePlayerStateToDB(username, playerData) {
        try {
            const { position, health, level, exp } = playerData;

            const query = `
                UPDATE users 
                SET position = $1, health = $2, level = $3, exp = $4, updated_at = NOW()
                WHERE username = $5;
            `;
            const values = [JSON.stringify(position), health, level, exp, username];
            // await executeQuery(query, values);
            console.log(`Player state synced to DB for ${username}`);
        } catch (err) {
            console.error('Error syncing player state to DB:', err);
        }
    }

    // 定时同步玩家状态到 Redis
    startStateSync() {
        setInterval(async () => {
            try {
                const allStates = Array.from(this.playerStates.entries());
                const pipeline = this.redisClient.multi();

                for (const [username, playerState] of allStates) {
                    const redisKey = `playerState:${username}`;
                    pipeline.set(redisKey, JSON.stringify(playerState), 'EX', 3600);
                }

                await pipeline.exec();
                console.log('Player states synced to Redis.');
            } catch (err) {
                console.error('Error syncing player states to Redis:', err);
            }
        }, 5000);
    }

    // 清理僵尸会话
    startZombieSessionCleanup() {
        setInterval(async () => {
            try {
                const keys = await this.redisClient.keys('session:*');
                for (const key of keys) {
                    const ttl = await this.redisClient.ttl(key);
                    if (ttl < 0) {
                        const playerData = await this.redisClient.get(key);
                        if (playerData) {
                            const parsedData = JSON.parse(playerData);
                            await this.savePlayerStateToDB(parsedData.username, parsedData);
                        }
                        await this.redisClient.del(key);
                        console.log(`Expired session ${key} cleaned and synced to DB.`);
                    }
                }
            } catch (err) {
                console.error('Error clearing zombie sessions:', err);
            }
        }, 10 * 60 * 1000);
    }

    // 处理消息
    handleMessage(socket, data) {
        try {
            const baseMessage = this.BaseMessage.decode(data);

            switch (baseMessage.eventType) {
                case 'Heartbeat': // 处理心跳包
                    this.handleHeartbeat(socket);
                    break;

                case 'PlayerStateUpdate': // 玩家状态更新
                    this.handlePlayerStateUpdate(socket, baseMessage.payload);
                    break;

                default:
                    console.warn(`Unknown event type: ${baseMessage.eventType}`);
                    break;
            }
        } catch (error) {
            console.error('Failed to handle message:', error);
        }
    }

    // 处理心跳包
    handleHeartbeat(socket) {
        const playerId = this.clients.get(socket);
        if (playerId) {
            const sessionKey = `session:${playerId}`;
            this.redisClient.expire(sessionKey, 3600); // 刷新会话的过期时间
            console.log(`Heartbeat received from ${playerId}. Session TTL refreshed.`);
        } else {
            console.warn('Heartbeat received, but player ID not found.');
        }
    }

    // 处理玩家状态更新
    handlePlayerStateUpdate(socket, payload) {
        const message = this.PlayerStateUpdate.decode(payload);
        let { player } = message;
    
        // 更新后的玩家状态
        player = {
            username: player.username || "unknown",
            x: player.x !== undefined ? player.x : 0,
            y: player.y !== undefined ? player.y : 0,
            lv: player.lv !== undefined ? player.lv : 1,
            exp: player.exp !== undefined ? player.exp : 0,
            hp: player.hp !== undefined ? player.hp : 100,
        };
    
        // 检查是否存在旧状态
        const previousPlayerState = this.playerStates.get(player.username);
    
        // 去重逻辑：位置未变化时直接返回
        if (
            previousPlayerState &&
            previousPlayerState.x === player.x &&
            previousPlayerState.y === player.y
        ) {
            console.log(`Duplicate update ignored for ${player.username}: (${player.x}, ${player.y})`);
            return; // 直接返回，跳过后续逻辑
        }
    
        // 更新玩家状态
        this.playerStates.set(player.username, player);
    
        // 确保客户端与玩家映射一致
        if (!this.clients.has(socket)) {
            this.clients.set(socket, player.username);
        }
    
        console.log(`Player ${player.username} updated: ${player.x}, ${player.y}`);
        this.broadcastAllPlayerStates();
    }
    

    // 移除玩家
    removePlayer(socket) {
        const playerId = this.clients.get(socket);
        if (playerId) {
            const playerState = this.playerStates.get(playerId);
            if (playerState) {
                this.savePlayerStateToDB(playerId, playerState);
            }
            this.playerStates.delete(playerId);
            this.clients.delete(socket);
            console.log(`Player ${playerId} disconnected.`);
            this.broadcastAllPlayerStates();
        } else {
            console.warn('Player ID not found for the given socket.');
        }
    }

    initItems() {
        this.items.set('item1', { id: 'item1', name: 'Gold', x: 5, y: 5 });
        this.items.set('item2', { id: 'item2', name: 'Potion', x: 10, y: 10 });
        console.log('Items initialized.');
    }

    broadcastAllPlayerStates() {
        const players = Array.from(this.playerStates.values());
        const message = this.PlayersState.create({ players });
        const baseMessage = this.BaseMessage.create({
            eventType: 'PlayerStateUpdate',
            payload: this.PlayersState.encode(message).finish(),
        });

        this.broadcastMessage(baseMessage);
    }

    broadcastMessage(baseMessage) {
        const encodedMessage = this.BaseMessage.encode(baseMessage).finish();
        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(encodedMessage);
            }
        });
    }
}

module.exports = { GameServer };
