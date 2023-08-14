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
const BiboxClient_1 = require("../../src/exchanges/BiboxClient");
const https = __importStar(require("../../src/Https"));
(0, TestRunner_1.testClient)({
    clientFactory: () => new BiboxClient_1.BiboxClient(),
    clientName: "BiboxClient",
    exchangeName: "Bibox",
    markets: [
        {
            id: "BTC_USDT",
            base: "BTC",
            quote: "USDT",
        },
        {
            id: "ETH_USDT",
            base: "ETH",
            quote: "USDT",
        },
        {
            id: "ETH_BTC",
            base: "ETH",
            quote: "BTC",
        },
    ],
    async fetchAllMarkets() {
        const res = (await https.get("https://api.bibox.com/v1/mdata?cmd=pairList"));
        return res.result.map(p => ({
            id: p.pair,
            base: p.pair.split("_")[0],
            quote: p.pair.split("_")[1],
        }));
    },
    getEventingSocket(client) {
        return client._clients[0]._wss;
    },
    testAllMarketsTrades: true,
    testAllMarketsTradesSuccess: 50,
    testConnectEvents: true,
    testDisconnectEvents: true,
    testReconnectionEvents: true,
    testCloseEvents: true,
    hasTickers: true,
    hasTrades: true,
    hasCandles: true,
    hasLevel2Snapshots: true,
    hasLevel2Updates: false,
    hasLevel3Snapshots: false,
    hasLevel3Updates: false,
    ticker: {
        hasTimestamp: true,
        hasLast: true,
        hasOpen: true,
        hasHigh: true,
        hasLow: true,
        hasVolume: true,
        hasQuoteVolume: false,
        hasChange: true,
        hasChangePercent: true,
        hasBid: true,
        hasBidVolume: false,
        hasAsk: true,
        hasAskVolume: false,
    },
    trade: {
        hasTradeId: false,
    },
    candle: {},
    l2snapshot: {
        hasTimestampMs: true,
        hasSequenceId: false,
        hasCount: false,
    },
});
//# sourceMappingURL=BiboxClient.spec.js.map