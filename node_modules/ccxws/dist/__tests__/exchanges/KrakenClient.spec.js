"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestRunner_1 = require("../TestRunner");
const KrakenClient_1 = require("../../src/exchanges/KrakenClient");
(0, TestRunner_1.testClient)({
    clientFactory: () => new KrakenClient_1.KrakenClient(),
    clientName: "KrakenClient",
    exchangeName: "Kraken",
    markets: [
        {
            id: "XXBTZEUR",
            base: "BTC",
            quote: "EUR",
        },
    ],
    testConnectEvents: true,
    testDisconnectEvents: true,
    testReconnectionEvents: true,
    testCloseEvents: true,
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
        hasOpen: true,
        hasHigh: true,
        hasLow: true,
        hasVolume: true,
        hasQuoteVolume: true,
        hasChange: true,
        hasChangePercent: true,
        hasAsk: true,
        hasBid: true,
        hasAskVolume: true,
        hasBidVolume: true,
    },
    trade: {
        hasTradeId: true,
        tradeIdPattern: /\d{19,}/,
    },
    candle: {},
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
//# sourceMappingURL=KrakenClient.spec.js.map