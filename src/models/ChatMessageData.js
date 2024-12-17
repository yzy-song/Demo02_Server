class ChatMessageData {
    constructor(sender, receiver, content, timestamp) {
        this.sender = sender;      // 发送者用户名
        this.receiver = receiver;  // 接收者用户名（空表示公屏消息）
        this.content = content;    // 聊天内容
        this.timestamp = timestamp; // 消息时间戳
    }
}
