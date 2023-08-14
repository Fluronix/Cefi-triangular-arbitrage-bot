"use strict";
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
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
exports.BittrexClient = void 0;
const moment = require("moment");
const BasicClient_1 = require("../BasicClient");
const Candle_1 = require("../Candle");
const CandlePeriod_1 = require("../CandlePeriod");
const Throttle_1 = require("../flowcontrol/Throttle");
const Level2Point_1 = require("../Level2Point");
const Level2Snapshots_1 = require("../Level2Snapshots");
const Level2Update_1 = require("../Level2Update");
const NotImplementedFn_1 = require("../NotImplementedFn");
const SmartWss_1 = require("../SmartWss");
const Ticker_1 = require("../Ticker");
const Trade_1 = require("../Trade");
const Util_1 = require("../Util");
const https = __importStar(require("../Https"));
const zlib = __importStar(require("../ZlibUtils"));
/**
 * Implements the v3 API:
 * https://bittrex.github.io/api/v3#topic-Synchronizing
 * https://bittrex.github.io/guides/v3/upgrade
 *
 * This client uses SignalR and requires a custom connection strategy to
 * obtain a socket. Otherwise, things are relatively the same vs a
 * standard client.
 */
class BittrexClient extends BasicClient_1.BasicClient {
    constructor({ wssPath, watcherMs = 15000, throttleL2Snapshot = 100 } = {}) {
        super(wssPath, "Bittrex", undefined, watcherMs);
        this._sendSubLevel2Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel2Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this.hasTickers = true;
        this.hasTrades = true;
        this.hasCandles = true;
        this.hasLevel2Snapshots = false;
        this.hasLevel2Updates = true;
        this.hasLevel3Snapshots = false;
        this.hasLevel3Updates = false;
        this.candlePeriod = CandlePeriod_1.CandlePeriod._1m;
        this.orderBookDepth = 500;
        this.connectInitTimeoutMs = 5000;
        this._subbedTickers = false;
        this._messageId = 0;
        this._processTickers = this._processTickers.bind(this);
        this._processTrades = this._processTrades.bind(this);
        this._processCandles = this._processCandles.bind(this);
        this._processLevel2Update = this._processLevel2Update.bind(this);
        this._requestLevel2Snapshot = (0, Throttle_1.throttle)(this.__requestLevel2Snapshot.bind(this), throttleL2Snapshot);
    }
    ////////////////////////////////////
    // PROTECTED
    _beforeConnect() {
        this._wss.on("connected", () => this._sendHeartbeat());
    }
    _beforeClose() {
        this._subbedTickers = false;
        this._requestLevel2Snapshot.cancel();
    }
    _sendHeartbeat() {
        this._wss.send(JSON.stringify({
            H: "c3",
            M: "Subscribe",
            A: [["heartbeat"]],
            I: ++this._messageId,
        }));
    }
    _sendSubTicker() {
        if (this._subbedTickers)
            return;
        this._subbedTickers = true;
        this._wss.send(JSON.stringify({
            H: "c3",
            M: "Subscribe",
            A: [["market_summaries"]],
            I: ++this._messageId,
        }));
    }
    _sendUnsubTicker() {
        // no-op
    }
    _sendSubTrades(remote_id) {
        this._wss.send(JSON.stringify({
            H: "c3",
            M: "Subscribe",
            A: [[`trade_${remote_id}`]],
            I: ++this._messageId,
        }));
    }
    _sendUnsubTrades(remote_id) {
        this._wss.send(JSON.stringify({
            H: "c3",
            M: "Unsubscribe",
            A: [[`trade_${remote_id}`]],
            I: ++this._messageId,
        }));
    }
    _sendSubCandles(remote_id) {
        this._wss.send(JSON.stringify({
            H: "c3",
            M: "Subscribe",
            A: [[`candle_${remote_id}_${candlePeriod(this.candlePeriod)}`]],
            I: ++this._messageId,
        }));
    }
    _sendUnsubCandles(remote_id) {
        this._wss.send(JSON.stringify({
            H: "c3",
            M: "Unsubscribe",
            A: [[`candle_${remote_id}_${candlePeriod(this.candlePeriod)}`]],
            I: ++this._messageId,
        }));
    }
    _sendSubLevel2Updates(remote_id, market) {
        this._requestLevel2Snapshot(market);
        this._wss.send(JSON.stringify({
            H: "c3",
            M: "Subscribe",
            A: [[`orderbook_${remote_id}_${this.orderBookDepth}`]],
            I: ++this._messageId,
        }));
    }
    _sendUnsubLevel2Updates(remote_id) {
        this._wss.send(JSON.stringify({
            H: "c3",
            M: "Subscribe",
            A: [[`orderbook_${remote_id}_${this.orderBookDepth}`]],
            I: ++this._messageId,
        }));
    }
    /**
     * Requires connecting to SignalR which has a whole BS negotiation
     * to obtain a token, similar to Kucoin actually.
     */
    _connect() {
        if (!this._wss) {
            this._wss = { status: "connecting" };
            this._connectAsync();
        }
    }
    /**
     * Asynchronously connect to a socket. This method will retrieve a token
     * from an HTTP request and then construct a websocket. If the HTTP
     * request fails, it will retry until successful.
     */
    async _connectAsync() {
        let wssPath = this.wssPath;
        // Retry HTTP requests until we are successful
        while (!wssPath) {
            try {
                const data = JSON.stringify([{ name: "c3" }]);
                const negotiations = await https.get(`https://socket-v3.bittrex.com/signalr/negotiate?connectionData=${data}&clientProtocol=1.5`);
                const token = encodeURIComponent(negotiations.ConnectionToken);
                wssPath = `wss://socket-v3.bittrex.com/signalr/connect?clientProtocol=1.5&transport=webSockets&connectionToken=${token}&connectionData=${data}&tid=10`;
            }
            catch (ex) {
                await (0, Util_1.wait)(this.connectInitTimeoutMs);
                this._onError(ex);
            }
        }
        // Construct a socket and bind all events
        const wss = new SmartWss_1.SmartWss(wssPath);
        this._wss = wss;
        this._wss.on("error", this._onError.bind(this));
        this._wss.on("connecting", this._onConnecting.bind(this));
        this._wss.on("connected", this._onConnected.bind(this));
        this._wss.on("disconnected", this._onDisconnected.bind(this));
        this._wss.on("closing", this._onClosing.bind(this));
        this._wss.on("closed", this._onClosed.bind(this));
        this._wss.on("message", msg => {
            try {
                this._onMessage(msg);
            }
            catch (ex) {
                this._onError(ex);
            }
        });
        if (this._beforeConnect)
            this._beforeConnect();
        this._wss.connect();
    }
    _onMessage(raw) {
        const fullMsg = JSON.parse(raw);
        // Handle responses
        // {"R":[{"Success":true,"ErrorCode":null},{"Success":true,"ErrorCode":null}],"I":1}
        if (fullMsg.R) {
            for (const msg of fullMsg.R) {
                if (!msg.Success) {
                    this.emit("error", new Error("Subscription failed with error " + msg.ErrorCode));
                }
            }
        }
        // Handle messages
        if (!fullMsg.M)
            return;
        for (const msg of fullMsg.M) {
            if (msg.M === "heartbeat") {
                this._watcher.markAlive();
            }
            if (msg.M === "marketSummaries") {
                for (const a of msg.A) {
                    zlib.inflateRaw(Buffer.from(a, "base64"), this._processTickers);
                }
            }
            if (msg.M === "trade") {
                for (const a of msg.A) {
                    zlib.inflateRaw(Buffer.from(a, "base64"), this._processTrades);
                }
            }
            if (msg.M === "candle") {
                for (const a of msg.A) {
                    zlib.inflateRaw(Buffer.from(a, "base64"), this._processCandles);
                }
            }
            if (msg.M === "orderBook") {
                for (const a of msg.A) {
                    zlib.inflateRaw(Buffer.from(a, "base64"), this._processLevel2Update);
                }
            }
        }
    }
    /**
   {
      "sequence": 3584000,
      "deltas": [
        {
          symbol: 'BTC-USDT',
          high: '12448.02615735',
          low: '11773.32163568',
          volume: '640.86060471',
          quoteVolume: '7714634.67704918',
          percentChange: '3.98',
          updatedAt: '2020-08-17T20:16:27.617Z'
        }
      ]
    }
   */
    _processTickers(err, raw) {
        if (err) {
            this.emit("error", err);
            return;
        }
        let msg;
        try {
            msg = JSON.parse(raw);
        }
        catch (ex) {
            this.emit("error", ex);
            return;
        }
        for (const datum of msg.deltas) {
            const market = this._tickerSubs.get(datum.symbol);
            if (!market)
                continue;
            const ticker = this._constructTicker(datum, market);
            this.emit("ticker", ticker, market);
        }
    }
    _constructTicker(msg, market) {
        const { high, low, volume, quoteVolume, percentChange, updatedAt } = msg;
        return new Ticker_1.Ticker({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestamp: moment.utc(updatedAt).valueOf(),
            last: undefined,
            open: undefined,
            high: high,
            low: low,
            volume: volume,
            quoteVolume: quoteVolume,
            change: undefined,
            changePercent: percentChange,
            bid: undefined,
            ask: undefined,
        });
    }
    /**
   {
      deltas: [
        {
          id: 'edacd990-7c5f-4c75-8a66-ce0a71093b3c',
          executedAt: '2020-08-17T20:36:39.96Z',
          quantity: '0.00714818',
          rate: '12301.34800000',
          takerSide: 'BUY'
        }
      ],
      sequence: 18344,
      marketSymbol: 'BTC-USDT'
    }
   */
    _processTrades(err, raw) {
        if (err) {
            this.emit("error", err);
            return;
        }
        let msg;
        try {
            msg = JSON.parse(raw);
        }
        catch (ex) {
            this.emit("error", ex);
            return;
        }
        const market = this._tradeSubs.get(msg.marketSymbol);
        if (!market)
            return;
        for (const datum of msg.deltas) {
            const trade = this._constructTrade(datum, market);
            this.emit("trade", trade, market);
        }
    }
    _constructTrade(msg, market) {
        const tradeId = msg.id;
        const unix = moment.utc(msg.executedAt).valueOf();
        const price = msg.rate;
        const amount = msg.quantity;
        const side = msg.takerSide === "BUY" ? "buy" : "sell";
        return new Trade_1.Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            tradeId,
            unix,
            side,
            price,
            amount,
        });
    }
    /**
   {
      sequence: 10808,
      marketSymbol: 'BTC-USDT',
      interval: 'MINUTE_1',
      delta: {
        startsAt: '2020-08-17T20:47:00Z',
        open: '12311.59599999',
        high: '12311.59599999',
        low: '12301.57150000',
        close: '12301.57150000',
        volume: '1.65120614',
        quoteVolume: '20319.96359337'
      }
    }
   */
    _processCandles(err, raw) {
        if (err) {
            this.emit("error", err);
            return;
        }
        let msg;
        try {
            msg = JSON.parse(raw);
        }
        catch (ex) {
            this.emit("error", ex);
            return;
        }
        const market = this._candleSubs.get(msg.marketSymbol);
        if (!market)
            return;
        const candle = this._constructCandle(msg.delta);
        this.emit("candle", candle, market);
    }
    _constructCandle(msg) {
        return new Candle_1.Candle(moment.utc(msg.startsAt).valueOf(), msg.open, msg.high, msg.low, msg.close, msg.volume);
    }
    /**
   {
      marketSymbol: 'BTC-USDT',
      depth: 500,
      sequence: 545851,
      bidDeltas: [
        { quantity: '0', rate: '12338.47320003' },
        { quantity: '0.01654433', rate: '10800.62000000' }
      ],
      askDeltas: []
    }
   */
    _processLevel2Update(err, raw) {
        if (err) {
            this.emit("error", err);
            return;
        }
        let msg;
        try {
            msg = JSON.parse(raw);
        }
        catch (ex) {
            this.emit("error", ex);
            return;
        }
        const market = this._level2UpdateSubs.get(msg.marketSymbol);
        if (!market)
            return;
        const update = this._constructLevel2Update(msg, market);
        this.emit("l2update", update, market);
    }
    _constructLevel2Update(msg, market) {
        const sequenceId = msg.sequence;
        const depth = msg.depth;
        const bids = msg.bidDeltas.map(p => new Level2Point_1.Level2Point(p.rate, p.quantity, undefined, { depth }));
        const asks = msg.askDeltas.map(p => new Level2Point_1.Level2Point(p.rate, p.quantity, undefined, { depth }));
        return new Level2Update_1.Level2Update({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            sequenceId,
            asks,
            bids,
        });
    }
    async __requestLevel2Snapshot(market) {
        let failed;
        try {
            const remote_id = market.id;
            const uri = `https://api.bittrex.com/v3/markets/${remote_id}/orderbook?depth=${this.orderBookDepth}`;
            const { data, response } = await https.getResponse(uri);
            const raw = data;
            const sequence = +response.headers.sequence;
            const asks = raw.ask.map(p => new Level2Point_1.Level2Point(p.rate, p.quantity));
            const bids = raw.bid.map(p => new Level2Point_1.Level2Point(p.rate, p.quantity));
            const snapshot = new Level2Snapshots_1.Level2Snapshot({
                exchange: this.name,
                base: market.base,
                quote: market.quote,
                sequenceId: sequence,
                asks,
                bids,
            });
            this.emit("l2snapshot", snapshot, market);
        }
        catch (ex) {
            const err = new Error("L2Snapshot failed");
            err.inner = ex.message;
            err.market = market;
            this.emit("error", err);
            failed = err;
        }
        finally {
            if (failed && failed.inner.indexOf("MARKET_DOES_NOT_EXIST") === -1) {
                this._requestLevel2Snapshot(market);
            }
        }
    }
}
exports.BittrexClient = BittrexClient;
function candlePeriod(period) {
    switch (period) {
        case CandlePeriod_1.CandlePeriod._1m:
            return "MINUTE_1";
        case CandlePeriod_1.CandlePeriod._5m:
            return "MINUTE_5";
        case CandlePeriod_1.CandlePeriod._1h:
            return "HOUR_1";
        case CandlePeriod_1.CandlePeriod._1d:
            return "DAY_1";
    }
}
//# sourceMappingURL=BittrexClient.js.map