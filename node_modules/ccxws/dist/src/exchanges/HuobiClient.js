"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuobiClient = void 0;
const HuobiBase_1 = require("./HuobiBase");
class HuobiClient extends HuobiBase_1.HuobiBase {
    constructor({ wssPath = "wss://api.huobi.pro/ws", watcherMs } = {}) {
        super({ name: "Huobi", wssPath, watcherMs });
    }
}
exports.HuobiClient = HuobiClient;
//# sourceMappingURL=HuobiClient.js.map