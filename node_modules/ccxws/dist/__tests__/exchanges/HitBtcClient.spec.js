"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestRunner_1 = require("../TestRunner");
const HitBtcClient_1 = require("../../src/exchanges/HitBtcClient");
const Https_1 = require("../../src/Https");
(0, TestRunner_1.testClient)({
    clientFactory: () => new HitBtcClient_1.HitBtcClient(),
    clientName: "HitBTCClient",
    exchangeName: "HitBTC",
    markets: [
        {
            id: "ETHBTC",
            base: "ETH",
            quote: "BTC",
        },
        {
            id: "BTCUSDT",
            base: "BTC",
            quote: "USDT",
        },
    ],
    fetchAllMarkets: async () => {
        const results = await (0, Https_1.get)("https://api.hitbtc.com/api/2/public/symbol");
        return results.map(p => ({ id: p.id, base: p.baseCurrency, quote: p.quoteCurrency }));
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
        hasAskVolume: false,
        hasBidVolume: false,
    },
    trade: {
        hasTradeId: true,
    },
    candle: {},
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
//# sourceMappingURL=HitBtcClient.spec.js.map