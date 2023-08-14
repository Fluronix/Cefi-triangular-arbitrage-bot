"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TestRunner_1 = require("../TestRunner");
const CoinexClient_1 = require("../../src/exchanges/CoinexClient");
(0, TestRunner_1.testClient)({
    clientFactory: () => new CoinexClient_1.CoinexClient(),
    clientName: "CoinexClient",
    exchangeName: "Coinex",
    markets: [
        {
            id: "BTCUSDT",
            base: "BTC",
            quote: "USDT",
        },
        {
            id: "ETHBTC",
            base: "ETH",
            quote: "BTC",
        },
        {
            id: "ETHUSDT",
            base: "ETH",
            quote: "USDT",
        },
    ],
    getEventingSocket(client, market) {
        return client._clients.get(market.id).then(c => c._wss);
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
        hasAskVolume: false,
    },
    trade: {
        hasTradeId: true,
    },
    l2snapshot: {
        hasTimestampMs: false,
        hasSequenceId: false,
        hasCount: false,
    },
    l2update: {
        hasSnapshot: true,
        hasTimestampMs: false,
        hasSequenceId: false,
        hasCount: false,
    },
});
//# sourceMappingURL=CoinexClient.spec.js.map