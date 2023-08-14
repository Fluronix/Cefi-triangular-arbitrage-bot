"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestRunner_1 = require("../TestRunner");
const Geminiclient_1 = require("../../src/exchanges/Geminiclient");
(0, TestRunner_1.testClient)({
    clientFactory: () => new Geminiclient_1.GeminiClient(),
    clientName: "GeminiClient",
    exchangeName: "Gemini",
    markets: [
        {
            id: "btcusd",
            base: "BTC",
            quote: "USD",
        },
        {
            id: "ethusd",
            base: "ETH",
            quote: "USD",
        },
        {
            id: "ltcusd",
            base: "LTC",
            quote: "USD",
        },
    ],
    getEventingSocket(client, market) {
        return client._subscriptions.get(market.id).wss;
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
    trade: {
        hasTradeId: true,
    },
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
        hasBid: true,
        hasBidVolume: false,
        hasAsk: true,
        hasAskVolume: false,
    },
    l2snapshot: {
        hasTimestampMs: false,
        hasSequenceId: true,
        hasEventId: true,
        hasCount: false,
    },
    l2update: {
        done: function (spec, result, update) {
            const hasAsks = update.asks && update.asks.length > 0;
            const hasBids = update.bids && update.bids.length > 0;
            return hasAsks || hasBids;
        },
        hasSnapshot: true,
        hasTimestampMs: true,
        hasSequenceId: true,
        hasEventId: true,
        hasCount: false,
    },
});
//# sourceMappingURL=GeminiClient.spec.js.map