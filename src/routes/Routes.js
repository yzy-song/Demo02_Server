/*
 * @Author: yzy
 * @Date: 2024-12-11 16:02:22
 * @LastEditors: yzy
 * @LastEditTime: 2024-12-14 12:34:13
 */
const express = require('express');
const router = express.Router();
const { login, guestLogin, logout } = require('../controllers/AuthController');
const { onlinePlayers,heartbeat } = require('../controllers/PlayersController');

// 登录相关路由
router.post("/auth/login", login);
router.post("/auth/guest", guestLogin);
router.post("/auth/logout", logout);

// 游戏相关路由
router.post("/game/onlinePlayers", onlinePlayers);
router.post("/game/heartbeat", heartbeat);

module.exports = router;