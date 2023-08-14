"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BinanceClient = void 0;
const BinanceBase_1 = require("./BinanceBase");
class BinanceClient extends BinanceBase_1.BinanceBase {
    constructor({ useAggTrades = true, requestSnapshot = true, socketBatchSize = 200, socketThrottleMs = 1000, restThrottleMs = 1000, testNet = false, wssPath = "wss://stream.binance.com:9443/stream", restL2SnapshotPath = "https://api.binance.com/api/v1/depth", watcherMs, l2updateSpeed, l2snapshotSpeed, batchTickers, } = {}) {
        if (testNet) {
            wssPath = "wss://testnet.binance.vision/stream";
            restL2SnapshotPath = "https://testnet.binance.vision/api/v1/depth";
        }
        super({
            name: "Binance",
            restL2SnapshotPath,
            wssPath,
            useAggTrades,
            requestSnapshot,
            socketBatchSize,
            socketThrottleMs,
            restThrottleMs,
            watcherMs,
            l2updateSpeed,
            l2snapshotSpeed,
            batchTickers,
        });
    }
}
exports.BinanceClient = BinanceClient;
//# sourceMappingURL=BinanceClient.js.map