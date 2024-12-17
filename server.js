/*
 * @Author: yzy
 * @Date: 2024-12-11 16:02:22
 * @LastEditors: yzy
 * @LastEditTime: 2024-12-16 21:48:18
 */
const WebSocket = require('ws');
const protobuf = require('protobufjs');
const express = require('express');
const { initDatabase } = require('./src/config/database');
const { GameServer } = require('./src/services/GameServer');
const routes = require('./src/routes/Routes');

// Load protobuf definitions
const protoRoot = protobuf.loadSync('./src/proto/GameProto.proto');
const PlayerStateUpdate = protoRoot.lookupType('PlayerStateUpdate');
const PlayersState = protoRoot.lookupType('PlayersState');

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
const gameServer = new GameServer(wss, PlayerStateUpdate, PlayersState);

gameServer.start();
