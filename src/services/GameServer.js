const WebSocket = require('ws');

class GameServer {
    constructor(wss, PlayerStateUpdate, PlayersState) {
        this.wss = wss;
        this.PlayerStateUpdate = PlayerStateUpdate;
        this.PlayersState = PlayersState;
        this.clients = new Map(); // WebSocket 客户端映射
        this.playerStates = new Map(); // 玩家状态存储
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

    handleMessage(socket, data) {
        try {
            const message = this.PlayerStateUpdate.decode(data); // 解码消息
            const { player, eventType } = message;

            if (eventType === 'update') {
                this.syncPlayerState(player);
            } else if (eventType === 'disconnect') {
                this.removePlayer(socket);
            }
        } catch (error) {
            console.error('Failed to decode message:', error);
        }
    }

    syncPlayerState(player) {
        this.playerStates.set(player.username, player);

        console.log(`Player state updated: ${player.username}`);
        this.broadcastAllPlayerStates(); // 广播所有玩家状态
    }

    removePlayer(socket) {
        const playerId = this.clients.get(socket);
        if (playerId) {
            this.playerStates.delete(playerId);
            this.clients.delete(socket);
            this.broadcastAllPlayerStates();
        }
    }

    broadcastAllPlayerStates() {
        const players = Array.from(this.playerStates.values());
        const message = this.PlayersState.create({ players });
        const encodedMessage = this.PlayersState.encode(message).finish();

        this.wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(encodedMessage);
            }
        });
    }
}

module.exports = { GameServer };
