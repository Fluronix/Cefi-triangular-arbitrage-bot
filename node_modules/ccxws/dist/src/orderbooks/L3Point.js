"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.L3Point = void 0;
/**
 * Level 3 order book point
 */
class L3Point {
    constructor(orderId, price, size, timestamp) {
        this.orderId = orderId;
        this.price = price;
        this.size = size;
        this.timestamp = timestamp;
    }
}
exports.L3Point = L3Point;
//# sourceMappingURL=L3Point.js.map