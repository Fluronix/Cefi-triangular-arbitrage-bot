"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HuobiKoreaClient = void 0;
const HuobiBase_1 = require("./HuobiBase");
class HuobiKoreaClient extends HuobiBase_1.HuobiBase {
    constructor({ wssPath = "wss://api-cloud.huobi.co.kr/ws", watcherMs } = {}) {
        super({ name: "Huobi Korea", wssPath, watcherMs });
    }
}
exports.HuobiKoreaClient = HuobiKoreaClient;
//# sourceMappingURL=HuobiKoreaClient.js.map