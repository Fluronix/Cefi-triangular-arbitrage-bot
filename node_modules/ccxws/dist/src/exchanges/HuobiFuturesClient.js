"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuobiFuturesClient = void 0;
const HuobiBase_1 = require("./HuobiBase");
class HuobiFuturesClient extends HuobiBase_1.HuobiBase {
    constructor({ wssPath = "wss://api.hbdm.com/ws", watcherMs } = {}) {
        super({ name: "Huobi Futures", wssPath, watcherMs });
        this.hasLevel2Updates = true;
    }
}
exports.HuobiFuturesClient = HuobiFuturesClient;
//# sourceMappingURL=HuobiFuturesClient.js.map