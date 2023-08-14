"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinanceJeClient = void 0;
const BinanceBase_1 = require("./BinanceBase");
class BinanceJeClient extends BinanceBase_1.BinanceBase {
    constructor({ useAggTrades = true, requestSnapshot = true, socketBatchSize = 200, socketThrottleMs = 1000, restThrottleMs = 1000, watcherMs, l2updateSpeed, l2snapshotSpeed, } = {}) {
        super({
            name: "BinanceJe",
            wssPath: "wss://stream.binance.je:9443/stream",
            restL2SnapshotPath: "https://api.binance.je/api/v1/depth",
            useAggTrades,
            requestSnapshot,
            socketBatchSize,
            socketThrottleMs,
            restThrottleMs,
            watcherMs,
            l2updateSpeed,
            l2snapshotSpeed,
        });
    }
}
exports.BinanceJeClient = BinanceJeClient;
//# sourceMappingURL=BinanceJeClient.js.map