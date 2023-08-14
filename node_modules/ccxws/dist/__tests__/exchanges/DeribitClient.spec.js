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
const DeribitClient_1 = require("../../src/exchanges/DeribitClient");
const https = __importStar(require("../../src/Https"));
const assertions = {
    hasTickers: true,
    hasTrades: true,
    hasCandles: true,
    hasLevel2Snapshots: false,
    hasLevel2Updates: true,
    hasLevel3Snapshots: false,
    hasLevel3Updates: false,
    ticker: {
        hasTimestamp: true,
        hasLast: true,
        hasOpen: false,
        hasHigh: true,
        hasLow: true,
        hasVolume: true,
        hasQuoteVolume: false,
        hasChange: false,
        hasChangePercent: true,
        hasAsk: true,
        hasBid: true,
        hasAskVolume: true,
        hasBidVolume: true,
    },
    trade: {
        hasTradeId: true,
    },
    candle: {},
    l2snapshot: {
        hasTimestampMs: true,
        hasSequenceId: true,
        hasCount: false,
    },
    l2update: {
        hasSnapshot: true,
        hasSequenceId: true,
        hasTimestampMs: true,
    },
};
(0, TestRunner_1.testClient)({
    clientFactory: () => new DeribitClient_1.DeribitClient(),
    clientName: "DeribitClient - Swaps",
    exchangeName: "Deribit",
    markets: [
        {
            id: "BTC-PERPETUAL",
            base: "BTC",
            quote: "USD",
        },
    ],
    testConnectEvents: true,
    testDisconnectEvents: true,
    testReconnectionEvents: true,
    testCloseEvents: true,
    ...assertions,
});
(0, TestRunner_1.testClient)({
    clientFactory: () => new DeribitClient_1.DeribitClient(),
    clientName: "DeribitClient - Futures",
    exchangeName: "Deribit",
    async fetchMarkets() {
        const res = await https.get("https://www.deribit.com/api/v2/public/get_instruments?currency=BTC&expired=false&kind=future");
        return res.result.map(p => ({
            id: p.instrument_name,
            base: p.base_currency,
            quote: "USD",
            type: "futures",
        }));
    },
    ...assertions,
});
(0, TestRunner_1.testClient)({
    clientFactory: () => new DeribitClient_1.DeribitClient(),
    clientName: "DeribitClient - Options",
    exchangeName: "Deribit",
    async fetchMarkets() {
        const res = await https.get("https://www.deribit.com/api/v2/public/get_instruments?currency=BTC&expired=false&kind=option");
        return res.result
            .map(p => ({
            id: p.instrument_name,
            base: p.base_currency,
            quote: "USD",
            type: "option",
        }))
            .slice(0, 10);
    },
    async fetchTradeMarkets() {
        const res = await https.get("https://www.deribit.com/api/v2/public/get_instruments?currency=BTC&expired=false&kind=option");
        return res.result.map(p => ({
            id: p.instrument_name,
            base: p.base_currency,
            quote: "USD",
            type: "option",
        }));
    },
    ...assertions,
});
//# sourceMappingURL=DeribitClient.spec.js.map