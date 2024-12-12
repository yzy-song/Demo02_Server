const mongoose = require('mongoose');

const connectMongo = async () => {
    try {
        await mongoose.connect('mongodb+srv://yanziyi290:JsKDtYmGLRefXdti@yzygameserver.ymx1u.mongodb.net/game_project?retryWrites=true&w=majority&appName=YzYGameServer');
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

module.exports = connectMongo;
