"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestRunner_1 = require("../TestRunner");
const UpbitClient_1 = require("../../src/exchanges/UpbitClient");
(0, TestRunner_1.testClient)({
    clientFactory: () => new UpbitClient_1.UpbitClient(),
    clientName: "UpbitClient",
    exchangeName: "Upbit",
    markets: [
        {
            id: "KRW-BTC",
            base: "KRW",
            quote: "BTC",
        },
        {
            id: "KRW-BTT",
            base: "KRW",
            quote: "BTT",
        },
    ],
    testConnectEvents: true,
    testDisconnectEvents: true,
    testReconnectionEvents: true,
    testCloseEvents: true,
    hasTickers: true,
    hasTrades: true,
    hasCandles: false,
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
        hasQuoteVolume: true,
        hasChange: true,
        hasChangePercent: true,
        hasAsk: false,
        hasBid: false,
        hasAskVolume: false,
        hasBidVolume: false,
    },
    trade: {
        hasTradeId: true,
    },
    l2snapshot: {
        hasTimestampMs: true,
        hasSequenceId: false,
        hasCount: false,
    },
});
//# sourceMappingURL=UpbitClient.spec.js.map