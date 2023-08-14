"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FtxUsClient = void 0;
const FtxBase_1 = require("./FtxBase");
class FtxUsClient extends FtxBase_1.FtxBaseClient {
    constructor({ wssPath = "wss://ftx.us/ws", watcherMs } = {}) {
        super({ name: "FTX US", wssPath, watcherMs });
    }
}
exports.FtxUsClient = FtxUsClient;
//# sourceMappingURL=FtxUsClient.js.map