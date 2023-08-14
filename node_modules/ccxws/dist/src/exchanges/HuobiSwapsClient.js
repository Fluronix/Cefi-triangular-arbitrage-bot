"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuobiSwapsClient = void 0;
const HuobiBase_1 = require("./HuobiBase");
class HuobiSwapsClient extends HuobiBase_1.HuobiBase {
    constructor({ wssPath = "wss://api.hbdm.com/swap-ws", watcherMs } = {}) {
        super({ name: "Huobi Swaps", wssPath, watcherMs });
        this.hasLevel2Updates = true;
    }
}
exports.HuobiSwapsClient = HuobiSwapsClient;
//# sourceMappingURL=HuobiSwapsClient.js.map