"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testClient = exports.wait = void 0;
/* eslint-disable @typescript-eslint/no-implied-eval */
const chai_1 = require("chai");
const wait = (ms = 0) => new Promise(resolve => setTimeout(resolve, ms));
exports.wait = wait;
function testClient(spec) {
    if (spec.skip)
        return;
    describe(spec.clientName, () => {
        const state = {};
        before(async function () {
            this.timeout(30000);
            state.client = spec.clientFactory();
            if (spec.fetchMarkets) {
                spec.markets = await spec.fetchMarkets();
            }
            if (spec.fetchTradeMarkets) {
                spec.tradeMarkets = await spec.fetchTradeMarkets();
            }
            else if (!spec.tradeMarkets) {
                spec.tradeMarkets = spec.markets;
            }
            if (spec.fetchAllMarkets) {
                spec.allMarkets = await spec.fetchAllMarkets();
            }
            spec.marketIdList = spec.markets.map(p => p.id);
            spec.marketBaseList = spec.markets.map(p => p.base);
            spec.marketQuoteList = spec.markets.map(p => p.quote);
        });
        describe("capabilities", () => {
            it(`should ${spec.hasTickers ? "support" : "not support"} tickers`, () => {
                (0, chai_1.expect)(state.client.hasTickers).to.equal(spec.hasTickers);
            });
            it(`should ${spec.hasTrades ? "support" : "not support"} trades`, () => {
                (0, chai_1.expect)(state.client.hasTrades).to.equal(spec.hasTrades);
            });
            it(`should ${spec.hasCandles ? "support" : "not support"} candles`, () => {
                (0, chai_1.expect)(state.client.hasCandles).to.equal(spec.hasCandles);
            });
            it(`should ${spec.hasLevel2Snapshots ? "support" : "not support"} level2 snapshots`, () => {
                (0, chai_1.expect)(state.client.hasLevel2Snapshots).to.equal(spec.hasLevel2Snapshots);
            });
            it(`should ${spec.hasLevel2Updates ? "support" : "not support"} level2 updates`, () => {
                (0, chai_1.expect)(state.client.hasLevel2Updates).to.equal(spec.hasLevel2Updates);
            });
            it(`should ${spec.hasLevel3Snapshots ? "support" : "not support"} level3 snapshots`, () => {
                (0, chai_1.expect)(state.client.hasLevel3Snapshots).to.equal(spec.hasLevel3Snapshots);
            });
            it(`should ${spec.hasLevel3Updates ? "support" : "not support"} level3 updates`, () => {
                (0, chai_1.expect)(state.client.hasLevel3Updates).to.equal(spec.hasLevel3Updates);
            });
        });
        if (spec.hasTickers && spec.ticker) {
            testTickers(spec, state);
        }
        if (spec.hasTrades && spec.trade) {
            testTrades(spec, state);
        }
        if (spec.hasCandles && spec.candle) {
            testCandles(spec, state);
        }
        if (spec.hasLevel2Snapshots && spec.l2snapshot) {
            testLevel2Snapshots(spec, state);
        }
        if (spec.hasLevel2Updates && spec.l2update) {
            testLevel2Updates(spec, state);
        }
        if (spec.hasLevel3Updates && spec.l3update) {
            testLevel3Updates(spec, state);
        }
        describe("close", () => {
            it("should close client", () => {
                state.client.close();
            });
        });
    });
    describe(spec.clientName + " events", () => {
        let client;
        let actual = [];
        before(() => {
            client = spec.clientFactory();
        });
        beforeEach(() => {
            actual = [];
        });
        afterEach(() => {
            client.removeAllListeners();
        });
        function pushEvent(name) {
            return () => {
                actual.push(name);
            };
        }
        function assertEvents(expected, done) {
            return () => {
                try {
                    (0, chai_1.expect)(actual).to.deep.equal(expected);
                    setTimeout(done, 1000); // delay this to prevent async "connection" events to complete
                }
                catch (ex) {
                    done(ex);
                }
            };
        }
        if (spec.testConnectEvents) {
            it("subscribe triggers `connecting` > `connected`", done => {
                client.on("connecting", pushEvent("connecting"));
                client.on("connected", pushEvent("connected"));
                client.on("connected", assertEvents(["connecting", "connected"], done));
                client.subscribeTrades(spec.markets[0]);
            }).timeout(5000);
        }
        if (spec.testDisconnectEvents) {
            it("disconnection triggers `disconnected` > `connecting` > `connected`", done => {
                client.on("disconnected", pushEvent("disconnected"));
                client.on("connecting", pushEvent("connecting"));
                client.on("connected", pushEvent("connected"));
                client.on("connected", assertEvents(["disconnected", "connecting", "connected"], done));
                const p = client._wss
                    ? Promise.resolve(client._wss)
                    : Promise.resolve(spec.getEventingSocket(client, spec.markets[0]));
                p.then(smartws => {
                    smartws._retryTimeoutMs = 1000;
                    smartws._wss.close(); // simulate a failure by directly closing the underlying socket
                }).catch(done);
            }).timeout(5000);
        }
        if (spec.testReconnectionEvents) {
            it("reconnects triggers `reconnecting` > `closing` > `closed` > `connecting` > `connected`", done => {
                client.on("reconnecting", pushEvent("reconnecting"));
                client.on("closing", pushEvent("closing"));
                client.on("closed", pushEvent("closed"));
                client.on("connecting", pushEvent("connecting"));
                client.on("connected", pushEvent("connected"));
                client.on("connected", assertEvents(["reconnecting", "closing", "closed", "connecting", "connected"], done));
                client.reconnect();
            }).timeout(5000);
        }
        if (spec.testCloseEvents) {
            it("close triggers `closing` > `closed`", done => {
                client.on("reconnecting", () => {
                    throw new Error("should not emit reconnecting");
                });
                client.on("closing", pushEvent("closing"));
                client.on("closed", pushEvent("closed"));
                client.on("closed", assertEvents(["closing", "closed"], done));
                client.close();
            }).timeout(5000);
        }
    });
    describe(spec.clientName + " all markets", () => {
        let client;
        before(async function () {
            this.timeout(15000);
            if (spec.fetchAllMarkets && !spec.allMarkets) {
                spec.allMarkets = await spec.fetchAllMarkets();
            }
        });
        beforeEach(() => {
            client = spec.clientFactory();
        });
        if (spec.testAllMarketsTrades) {
            it(`subscribeTrades wait for ${spec.testAllMarketsTradesSuccess} markets`, done => {
                const markets = new Set();
                client.on("error", err => {
                    client.removeAllListeners("trade");
                    client.removeAllListeners("error");
                    client.close();
                    done(err);
                });
                client.on("trade", (trade, market) => {
                    markets.add(market.id);
                    if (markets.size >= spec.testAllMarketsTradesSuccess) {
                        client.removeAllListeners("trade");
                        client.close();
                        done();
                    }
                });
                for (const market of spec.allMarkets) {
                    client.subscribeTrades(market);
                }
            }).timeout(60000);
        }
        if (spec.testAllMarketsL2Updates) {
            it(`subscribeL2Updates wait for ${spec.testAllMarketsL2UpdatesSuccess} markets`, done => {
                const markets = new Set();
                client.on("error", err => {
                    client.removeAllListeners("l2update");
                    client.removeAllListeners("error");
                    client.close();
                    done(err);
                });
                client.on("l2update", (_, market) => {
                    markets.add(market.id);
                    if (markets.size >= spec.testAllMarketsTradesSuccess) {
                        client.removeAllListeners("l2update");
                        client.close();
                        done();
                    }
                });
                for (const market of spec.allMarkets) {
                    client.subscribeLevel2Updates(market);
                }
            }).timeout(60000);
        }
    });
}
exports.testClient = testClient;
function testTickers(spec, state) {
    describe("subscribeTicker", () => {
        const result = {};
        let client;
        before(() => {
            client = state.client;
        });
        it("should subscribe and emit a ticker", done => {
            for (const market of spec.markets) {
                client.subscribeTicker(market);
            }
            client.on("ticker", (ticker, market) => {
                result.ready = true;
                result.ticker = ticker;
                result.market = market;
                client.removeAllListeners("ticker");
                done();
            });
        })
            .timeout(60000)
            .retries(3);
        it("should unsubscribe from tickers", async () => {
            for (const market of spec.markets) {
                client.unsubscribeTicker(market);
            }
            await (0, exports.wait)(500);
        });
        describe("results", () => {
            before(function () {
                if (!result.ready)
                    return this.skip();
            });
            it("market should be the subscribing market", () => {
                (0, chai_1.expect)(result.market).to.be.oneOf(spec.markets);
            });
            it("ticker.exchange should be the exchange name", () => {
                (0, chai_1.expect)(result.ticker.exchange).to.equal(spec.exchangeName);
            });
            it("ticker.base should match market.base", () => {
                (0, chai_1.expect)(result.ticker.base).to.be.oneOf(spec.marketBaseList);
            });
            it("ticker.quote should match market.quote", () => {
                (0, chai_1.expect)(result.ticker.quote).to.be.oneOf(spec.marketQuoteList);
            });
            if (spec.ticker.hasTimestamp) {
                testTimestampMs(result, "ticker.timestamp");
            }
            else {
                testUndefined(result, "ticker.timestamp");
            }
            if (spec.ticker.hasSequenceId) {
                testPositiveNumber(result, "ticker.sequenceId");
            }
            else {
                testUndefined(result, "ticker.sequenceId");
            }
            const numberProps = [
                [spec.ticker.hasLast, "ticker.last"],
                [spec.ticker.hasOpen, "ticker.open"],
                [spec.ticker.hasHigh, "ticker.high"],
                [spec.ticker.hasLow, "ticker.low"],
                [spec.ticker.hasVolume, "ticker.volume"],
                [spec.ticker.hasQuoteVolume, "ticker.quoteVolume"],
                [spec.ticker.hasChange, "ticker.change"],
                [spec.ticker.hasChangePercent, "ticker.changePercent"],
                [spec.ticker.hasBid, "ticker.bid"],
                [spec.ticker.hasBidVolume, "ticker.bidVolume"],
                [spec.ticker.hasAsk, "ticker.ask"],
                [spec.ticker.hasAskVolume, "ticker.askVolume"],
            ];
            for (const [hasSpec, prop] of numberProps) {
                if (hasSpec) {
                    testNumberString(result, prop);
                }
                else {
                    testUndefined(result, prop);
                }
            }
        });
    });
}
function testTrades(spec, state) {
    describe("subscribeTrades", () => {
        const result = {};
        let client;
        before(() => {
            client = state.client;
        });
        it("should subscribe and emit a trade", done => {
            // give it 2 minutes, then just abort this test
            const timeoutHandle = setTimeout(() => {
                client.removeAllListeners("trade");
                clearTimeout(timeoutHandle);
                done();
            }, 120000);
            for (const market of spec.tradeMarkets) {
                client.subscribeTrades(market);
            }
            client.on("trade", (trade, market) => {
                result.ready = true;
                result.trade = trade;
                result.market = market;
                client.removeAllListeners("trade");
                clearTimeout(timeoutHandle);
                done();
            });
        }).timeout(122000);
        it("should unsubscribe from trades", async () => {
            for (const market of spec.tradeMarkets) {
                client.unsubscribeTrades(market);
            }
            await (0, exports.wait)(spec.unsubWaitMs);
        });
        describe("results", () => {
            before(function () {
                if (!result.ready)
                    return this.skip();
            });
            it("market should be the subscribing market", () => {
                (0, chai_1.expect)(result.market).to.be.oneOf(spec.tradeMarkets);
            });
            it("trade.exchange should be the exchange name", () => {
                (0, chai_1.expect)(result.trade.exchange).to.equal(spec.exchangeName);
            });
            it("trade.base should match market.base", () => {
                (0, chai_1.expect)(result.trade.base).to.be.oneOf(spec.marketBaseList);
            });
            it("trade.quote should match market.quote", () => {
                (0, chai_1.expect)(result.trade.quote).to.be.oneOf(spec.marketQuoteList);
            });
            if (spec.trade.hasTradeId) {
                testString(result, "trade.tradeId");
            }
            else {
                testUndefined(result, "trade.tradeId");
            }
            if (spec.trade.hasSequenceId) {
                testPositiveNumber(result, `trade.sequenceId`);
            }
            else {
                testUndefined(result, `trade.sequenceId`);
            }
            if (spec.trade.tradeIdPattern) {
                it(`trade.tradeId should match pattern ${spec.trade.tradeIdPattern}`, () => {
                    (0, chai_1.expect)(result.trade.tradeId).to.match(spec.trade.tradeIdPattern);
                });
            }
            testTimestampMs(result, "trade.unix");
            it("trade.side should be either 'buy' or 'sell'", () => {
                (0, chai_1.expect)(result.trade.side).to.match(/buy|sell/);
            });
            testNumberString(result, "trade.price");
            testNumberString(result, "trade.amount");
            if (spec.trade.tests) {
                spec.trade.tests(spec, result);
            }
        });
    });
}
function testCandles(spec, state) {
    describe("subscribeCandles", () => {
        const result = {};
        let client;
        before(() => {
            client = state.client;
        });
        it("should subscribe and emit a candle", done => {
            for (const market of spec.markets) {
                client.subscribeCandles(market);
            }
            client.on("candle", (candle, market) => {
                result.ready = true;
                result.market = market;
                result.candle = candle;
                client.removeAllListeners("candle");
                done();
            });
        })
            .timeout(60000)
            .retries(3);
        it("should unsubscribe from candles", async () => {
            for (const market of spec.markets) {
                client.unsubscribeCandles(market);
            }
            await (0, exports.wait)(spec.unsubWaitMs);
        });
        describe("results", () => {
            before(function () {
                if (!result.ready)
                    return this.skip();
            });
            it("market should be the subscribing market", () => {
                (0, chai_1.expect)(result.market).to.be.oneOf(spec.markets);
            });
            testCandleResult(spec, result);
        });
    });
}
function testCandleResult(spec, result) {
    testTimestampMs(result, `candle.timestampMs`);
    testNumberString(result, `candle.open`);
    testNumberString(result, `candle.high`);
    testNumberString(result, `candle.low`);
    testNumberString(result, `candle.close`);
    testNumberString(result, `candle.volume`);
}
function testLevel2Snapshots(spec, state) {
    describe("subscribeLevel2Snapshots", () => {
        const result = {};
        let client;
        before(() => {
            client = state.client;
        });
        it("should subscribe and emit a l2snapshot", done => {
            for (const market of spec.markets) {
                client.subscribeLevel2Snapshots(market);
            }
            client.on("l2snapshot", (snapshot, market) => {
                result.ready = true;
                result.snapshot = snapshot;
                result.market = market;
                client.removeAllListeners("l2snapshot");
                done();
            });
        })
            .timeout(60000)
            .retries(3);
        it("should unsubscribe from l2snapshot", async () => {
            for (const market of spec.markets) {
                client.unsubscribeLevel2Snapshots(market);
            }
            await (0, exports.wait)(spec.unsubWaitMs);
        });
        describe("results", () => {
            before(function () {
                if (!result.ready)
                    return this.skip();
            });
            it("market should be the subscribing market", () => {
                (0, chai_1.expect)(result.market).to.be.oneOf(spec.markets);
            });
            testLevel2Result(spec, result, "snapshot");
        });
    });
}
function testLevel2Updates(spec, state) {
    describe("subscribeLevel2Updates", () => {
        const result = {};
        let client;
        before(() => {
            client = state.client;
        });
        it("should subscribe and emit a l2update", done => {
            for (const market of spec.markets) {
                client.subscribeLevel2Updates(market);
            }
            client.on("l2snapshot", (snapshot, market) => {
                result.ready = true;
                result.snapshot = snapshot;
                result.snapMarket = market;
            });
            client.on("l2update", (update, market) => {
                result.update = update;
                result.updateMarket = market;
                if (
                // check if done override method exists method in spec
                (!spec.l2update.done || spec.l2update.done(spec, result, update, market)) &&
                    // check if we require a snapshot
                    (!spec.l2update.hasSnapshot || result.snapshot)) {
                    result.ready = true;
                    client.removeAllListeners("l2update");
                    done();
                }
            });
        })
            .timeout(60000)
            .retries(3);
        it("should unsubscribe from l2update", async () => {
            for (const market of spec.markets) {
                client.unsubscribeLevel2Updates(market);
            }
            await (0, exports.wait)(spec.unsubWaitMs);
        });
        describe("results", () => {
            before(function () {
                if (!result.ready) {
                    this.skip();
                    return;
                }
            });
            if (spec.l2update.hasSnapshot) {
                it("snapshot market should be the subscribing market", () => {
                    (0, chai_1.expect)(result.snapMarket).to.be.oneOf(spec.markets);
                });
                testLevel2Result(spec, result, "snapshot");
            }
            it("update market should be the subscribing market", () => {
                (0, chai_1.expect)(result.updateMarket).to.be.oneOf(spec.markets);
            });
            testLevel2Result(spec, result, "update");
            if (spec.l2update.tests) {
                spec.l2update.tests(spec, result);
            }
        });
    });
}
function testLevel2Result(spec, result, type) {
    it(`${type}.exchange should be the exchange name`, () => {
        (0, chai_1.expect)(result[type].exchange).to.equal(spec.exchangeName);
    });
    it(`${type}.base should match market.base`, () => {
        (0, chai_1.expect)(result[type].base).to.be.oneOf(spec.marketBaseList);
    });
    it(`${type}.quote should match market.quote`, () => {
        (0, chai_1.expect)(result[type].quote).to.be.oneOf(spec.marketQuoteList);
    });
    if (spec[`l2${type}`].hasTimestampMs) {
        testTimestampMs(result, `${type}.timestampMs`);
    }
    else {
        testUndefined(result, `${type}.timestampMs`);
    }
    if (spec[`l2${type}`].hasSequenceId) {
        testPositiveNumber(result, `${type}.sequenceId`);
    }
    else {
        testUndefined(result, `${type}.sequenceId`);
    }
    if (spec[`l2${type}`].hasLastSequenceId) {
        testPositiveNumber(result, `${type}.lastSequenceId`);
    }
    if (spec[`l2${type}`].hasEventMs) {
        testTimestampMs(result, `${type}.eventMs`);
    }
    else {
        testUndefined(result, `${type}.eventMs`);
    }
    if (spec[`l2${type}`].hasEventId) {
        testPositiveNumber(result, `${type}.eventId`);
    }
    else {
        testUndefined(result, `${type}.eventId`);
    }
    it(`${type}.bid/ask.price should be a string`, () => {
        const actual = (result[type].bids[0] || result[type].asks[0]).price;
        (0, chai_1.expect)(actual).to.be.a("string");
    });
    it(`${type}.bid/ask.price should parse to a number`, () => {
        const actual = (result[type].bids[0] || result[type].asks[0]).price;
        (0, chai_1.expect)(parseFloat(actual)).to.not.be.NaN;
    });
    it(`${type}.bid/ask.size should be a string`, () => {
        const actual = (result[type].bids[0] || result[type].asks[0]).size;
        (0, chai_1.expect)(actual).to.be.a("string");
    });
    it(`${type}.bid/ask.size should parse to a number`, () => {
        const actual = (result[type].bids[0] || result[type].asks[0]).size;
        (0, chai_1.expect)(parseFloat(actual)).to.not.be.NaN;
    });
    if (spec[`l2${type}`].hasCount) {
        it(`${type}.bid/ask.count should be a string`, () => {
            const actual = (result[type].bids[0] || result[type].asks[0]).count;
            (0, chai_1.expect)(actual).to.be.a("string");
        });
        it(`${type}.bid/ask.count should parse to a number`, () => {
            const actual = (result[type].bids[0] || result[type].asks[0]).count;
            (0, chai_1.expect)(parseFloat(actual)).to.not.be.NaN;
        });
    }
    else {
        it(`${type}.bid/ask.count should undefined`, () => {
            const actual = (result[type].bids[0] || result[type].asks[0]).count;
            (0, chai_1.expect)(actual).to.be.undefined;
        });
    }
}
function testLevel3Updates(spec, state) {
    describe("subscribeLevel3Updates", () => {
        const result = {
            ready: false,
        };
        let client;
        before(() => {
            client = state.client;
        });
        it("should subscribe and emit a l3update", done => {
            for (const market of spec.markets) {
                client.subscribeLevel3Updates(market);
            }
            client.on("l3snapshot", (snapshot, market) => {
                result.snapshot = snapshot;
                result.market = market;
            });
            client.on("l3update", (update, market) => {
                result.update = update;
                result.market = market;
                try {
                    if (
                    // check if done override method exists method in spec
                    (!spec.l3update.done || spec.l3update.done(spec, result, update, market)) &&
                        // check if we require a snapshot
                        (!spec.l3update.hasSnapshot || result.snapshot)) {
                        result.ready = true;
                        client.removeAllListeners("l3update");
                        done();
                    }
                }
                catch (ex) {
                    client.removeAllListeners("l3update");
                    done(ex);
                }
            });
        })
            .timeout(60000)
            .retries(3);
        it("should unsubscribe from l3update", async () => {
            for (const market of spec.markets) {
                client.unsubscribeLevel3Updates(market);
            }
            await (0, exports.wait)(spec.unsubWaitMs);
        });
        describe("results", () => {
            before(function () {
                if (!result.ready)
                    return this.skip();
            });
            it("market should be the subscribing market", () => {
                (0, chai_1.expect)(result.market).to.be.oneOf(spec.markets);
            });
            if (spec.l3update.hasSnapshot) {
                testLevel3Result(spec, result, "snapshot");
            }
            testLevel3Result(spec, result, "update");
        });
    });
}
function testLevel3Result(spec, result, type) {
    it(`${type}.exchange should be the exchange name`, () => {
        (0, chai_1.expect)(result[type].exchange).to.equal(spec.exchangeName);
    });
    it(`${type}.base should match market.base`, () => {
        (0, chai_1.expect)(result[type].base).to.be.oneOf(spec.marketBaseList);
    });
    it(`${type}.quote should match market.quote`, () => {
        (0, chai_1.expect)(result[type].quote).to.be.oneOf(spec.marketQuoteList);
    });
    if (spec[`l3${type}`].hasTimestampMs) {
        testTimestampMs(result, `${type}.timestampMs`);
    }
    else {
        testUndefined(result, `${type}.timestampMs`);
    }
    if (spec[`l3${type}`].hasSequenceId) {
        testPositiveNumber(result, `${type}.sequenceId`);
    }
    else {
        testUndefined(result, `${type}.sequenceId`);
    }
    it(`${type}.bid/ask.orderId should be a string`, () => {
        const actual = (result[type].bids[0] || result[type].asks[0]).orderId;
        (0, chai_1.expect)(actual).to.be.a("string");
    });
    if (spec[`l3${type}`].orderIdPattern) {
        it(`${type}.bid/ask.orderId should match ${spec[`l3${type}`].orderIdPattern}`, () => {
            const actual = (result[type].bids[0] || result[type].asks[0]).orderId;
            (0, chai_1.expect)(actual).to.match(spec[`l3${type}`].orderIdPattern);
        });
    }
    it(`${type}.bid/ask.price should be a string`, () => {
        const actual = (result[type].bids[0] || result[type].asks[0]).price;
        (0, chai_1.expect)(actual).to.be.a("string");
    });
    it(`${type}.bid/ask.price should parse to a number`, () => {
        const actual = (result[type].bids[0] || result[type].asks[0]).price;
        (0, chai_1.expect)(parseFloat(actual)).to.not.be.NaN;
    });
    it(`${type}.bid/ask.size should be a string`, () => {
        const actual = (result[type].bids[0] || result[type].asks[0]).size;
        (0, chai_1.expect)(actual).to.be.a("string");
    });
    it(`${type}.bid/ask.size should parse to a number`, () => {
        const actual = (result[type].bids[0] || result[type].asks[0]).size;
        (0, chai_1.expect)(parseFloat(actual)).to.not.be.NaN;
    });
}
//////////////////////////////////////////////////////
function testPositiveNumber(result, prop) {
    it(`${prop} should be a number`, () => {
        const actual = deepValue(result, prop);
        (0, chai_1.expect)(actual).to.be.a("number");
    });
    it(`${prop} should be positive`, () => {
        const actual = deepValue(result, prop);
        (0, chai_1.expect)(actual).to.be.gte(0);
    });
}
function testNumberString(result, prop) {
    it(`${prop} should be a string`, () => {
        const actual = deepValue(result, prop);
        (0, chai_1.expect)(actual).to.be.a("string");
    });
    it(`${prop} should parse to a number`, () => {
        const actual = deepValue(result, prop);
        (0, chai_1.expect)(parseFloat(actual)).to.not.be.NaN;
    });
}
function testUndefined(result, propPath) {
    it(`${propPath} should be undefined`, () => {
        const actual = deepValue(result, propPath);
        (0, chai_1.expect)(actual).to.be.undefined;
    });
}
function testTimestampMs(result, propPath) {
    it(`${propPath} should be a number`, () => {
        const actual = deepValue(result, propPath);
        (0, chai_1.expect)(actual).to.be.a("number");
    });
    it(`${propPath} should be in milliseconds`, () => {
        const actual = deepValue(result, propPath);
        (0, chai_1.expect)(actual).to.be.greaterThan(1531677480000);
    });
}
function testString(result, propPath) {
    it(`${propPath} should be a string`, () => {
        const actual = deepValue(result, propPath);
        (0, chai_1.expect)(actual).to.be.a("string");
    });
    it(`${propPath} should not be empty`, () => {
        const actual = deepValue(result, propPath);
        (0, chai_1.expect)(actual).to.not.equal("");
    });
}
function deepValue(obj, path) {
    const parts = path.split(".");
    let result = obj;
    for (const part of parts) {
        result = result[part];
    }
    return result;
}
//# sourceMappingURL=TestRunner.js.map