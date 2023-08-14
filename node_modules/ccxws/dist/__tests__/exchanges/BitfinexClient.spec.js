"use strict";
/* eslint-disable @typescript-eslint/no-var-requires */
Object.defineProperty(exports, "__esModule", { value: true });
const TestRunner_1 = require("../TestRunner");
const BitfinexClient_1 = require("../../src/exchanges/BitfinexClient");
const regularSpec = {
    exchangeName: "Bitfinex",
    markets: [
        {
            id: "BTCUSD",
            base: "BTC",
            quote: "USDT",
        },
        {
            id: "ETHUSD",
            base: "ETH",
            quote: "USD",
        },
        {
            id: "ETHBTC",
            base: "ETH",
            quote: "BTC",
        },
        {
            // test a very low volume market
            id: "ENJUSD",
            base: "ENJ",
            quote: "USD",
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
    hasLevel3Updates: true,
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
        hasBidVolume: true,
        hasAsk: true,
        hasSequenceId: true,
        hasAskVolume: true,
    },
    trade: {
        hasTradeId: true,
        hasSequenceId: true,
    },
    l2snapshot: {
        hasTimestampMs: true,
        hasSequenceId: true,
        hasCount: true,
    },
    l2update: {
        hasSnapshot: true,
        hasTimestampMs: true,
        hasSequenceId: true,
        hasCount: true,
        done: function (spec, result, update) {
            const hasAsks = update.asks && update.asks.length > 0;
            const hasBids = update.bids && update.bids.length > 0;
            return hasAsks || hasBids;
        },
    },
    l3snapshot: {
        hasTimestampMs: true,
        hasSequenceId: true,
    },
    l3update: {
        hasSnapshot: true,
        hasTimestampMs: true,
        hasSequenceId: true,
        hasCount: true,
        done: function (spec, result, update) {
            const hasAsks = update.asks && update.asks.length > 0;
            const hasBids = update.bids && update.bids.length > 0;
            return hasAsks || hasBids;
        },
    },
};
const sequenceIdValidateWithEmptyHeartbeatsSpec = {
    ...JSON.parse(JSON.stringify(regularSpec)),
    markets: [
        {
            // test a very low volume market
            id: "ENJUSD",
            base: "ENJ",
            quote: "USD",
        },
        {
            id: "BTCUSD",
            base: "BTC",
            quote: "USDT",
        },
    ],
    trade: {
        // note: the empty trade event for heartbeat won't have tradeId. but that won't be the first message so TestRunner won't encounter it
        hasTradeId: true,
        hasSequenceId: true,
    },
};
(0, TestRunner_1.testClient)({
    clientName: "BitfinexClient - default options",
    clientFactory: () => new BitfinexClient_1.BitfinexClient(),
    ...regularSpec,
});
(0, TestRunner_1.testClient)({
    clientName: "BitfinexClient - custom options",
    clientFactory: () => new BitfinexClient_1.BitfinexClient({
        enableEmptyHeartbeatEvents: true,
        tradeMessageType: BitfinexClient_1.BitfinexTradeMessageType.All,
    }),
    ...sequenceIdValidateWithEmptyHeartbeatsSpec,
});
//# sourceMappingURL=BitfinexClient.spec.js.map