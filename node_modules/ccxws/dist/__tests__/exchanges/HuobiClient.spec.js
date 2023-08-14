"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const HuobiClient_1 = require("../../src/exchanges/HuobiClient");
const TestRunner_1 = require("../TestRunner");
(0, TestRunner_1.testClient)({
    clientFactory: () => new HuobiClient_1.HuobiClient(),
    clientName: "HuobiClient",
    exchangeName: "Huobi",
    markets: [
        {
            id: "btcusdt",
            base: "BTC",
            quote: "USDT",
        },
    ],
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
        tradeIdPattern: /[0-9]+/,
    },
    candle: {},
    l2snapshot: {
        hasTimestampMs: true,
        hasSequenceId: true,
        hasCount: false,
    },
});
//# sourceMappingURL=HuobiClient.spec.js.map