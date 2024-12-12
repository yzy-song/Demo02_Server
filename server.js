/*
 * @Author: yzy
 * @Date: 2024-12-11 16:02:22
 * @LastEditors: yzy
 * @LastEditTime: 2024-12-12 14:09:28
 */
const express = require('express');
const bodyParser = require('body-parser');
const connectMongo = require('./config/MongoDb');
const { connectPostgres } = require('./config/PostgreSQLDB'); // 引入连接函数
const authRoutes = require('./routes/Auth');

// 连接 MongoDB
connectMongo();

// 连接 PostgreSQL
connectPostgres();

const app = express();
app.use(bodyParser.json());

// 路由
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
