"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const KucoinClient_1 = require("../../src/exchanges/KucoinClient");
const TestRunner_1 = require("../TestRunner");
(0, TestRunner_1.testClient)({
    clientFactory: () => new KucoinClient_1.KucoinClient(),
    clientName: "KucoinClient",
    exchangeName: "KuCoin",
    markets: [
        {
            id: "BTC-USDT",
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
        hasQuoteVolume: false,
        hasChange: true,
        hasChangePercent: true,
        hasAsk: true,
        hasBid: true,
        hasAskVolume: false,
        hasBidVolume: false,
    },
    trade: {
        hasTradeId: true,
        tradeIdPattern: /\w{24,}/,
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
        hasCount: false,
    },
    l3update: {
        hasSnapshot: true,
        hasTimestampMs: true,
        hasSequenceId: true,
        orderIdPattern: /^[a-f0-9]{24,24}$/,
        done: (spec, result, update) => {
            const point = update.asks[0] || update.bids[0];
            switch (point.meta.type) {
                case "received":
                    if (!result.hasReceived) {
                        result.hasReceived = true;
                        (0, chai_1.expect)(update.sequenceId).to.be.greaterThan(0);
                        (0, chai_1.expect)(update.timestampMs).to.be.greaterThan(1597679523725);
                        (0, chai_1.expect)(point.orderId).to.match(/^[a-f0-9]{24,24}/);
                        (0, chai_1.expect)(point.price).to.equal("0");
                        (0, chai_1.expect)(point.size).to.equal("0");
                        (0, chai_1.expect)(point.meta.ts).to.match(/[0-9]{19,}/);
                    }
                    break;
                case "open":
                    if (!result.hasOpen) {
                        result.hasOpen = true;
                        (0, chai_1.expect)(update.sequenceId).to.be.greaterThan(0);
                        (0, chai_1.expect)(update.timestampMs).to.be.greaterThan(1597679523725);
                        (0, chai_1.expect)(point.orderId).to.match(/^[a-f0-9]{24,24}/);
                        (0, chai_1.expect)(Number(point.price)).to.be.greaterThan(0);
                        (0, chai_1.expect)(Number(point.size)).to.be.greaterThan(0);
                        (0, chai_1.expect)(point.meta.ts).to.match(/[0-9]{19,}/);
                        (0, chai_1.expect)(point.meta.orderTime).to.match(/[0-9]{19,}/);
                    }
                    break;
                case "done":
                    if (!result.hasDone) {
                        result.hasDone = true;
                        (0, chai_1.expect)(update.sequenceId).to.be.greaterThan(0);
                        (0, chai_1.expect)(update.timestampMs).to.be.greaterThan(1597679523725);
                        (0, chai_1.expect)(point.orderId).to.match(/^[a-f0-9]{24,24}/);
                        (0, chai_1.expect)(point.price).to.equal("0");
                        (0, chai_1.expect)(point.size).to.equal("0");
                        (0, chai_1.expect)(point.meta.ts).to.match(/[0-9]{19,}/);
                        (0, chai_1.expect)(point.meta.reason).to.match(/filled|canceled/);
                    }
                    break;
                case "match":
                    if (!result.hasMatch) {
                        result.hasMatch = true;
                        (0, chai_1.expect)(update.sequenceId).to.be.greaterThan(0);
                        (0, chai_1.expect)(update.timestampMs).to.be.greaterThan(1597679523725);
                        (0, chai_1.expect)(point.orderId).to.match(/^[a-f0-9]{24,24}/);
                        (0, chai_1.expect)(point.price).to.equal("0");
                        (0, chai_1.expect)(Number(point.size)).to.be.gte(0);
                        (0, chai_1.expect)(point.meta.ts).to.match(/[0-9]{19,}/);
                        (0, chai_1.expect)(point.meta.remainSize).to.not.be.undefined;
                        (0, chai_1.expect)(point.meta.takerOrderId).to.not.be.undefined;
                        (0, chai_1.expect)(point.meta.makerOrderId).to.not.be.undefined;
                        (0, chai_1.expect)(point.meta.tradeId).to.not.be.undefined;
                        (0, chai_1.expect)(Number(point.tradePrice)).to.be.gte(0);
                        (0, chai_1.expect)(Number(point.tradeSize)).to.be.gte(0);
                    }
                    break;
                case "update":
                    if (!result.hasUpdate) {
                        result.hasUpdate = true;
                        (0, chai_1.expect)(update.sequenceId).to.be.gt(0);
                        (0, chai_1.expect)(update.timestampMs).to.be.gt(1597679523725);
                        (0, chai_1.expect)(point.orderId).to.match(/^[a-f0-9]{24,24}/);
                        (0, chai_1.expect)(point.price).to.equal("0");
                        (0, chai_1.expect)(Number(point.size)).to.be.gte(0);
                        (0, chai_1.expect)(point.meta.ts).to.match(/[0-9]{19,}/);
                    }
                    break;
            }
            return result.hasReceived && result.hasOpen && result.hasDone && result.hasMatch;
        },
    },
    l3snapshot: {
        hasTimestampMs: true,
        hasSequenceId: true,
    },
});
//# sourceMappingURL=KucoinClient.spec.js.map