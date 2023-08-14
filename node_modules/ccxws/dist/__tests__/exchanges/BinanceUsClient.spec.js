"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestRunner_1 = require("../TestRunner");
const BinanceUsClient_1 = require("../../src/exchanges/BinanceUsClient");
const Https_1 = require("../../src/Https");
async function fetchAllMarkets() {
    const results = (await (0, Https_1.get)("https://api.binance.us/api/v1/exchangeInfo"));
    return results.symbols
        .filter(p => p.status === "TRADING")
        .map(p => ({ id: p.symbol, base: p.baseAsset, quote: p.quoteAsset }));
}
(0, TestRunner_1.testClient)({
    clientFactory: () => new BinanceUsClient_1.BinanceUsClient(),
    clientName: "BinanceUSClient",
    exchangeName: "BinanceUS",
    fetchMarkets: fetchAllMarkets,
    skip: false,
    unsubWaitMs: 1500,
    testConnectEvents: true,
    testDisconnectEvents: true,
    testReconnectionEvents: true,
    testCloseEvents: true,
    hasTickers: true,
    hasTrades: true,
    hasCandles: true,
    hasLevel2Snapshots: true,
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
        hasBid: true,
        hasBidVolume: true,
        hasAsk: true,
        hasAskVolume: true,
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
        hasLastSequenceId: true,
        hasEventMs: true,
        hasCount: false,
    },
});
//# sourceMappingURL=BinanceUsClient.spec.js.map