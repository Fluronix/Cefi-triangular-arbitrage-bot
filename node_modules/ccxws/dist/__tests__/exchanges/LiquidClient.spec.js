"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LiquidClient_1 = require("../../src/exchanges/LiquidClient");
const TestRunner_1 = require("../TestRunner");
(0, TestRunner_1.testClient)({
    clientFactory: () => new LiquidClient_1.LiquidClient(),
    clientName: "LiquidClient",
    exchangeName: "Liquid",
    markets: [
        {
            id: "btcjpy",
            base: "BTC",
            quote: "JPY",
        },
    ],
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
        hasOpen: true,
        hasHigh: false,
        hasLow: false,
        hasVolume: true,
        hasQuoteVolume: false,
        hasChange: true,
        hasChangePercent: true,
        hasAsk: true,
        hasBid: true,
        hasAskVolume: false,
        hasBidVolume: false,
    },
    trade: {
        hasTradeId: true,
    },
    // l2snapshot: {
    //   hasTimestampMs: true,
    //   hasSequenceId: false,
    //   hasCount: true,
    // },
    l2update: {
        hasSnapshot: false,
        hasTimestampMs: false,
        hasSequenceId: false,
        hasCount: false,
    },
});
//# sourceMappingURL=LiquidClient.spec.js.map