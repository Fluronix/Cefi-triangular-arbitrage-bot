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
const https = __importStar(require("../../src/Https"));
const BittrexClient_1 = require("../../src/exchanges/BittrexClient");
(0, TestRunner_1.testClient)({
    clientFactory: () => new BittrexClient_1.BittrexClient(),
    clientName: "BittrexClient",
    exchangeName: "Bittrex",
    markets: [
        {
            id: "BTC-USDT",
            base: "BTC",
            quote: "USDT",
        },
        {
            id: "ETH-BTC",
            base: "ETH",
            quote: "BTC",
        },
        {
            id: "LTC-BTC",
            base: "LTC",
            quote: "BTC",
        },
        {
            id: "XRP-BTC",
            base: "XRP",
            quote: "BTC",
        },
    ],
    async fetchAllMarkets() {
        const res = await https.get("https://api.bittrex.com/v3/markets");
        return res.map(p => ({
            id: p.symbol,
            base: p.baseCurrencySymbol,
            quote: p.quoteCurrencySymbol,
        }));
    },
    testConnectEvents: false,
    testDisconnectEvents: false,
    testReconnectionEvents: false,
    testCloseEvents: false,
    testAllMarketsTrades: true,
    testAllMarketsTradesSuccess: 30,
    testAllMarketsL2Updates: true,
    testAllMarketsL2UpdatesSuccess: 400,
    hasTickers: true,
    hasTrades: true,
    hasCandles: true,
    hasLevel2Snapshots: false,
    hasLevel2Updates: true,
    hasLevel3Snapshots: false,
    hasLevel3Updates: false,
    ticker: {
        hasTimestamp: true,
        hasLast: false,
        hasOpen: false,
        hasHigh: true,
        hasLow: true,
        hasVolume: true,
        hasQuoteVolume: true,
        hasChange: false,
        hasChangePercent: true,
        hasBid: false,
        hasBidVolume: false,
        hasAsk: false,
        hasAskVolume: false,
    },
    trade: {
        hasTradeId: true,
    },
    l2snapshot: {
        hasTimestampMs: false,
        hasSequenceId: true,
        hasCount: false,
    },
    l2update: {
        hasSnapshot: true,
        hasTimestampMs: false,
        hasSequenceId: true,
        hasCount: false,
    },
});
//# sourceMappingURL=BittrexClient.spec.js.map