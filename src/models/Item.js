/*
 * @Author: yzy
 * @Date: 2024-12-17 00:04:39
 * @LastEditors: yzy
 * @LastEditTime: 2024-12-17 00:05:23
 */
class Item {
    constructor(id, name, x, y) {
        this.id = id;        // 道具唯一标识符
        this.name = name;    // 道具名称
        this.x = x;          // 道具位置 X
        this.y = y;          // 道具位置 Y
        this.isPickedUp = false; // 是否被拾取
    }
}
