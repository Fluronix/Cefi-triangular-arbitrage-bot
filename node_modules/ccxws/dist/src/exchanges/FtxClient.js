"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FtxClient = void 0;
const FtxBase_1 = require("./FtxBase");
class FtxClient extends FtxBase_1.FtxBaseClient {
    constructor({ wssPath = "wss://ftx.com/ws", watcherMs } = {}) {
        super({ name: "FTX", wssPath, watcherMs });
    }
}
exports.FtxClient = FtxClient;
//# sourceMappingURL=FtxClient.js.map