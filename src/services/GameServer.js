const WebSocket = require('ws');

class GameServer {
    constructor(wss, BaseMessage, PlayerStateUpdate, PlayersState, ItemPickupEvent, ChatMessage) {
        this.wss = wss;
        this.BaseMessage = BaseMessage; // 基础消息
        this.PlayerStateUpdate = PlayerStateUpdate; // 玩家状态更新
        this.PlayersState = PlayersState; // 所有玩家状态
        this.ItemPickupEvent = ItemPickupEvent; // 道具拾取事件
        this.ChatMessage = ChatMessage; // 聊天消息

        this.clients = new Map(); // WebSocket 客户端映射
        this.playerStates = new Map(); // 玩家状态存储
        this.items = new Map(); // 道具状态存储
        this.initItems(); // 初始化道具
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
        console.log(`Received data length: ${data.length}`);
        try {
            const baseMessage = this.BaseMessage.decode(data); // 解码 BaseMessage
            console.log(`Event Type: ${baseMessage.eventType}`);
            switch (baseMessage.eventType) {
                case 'PlayerStateUpdate':
                    this.handlePlayerStateUpdate(socket, baseMessage.payload);
                    break;

                case 'ItemPickup':
                    this.handleItemPickup(socket, baseMessage.payload);
                    break;

                case 'ChatMessage':
                    this.handleChatMessage(socket, baseMessage.payload);
                    break;

                default:
                    console.warn(`Unknown event type: ${baseMessage.eventType}`);
                    break;
            }
        } catch (error) {
            console.error('Failed to handle message:', error);
        }
    }

    // 处理玩家状态更新
    handlePlayerStateUpdate(socket, payload) {
        const message = this.PlayerStateUpdate.decode(payload);
        const { player } = message;

        this.playerStates.set(player.username, player);
        console.log(`Player state updated: ${player.username}`);
        this.broadcastAllPlayerStates();
    }

    // 处理道具拾取事件
    handleItemPickup(socket, payload) {
        const event = this.ItemPickupEvent.decode(payload);

        if (this.items.has(event.itemId)) {
            this.items.delete(event.itemId);
            console.log(`Item ${event.itemId} picked up by ${event.playerId}`);

            // 广播道具拾取事件
            const baseMessage = this.BaseMessage.create({
                eventType: 'ItemPickup',
                payload: this.ItemPickupEvent.encode(event).finish(),
            });
            this.broadcastMessage(baseMessage);
        } else {
            console.warn(`Item ${event.itemId} already picked up or doesn't exist.`);
        }
    }

    // 处理聊天消息
    handleChatMessage(socket, payload) {
        const chatMessage = this.ChatMessage.decode(payload);
        console.log(`Chat from ${chatMessage.sender}: ${chatMessage.content}`);

        // 广播聊天消息
        const baseMessage = this.BaseMessage.create({
            eventType: 'ChatMessage',
            payload: this.ChatMessage.encode(chatMessage).finish(),
        });
        this.broadcastMessage(baseMessage);
    }

    // 移除玩家
    removePlayer(socket) {
        const playerId = this.clients.get(socket);
        if (playerId) {
            this.playerStates.delete(playerId);
            this.clients.delete(socket);
            console.log(`Player ${playerId} disconnected.`);

            this.broadcastAllPlayerStates();
        }
    }

    // 初始化道具
    initItems() {
        this.items.set('item1', { id: 'item1', name: 'Gold', x: 5, y: 5 });
        this.items.set('item2', { id: 'item2', name: 'Potion', x: 10, y: 10 });
        console.log('Items initialized.');
    }

    // 广播所有玩家状态
    broadcastAllPlayerStates() {
        const players = Array.from(this.playerStates.values());
        const message = this.PlayersState.create({ players });
        const baseMessage = this.BaseMessage.create({
            eventType: 'PlayerStateUpdate',
            payload: this.PlayersState.encode(message).finish(),
        });
        console.log(`Sending BaseMessage: ${JSON.stringify(baseMessage)}`);
        console.log(`Payload length: ${baseMessage.payload.length}`);

        this.broadcastMessage(baseMessage);
    }

    // 广播消息
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
