"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const TestRunner_1 = require("../TestRunner");
const FtxUsClient_1 = require("../../src/exchanges/FtxUsClient");
const https = __importStar(require("../../src/Https"));
(0, TestRunner_1.testClient)({
    clientFactory: () => new FtxUsClient_1.FtxUsClient(),
    clientName: "FtxUsClient",
    exchangeName: "FTX US",
    async fetchMarkets() {
        const res = await https.get("https://ftx.us/api/markets");
        return res.result.map(p => ({
            id: p.name,
            type: p.type,
            base: p.baseCurrency,
            quote: p.quoteCurrency,
        }));
    },
    testConnectEvents: true,
    testDisconnectEvents: true,
    testReconnectionEvents: true,
    testCloseEvents: true,
    hasTickers: true,
    hasTrades: true,
    hasCandles: false,
    hasLevel2Snapshots: false,
    hasLevel2Updates: true,
    hasLevel3Snapshots: false,
    hasLevel3Updates: false,
    ticker: {
        hasTimestamp: true,
        hasLast: true,
        hasOpen: false,
        hasHigh: false,
        hasLow: false,
        hasVolume: false,
        hasQuoteVolume: false,
        hasChange: false,
        hasChangePercent: false,
        hasAsk: true,
        hasBid: true,
        hasAskVolume: true,
        hasBidVolume: true,
    },
    trade: {
        hasTradeId: true,
        tradeIdPattern: /[0-9]+/,
    },
    l2snapshot: {
        hasTimestampMs: true,
        hasSequenceId: false,
        hasCount: false,
    },
    l2update: {
        hasSnapshot: true,
        hasTimestampMs: true,
        hasSequenceId: false,
        hasCount: false,
    },
});
//# sourceMappingURL=FtxUsClient.spec.js.map