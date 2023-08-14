"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuobiJapanClient = void 0;
const HuobiBase_1 = require("./HuobiBase");
class HuobiJapanClient extends HuobiBase_1.HuobiBase {
    constructor({ wssPath = "wss://api-cloud.huobi.co.jp/ws", watcherMs } = {}) {
        super({ name: "Huobi Japan", wssPath, watcherMs });
    }
}
exports.HuobiJapanClient = HuobiJapanClient;
//# sourceMappingURL=HuobiJapanClient.js.map