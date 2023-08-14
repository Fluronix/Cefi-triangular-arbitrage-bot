"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.candlePeriod = exports.BinanceBase = void 0;
/**
 * Binance now (as of Nov 2019) has the ability to perform live subscribes using
 * a single socket. With this functionality, there is no longer a need to
 * use the URL-mutation code and we can use a BasicClient and allow subscribing
 * and unsubscribing.
 *
 * Binance allows subscribing to many streams at the same time, however there is
 * a max payload length that cannot be exceeded. This requires the use of a
 * subscription batching method.
 *
 * Binance limits the number of messages that can be sent as well so throttling
 * of batched sends must be performed.
 *
 * _sendSubTrades calls _batchSub
 * _batchSub uses the `batch` flow control helper to batch all calls on the
 *    same tick into a single call
 * _batchSub calls _sendMessage
 * _sendMessage uses the `throttle` flow controler helper to limit calls to
 *    1 per second
 *
 */
const BasicClient_1 = require("../BasicClient");
const Candle_1 = require("../Candle");
const CandlePeriod_1 = require("../CandlePeriod");
const Batch_1 = require("../flowcontrol/Batch");
const Throttle_1 = require("../flowcontrol/Throttle");
const Level2Point_1 = require("../Level2Point");
const Level2Snapshots_1 = require("../Level2Snapshots");
const Ticker_1 = require("../Ticker");
const Trade_1 = require("../Trade");
const Level2Update_1 = require("../Level2Update");
const https = __importStar(require("../Https"));
class BinanceBase extends BasicClient_1.BasicClient {
    constructor({ name, wssPath, restL2SnapshotPath, watcherMs = 30000, useAggTrades = true, requestSnapshot = true, socketBatchSize = 200, socketThrottleMs = 1000, restThrottleMs = 1000, l2updateSpeed = "", l2snapshotSpeed = "", batchTickers = true, } = {}) {
        super(wssPath, name, undefined, watcherMs);
        this._restL2SnapshotPath = restL2SnapshotPath;
        this.useAggTrades = useAggTrades;
        this.l2updateSpeed = l2updateSpeed;
        this.l2snapshotSpeed = l2snapshotSpeed;
        this.requestSnapshot = requestSnapshot;
        this.hasTickers = true;
        this.hasTrades = true;
        this.hasCandles = true;
        this.hasLevel2Snapshots = true;
        this.hasLevel2Updates = true;
        this.batchTickers = batchTickers;
        this._messageId = 0;
        this._tickersActive = false;
        this.candlePeriod = CandlePeriod_1.CandlePeriod._1m;
        this._batchSub = (0, Batch_1.batch)(this.__batchSub.bind(this), socketBatchSize);
        this._batchUnsub = (0, Batch_1.batch)(this.__batchUnsub.bind(this), socketBatchSize);
        this._sendMessage = (0, Throttle_1.throttle)(this.__sendMessage.bind(this), socketThrottleMs);
        this._requestLevel2Snapshot = (0, Throttle_1.throttle)(this.__requestLevel2Snapshot.bind(this), restThrottleMs);
    }
    //////////////////////////////////////////////
    _onClosing() {
        this._tickersActive = false;
        this._batchSub.cancel();
        this._batchUnsub.cancel();
        this._sendMessage.cancel();
        this._requestLevel2Snapshot.cancel();
        super._onClosing();
    }
    _sendSubTicker(remote_id) {
        if (this.batchTickers) {
            if (this._tickersActive)
                return;
            this._tickersActive = true;
            this._wss.send(JSON.stringify({
                method: "SUBSCRIBE",
                params: ["!ticker@arr"],
                id: ++this._messageId,
            }));
        }
        else {
            this._wss.send(JSON.stringify({
                method: "SUBSCRIBE",
                params: [`${remote_id.toLowerCase()}@ticker`],
                id: ++this._messageId,
            }));
        }
    }
    _sendUnsubTicker(remote_id) {
        if (this.batchTickers) {
            if (this._tickerSubs.size > 1)
                return;
            this._tickersActive = false;
            this._wss.send(JSON.stringify({
                method: "UNSUBSCRIBE",
                params: ["!ticker@arr"],
                id: ++this._messageId,
            }));
        }
        else {
            this._wss.send(JSON.stringify({
                method: "UNSUBSCRIBE",
                params: [`${remote_id.toLowerCase()}@ticker`],
                id: ++this._messageId,
            }));
        }
    }
    __batchSub(args) {
        const params = args.map(p => p[0]);
        const id = ++this._messageId;
        const msg = JSON.stringify({
            method: "SUBSCRIBE",
            params,
            id,
        });
        this._sendMessage(msg);
    }
    __batchUnsub(args) {
        const params = args.map(p => p[0]);
        const id = ++this._messageId;
        const msg = JSON.stringify({
            method: "UNSUBSCRIBE",
            params,
            id,
        });
        this._sendMessage(msg);
    }
    __sendMessage(msg) {
        this._wss.send(msg);
    }
    _sendSubTrades(remote_id) {
        const stream = remote_id.toLowerCase() + (this.useAggTrades ? "@aggTrade" : "@trade");
        this._batchSub(stream);
    }
    _sendUnsubTrades(remote_id) {
        const stream = remote_id.toLowerCase() + (this.useAggTrades ? "@aggTrade" : "@trade");
        this._batchUnsub(stream);
    }
    _sendSubCandles(remote_id) {
        const stream = remote_id.toLowerCase() + "@kline_" + candlePeriod(this.candlePeriod);
        this._batchSub(stream);
    }
    _sendUnsubCandles(remote_id) {
        const stream = remote_id.toLowerCase() + "@kline_" + candlePeriod(this.candlePeriod);
        this._batchUnsub(stream);
    }
    _sendSubLevel2Snapshots(remote_id) {
        const stream = remote_id.toLowerCase() +
            "@depth20" +
            (this.l2snapshotSpeed ? `@${this.l2snapshotSpeed}` : "");
        this._batchSub(stream);
    }
    _sendUnsubLevel2Snapshots(remote_id) {
        const stream = remote_id.toLowerCase() +
            "@depth20" +
            (this.l2snapshotSpeed ? `@${this.l2snapshotSpeed}` : "");
        this._batchUnsub(stream);
    }
    _sendSubLevel2Updates(remote_id) {
        if (this.requestSnapshot)
            this._requestLevel2Snapshot(this._level2UpdateSubs.get(remote_id));
        const stream = remote_id.toLowerCase() +
            "@depth" +
            (this.l2updateSpeed ? `@${this.l2updateSpeed}` : "");
        this._batchSub(stream);
    }
    _sendUnsubLevel2Updates(remote_id) {
        const stream = remote_id.toLowerCase() +
            "@depth" +
            (this.l2updateSpeed ? `@${this.l2updateSpeed}` : "");
        this._batchUnsub(stream);
    }
    _sendSubLevel3Snapshots() {
        throw new Error("Method not implemented.");
    }
    _sendUnsubLevel3Snapshots() {
        throw new Error("Method not implemented.");
    }
    _sendSubLevel3Updates() {
        throw new Error("Method not implemented.");
    }
    _sendUnsubLevel3Updates() {
        throw new Error("Method not implemented.");
    }
    /////////////////////////////////////////////
    _onMessage(raw) {
        const msg = JSON.parse(raw);
        // subscribe/unsubscribe responses
        if (msg.result === null && msg.id) {
            // console.log(msg);
            return;
        }
        // errors
        if (msg.error) {
            const error = new Error(msg.error.msg);
            error.msg = msg;
            this.emit("error", error);
        }
        // All code past this point relies on msg.stream in some manner. This code
        // acts as a guard on msg.stream and aborts prematurely if the property is
        // not available.
        if (!msg.stream) {
            return;
        }
        // ticker
        if (msg.stream === "!ticker@arr") {
            for (const raw of msg.data) {
                const remote_id = raw.s;
                const market = this._tickerSubs.get(remote_id);
                if (!market)
                    continue;
                const ticker = this._constructTicker(raw, market);
                this.emit("ticker", ticker, market);
            }
            return;
        }
        // trades
        if (msg.stream.toLowerCase().endsWith("trade")) {
            const remote_id = msg.data.s;
            const market = this._tradeSubs.get(remote_id);
            if (!market)
                return;
            const trade = this.useAggTrades
                ? this._constructAggTrade(msg, market)
                : this._constructRawTrade(msg, market);
            this.emit("trade", trade, market);
            return;
        }
        // candle
        if (msg.data.e === "kline") {
            const remote_id = msg.data.s;
            const market = this._candleSubs.get(remote_id);
            if (!market)
                return;
            const candle = this._constructCandle(msg);
            this.emit("candle", candle, market);
            return;
        }
        // l2snapshot
        if (msg.stream.match(/@depth20/)) {
            const remote_id = msg.stream.split("@")[0].toUpperCase();
            const market = this._level2SnapshotSubs.get(remote_id);
            if (!market)
                return;
            const snapshot = this._constructLevel2Snapshot(msg, market);
            this.emit("l2snapshot", snapshot, market);
            return;
        }
        // l2update
        if (msg.stream.match(/@depth/)) {
            const remote_id = msg.stream.split("@")[0].toUpperCase();
            const market = this._level2UpdateSubs.get(remote_id);
            if (!market)
                return;
            const update = this._constructLevel2Update(msg, market);
            this.emit("l2update", update, market);
            return;
        }
    }
    _constructTicker(msg, market) {
        const { E: timestamp, c: last, v: volume, q: quoteVolume, h: high, l: low, p: change, P: changePercent, a: ask, A: askVolume, b: bid, B: bidVolume, } = msg;
        const open = parseFloat(last) + parseFloat(change);
        return new Ticker_1.Ticker({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestamp: timestamp,
            last,
            open: open.toFixed(8),
            high,
            low,
            volume,
            quoteVolume,
            change,
            changePercent,
            bid,
            bidVolume,
            ask,
            askVolume,
        });
    }
    _constructAggTrade({ data }, market) {
        const { a: trade_id, p: price, q: size, T: time, m: buyer } = data;
        const unix = time;
        const amount = size;
        const side = buyer ? "buy" : "sell";
        return new Trade_1.Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            tradeId: trade_id.toFixed(),
            unix,
            side,
            price,
            amount,
        });
    }
    _constructRawTrade({ data }, market) {
        const { t: trade_id, p: price, q: size, b: buyOrderId, a: sellOrderId, T: time, m: buyer, } = data;
        const unix = time;
        const amount = size;
        const side = buyer ? "buy" : "sell";
        return new Trade_1.Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            tradeId: trade_id,
            unix,
            side,
            price,
            amount,
            buyOrderId,
            sellOrderId,
        });
    }
    /**
   * Kline data looks like:
   { stream: 'btcusdt@kline_1m',
    data:
    { e: 'kline',
      E: 1571068845689,
      s:  'BTCUSDT',
      k:
        { t: 1571068800000,
          T: 1571068859999,
          s: 'BTCUSDT',
          i: '1m',
          f: 189927800,
          L: 189928107,
          o: '8254.05000000',
          c: '8253.61000000',
          h: '8256.58000000',
          l: '8250.93000000',
          v: '19.10571600',
          n: 308,
          x: false,
          q: '157694.32610840',
          V: '8.19456200',
          Q: '67640.56793106',
          B: '0' } } }
   */
    _constructCandle({ data }) {
        const k = data.k;
        return new Candle_1.Candle(k.t, k.o, k.h, k.l, k.c, k.v);
    }
    _constructLevel2Snapshot(msg, market) {
        const sequenceId = msg.data.lastUpdateId;
        const asks = msg.data.asks.map(p => new Level2Point_1.Level2Point(p[0], p[1]));
        const bids = msg.data.bids.map(p => new Level2Point_1.Level2Point(p[0], p[1]));
        return new Level2Snapshots_1.Level2Snapshot({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            sequenceId,
            asks,
            bids,
        });
    }
    /**
   {
      "e": "depthUpdate", // Event type
      "E": 123456789,     // Event time
      "s": "BNBBTC",      // Symbol
      "U": 157,           // First update ID in event
      "u": 160,           // Final update ID in event
      "b": [              // Bids to be updated
        [
          "0.0024",       // Price level to be updated
          "10"            // Quantity
        ]
      ],
      "a": [              // Asks to be updated
        [
          "0.0026",       // Price level to be updated
          "100"           // Quantity
        ]
      ]
    }
   */
    _constructLevel2Update(msg, market) {
        const eventMs = msg.data.E;
        const sequenceId = msg.data.U;
        const lastSequenceId = msg.data.u;
        const asks = msg.data.a.map(p => new Level2Point_1.Level2Point(p[0], p[1]));
        const bids = msg.data.b.map(p => new Level2Point_1.Level2Point(p[0], p[1]));
        return new Level2Update_1.Level2Update({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            sequenceId,
            lastSequenceId,
            eventMs,
            asks,
            bids,
        });
    }
    async __requestLevel2Snapshot(market) {
        let failed = false;
        try {
            const remote_id = market.id;
            const uri = `${this._restL2SnapshotPath}?limit=1000&symbol=${remote_id}`;
            const raw = (await https.get(uri));
            const sequenceId = raw.lastUpdateId;
            const timestampMs = raw.E;
            const asks = raw.asks.map(p => new Level2Point_1.Level2Point(p[0], p[1]));
            const bids = raw.bids.map(p => new Level2Point_1.Level2Point(p[0], p[1]));
            const snapshot = new Level2Snapshots_1.Level2Snapshot({
                exchange: this.name,
                base: market.base,
                quote: market.quote,
                sequenceId,
                timestampMs,
                asks,
                bids,
            });
            this.emit("l2snapshot", snapshot, market);
        }
        catch (ex) {
            this.emit("error", ex);
            failed = true;
        }
        finally {
            if (failed)
                this._requestLevel2Snapshot(market);
        }
    }
}
exports.BinanceBase = BinanceBase;
function candlePeriod(p) {
    switch (p) {
        case CandlePeriod_1.CandlePeriod._1m:
            return "1m";
        case CandlePeriod_1.CandlePeriod._3m:
            return "3m";
        case CandlePeriod_1.CandlePeriod._5m:
            return "5m";
        case CandlePeriod_1.CandlePeriod._15m:
            return "15m";
        case CandlePeriod_1.CandlePeriod._30m:
            return "30m";
        case CandlePeriod_1.CandlePeriod._1h:
            return "1h";
        case CandlePeriod_1.CandlePeriod._2h:
            return "2h";
        case CandlePeriod_1.CandlePeriod._4h:
            return "4h";
        case CandlePeriod_1.CandlePeriod._6h:
            return "6h";
        case CandlePeriod_1.CandlePeriod._8h:
            return "8h";
        case CandlePeriod_1.CandlePeriod._12h:
            return "12h";
        case CandlePeriod_1.CandlePeriod._1d:
            return "1d";
        case CandlePeriod_1.CandlePeriod._3d:
            return "3d";
        case CandlePeriod_1.CandlePeriod._1w:
            return "1w";
        case CandlePeriod_1.CandlePeriod._1M:
            return "1M";
    }
}
exports.candlePeriod = candlePeriod;
//# sourceMappingURL=BinanceBase.js.map