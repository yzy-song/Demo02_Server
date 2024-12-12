/*
 * @Author: yzy
 * @Date: 2024-12-11 16:02:22
 * @LastEditors: yzy
 * @LastEditTime: 2024-12-11 19:25:16
 */
const express = require('express');
const router = express.Router();
const { login, guestLogin } = require('../controllers/AuthController');

router.post('/login', login);
router.post('/guest', guestLogin);

module.exports = router;
