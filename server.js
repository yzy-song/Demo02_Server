/*
 * @Author: yzy
 * @Date: 2024-12-11 16:02:22
 * @LastEditors: yzy
 * @LastEditTime: 2024-12-17 12:45:55
 */
const WebSocket = require('ws');
const protobuf = require('protobufjs');
const express = require('express');
const { initDatabase } = require('./src/config/database');
const { GameServer } = require('./src/services/GameServer');
const routes = require('./src/routes/Routes');

// Load protobuf definitions
const protoRoot = protobuf.loadSync('./src/proto/GameProto.proto');
const BaseMessage = protoRoot.lookupType('GameProtos.BaseMessage');
const PlayerStateUpdate = protoRoot.lookupType('GameProtos.PlayerStateUpdate');
const PlayersState = protoRoot.lookupType('GameProtos.PlayersState');
const ItemPickupEvent = protoRoot.lookupType('GameProtos.ItemPickupEvent');
const ChatMessage = protoRoot.lookupType('GameProtos.ChatMessage');

// Initialize Express server
const app = express();
const port = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));
app.use("/api", routes);

// Initialize database
initDatabase();

// Start HTTP server
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

// Initialize WebSocket server
const wss = new WebSocket.Server({ server });
const gameServer = new GameServer(
    wss,
    BaseMessage,
    PlayerStateUpdate,
    PlayersState,
    ItemPickupEvent,
    ChatMessage
);

gameServer.start();
