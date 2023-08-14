"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestRunner_1 = require("../TestRunner");
const BithumbClient_1 = require("../../src/exchanges/BithumbClient");
(0, TestRunner_1.testClient)({
    clientFactory: () => new BithumbClient_1.BithumbClient(),
    clientName: "BithumbClient",
    exchangeName: "Bithumb",
    markets: [
        {
            id: "BTC_KRW",
            base: "BTC",
            quote: "KRW",
        },
        {
            id: "ETH_KRW",
            base: "ETH",
            quote: "KRW",
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
        hasTradeId: false,
    },
    l2update: {
        hasSnapshot: true,
        hasTimestampMs: true,
        hasSequenceId: false,
        hasCount: true,
    },
    l2snapshot: {
        hasTimestampMs: true,
        hasSequenceId: false,
        hasCount: false,
    },
});
//# sourceMappingURL=BithumbClient.spec.js.map