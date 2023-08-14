"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErisXOrderBook = void 0;
const L3Point_1 = require("./L3Point");
const L3PointStore_1 = require("./L3PointStore");
/**
 * Maintains a Level 3 order book for ErisX
 */
class ErisXOrderBook {
    constructor(snap) {
        this.asks = new L3PointStore_1.L3PointStore();
        this.bids = new L3PointStore_1.L3PointStore();
        this.timestampMs = snap.timestampMs;
        this.runId = 0;
        for (const ask of snap.asks) {
            this.asks.set(new L3Point_1.L3Point(ask.orderId, Number(ask.price), Number(ask.size)));
        }
        for (const bid of snap.bids) {
            this.bids.set(new L3Point_1.L3Point(bid.orderId, Number(bid.price), Number(bid.size)));
        }
    }
    update(update) {
        this.timestampMs = update.timestampMs;
        for (const point of update.asks) {
            this.updatePoint(point, false);
        }
        for (const point of update.bids) {
            this.updatePoint(point, false);
        }
    }
    updatePoint(point, isAsk) {
        const map = isAsk ? this.asks : this.bids;
        const orderId = point.orderId;
        const price = Number(point.price);
        const size = Number(point.size);
        const type = point.meta.type;
        if (type === "DELETE") {
            map.delete(orderId);
            return;
        }
        else if (type === "NEW") {
            map.set(new L3Point_1.L3Point(orderId, price, size));
        }
        else {
            throw new Error("Unknown type");
        }
    }
    snapshot(depth = 10) {
        return {
            sequenceId: this.sequenceId,
            runId: this.runId,
            asks: this.asks.snapshot(depth, "asc"),
            bids: this.bids.snapshot(depth, "desc"),
        };
    }
}
exports.ErisXOrderBook = ErisXOrderBook;
//# sourceMappingURL=ErisXOrderBook.js.map