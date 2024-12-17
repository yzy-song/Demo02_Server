/*
 * @Author: yzy
 * @Date: 2024-12-14 00:48:28
 * @LastEditors: yzy
 * @LastEditTime: 2024-12-14 12:46:06
 */
const redisClientTest = require('./config/Redis');
redisClientTest.set('testKey', 'testValue', 'EX', 60)
    .then(() => console.log('Set key successfully'))
    .catch((err) => console.error('Error setting key:', err));


module.exports = redisClientTest;
