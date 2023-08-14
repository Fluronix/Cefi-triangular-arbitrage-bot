"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestRunner_1 = require("../TestRunner");
const BinanceJeClient_1 = require("../../src/exchanges/BinanceJeClient");
const Https_1 = require("../../src/Https");
async function fetchAllMarkets() {
    const results = (await (0, Https_1.get)("https://api.binance.je/api/v1/exchangeInfo"));
    return results.symbols
        .filter(p => p.status === "TRADING")
        .map(p => ({ id: p.symbol, base: p.baseAsset, quote: p.quoteAsset }));
}
(0, TestRunner_1.testClient)({
    clientFactory: () => new BinanceJeClient_1.BinanceJeClient(),
    clientName: "BinanceJeClient",
    exchangeName: "BinanceJe",
    fetchMarkets: fetchAllMarkets,
    skip: true,
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
//# sourceMappingURL=BinanceJeClient.spec.js.map