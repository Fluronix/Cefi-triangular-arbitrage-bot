"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestRunner_1 = require("../TestRunner");
const BinanceFuturesCoinmClient_1 = require("../../src/exchanges/BinanceFuturesCoinmClient");
const Https_1 = require("../../src/Https");
async function fetchAllMarkets() {
    const results = (await (0, Https_1.get)("https://dapi.binance.com/dapi/v1/exchangeInfo"));
    return results.symbols
        .filter(p => p.contractStatus === "TRADING")
        .map(p => ({ id: p.symbol, base: p.baseAsset, quote: p.quoteAsset }));
}
(0, TestRunner_1.testClient)({
    clientFactory: () => new BinanceFuturesCoinmClient_1.BinanceFuturesCoinmClient(),
    clientName: "BinanceFuturesCoinmClient",
    exchangeName: "Binance Futures COIN-M",
    markets: [],
    allMarkets: [],
    fetchMarkets: fetchAllMarkets,
    fetchAllMarkets: fetchAllMarkets,
    unsubWaitMs: 1500,
    testConnectEvents: true,
    testDisconnectEvents: true,
    testReconnectionEvents: true,
    testCloseEvents: true,
    testAllMarketsTrades: true,
    testAllMarketsTradesSuccess: 5,
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
        hasBid: false,
        hasBidVolume: false,
        hasAsk: false,
        hasAskVolume: false, // deviation from spot
    },
    trade: {
        hasTradeId: true,
    },
    candle: {},
    l2snapshot: {
        hasTimestampMs: true,
        hasSequenceId: true,
        hasCount: false,
    },
    l2update: {
        hasSnapshot: true,
        hasTimestampMs: true,
        hasEventMs: true,
        hasSequenceId: true,
        hasLastSequenceId: true,
        hasCount: false,
    },
});
//# sourceMappingURL=BinanceFuturesCoinmClient.spec.js.map