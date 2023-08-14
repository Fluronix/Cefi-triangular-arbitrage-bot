"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HitBtcClient = void 0;
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const moment_1 = __importDefault(require("moment"));
const BasicClient_1 = require("../BasicClient");
const Candle_1 = require("../Candle");
const CandlePeriod_1 = require("../CandlePeriod");
const Throttle_1 = require("../flowcontrol/Throttle");
const Level2Point_1 = require("../Level2Point");
const Level2Snapshots_1 = require("../Level2Snapshots");
const Level2Update_1 = require("../Level2Update");
const NotImplementedFn_1 = require("../NotImplementedFn");
const Ticker_1 = require("../Ticker");
const Trade_1 = require("../Trade");
class HitBtcClient extends BasicClient_1.BasicClient {
    constructor({ wssPath = "wss://api.hitbtc.com/api/2/ws", throttleMs = 25, watcherMs, } = {}) {
        super(wssPath, "HitBTC", undefined, watcherMs);
        this._sendSubLevel2Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel2Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this._id = 0;
        this.hasTickers = true;
        this.hasTrades = true;
        this.hasCandles = true;
        this.hasLevel2Updates = true;
        this.candlePeriod = CandlePeriod_1.CandlePeriod._1m;
        this._send = (0, Throttle_1.throttle)(this.__send.bind(this), throttleMs);
    }
    _beforeClose() {
        this._send.cancel();
    }
    __send(msg) {
        this._wss.send(msg);
    }
    _sendSubTicker(remote_id) {
        this._send(JSON.stringify({
            method: "subscribeTicker",
            params: {
                symbol: remote_id,
            },
            id: ++this._id,
        }));
    }
    _sendUnsubTicker(remote_id) {
        this._send(JSON.stringify({
            method: "unsubscribeTicker",
            params: {
                symbol: remote_id,
            },
        }));
    }
    _sendSubTrades(remote_id) {
        this._send(JSON.stringify({
            method: "subscribeTrades",
            params: {
                symbol: remote_id,
            },
            id: ++this._id,
        }));
    }
    _sendUnsubTrades(remote_id) {
        this._send(JSON.stringify({
            method: "unsubscribeTrades",
            params: {
                symbol: remote_id,
            },
        }));
    }
    _sendSubCandles(remote_id) {
        this._send(JSON.stringify({
            method: "subscribeCandles",
            params: {
                symbol: remote_id,
                period: candlePeriod(this.candlePeriod),
            },
            id: ++this._id,
        }));
    }
    _sendUnsubCandles(remote_id) {
        this._send(JSON.stringify({
            method: "unsubscribeCandles",
            params: {
                symbol: remote_id,
                period: candlePeriod(this.candlePeriod),
            },
        }));
    }
    _sendSubLevel2Updates(remote_id) {
        this._send(JSON.stringify({
            method: "subscribeOrderbook",
            params: {
                symbol: remote_id,
            },
            id: ++this._id,
        }));
    }
    _sendUnsubLevel2Updates(remote_id) {
        this._send(JSON.stringify({
            method: "unsubscribeOrderbook",
            params: {
                symbol: remote_id,
            },
        }));
    }
    _onMessage(raw) {
        const msg = JSON.parse(raw);
        // The payload for a subscribe confirm will include the id that
        // was attached in the JSON-RPC call creation.  For example:
        // { jsonrpc: '2.0', result: true, id: 7 }
        if (msg.result === true && msg.id) {
            // console.log(msg);
            // return;
        }
        // For unsubscribe calls, we are not including an id
        // so we can ignore messages that do not can an id value:
        // { jsonrpc: '2.0', result: true, id: null }
        if (msg.result !== undefined && msg.id) {
            return;
        }
        const remote_id = msg.params && msg.params.symbol;
        if (msg.method === "ticker") {
            const market = this._tickerSubs.get(remote_id);
            if (!market)
                return;
            const ticker = this._constructTicker(msg.params, market);
            this.emit("ticker", ticker, market);
        }
        if (msg.method === "updateTrades") {
            const market = this._tradeSubs.get(remote_id);
            if (!market)
                return;
            for (const datum of msg.params.data) {
                const trade = this._constructTradesFromMessage(datum, market);
                this.emit("trade", trade, market);
            }
            return;
        }
        if (msg.method === "updateCandles") {
            const market = this._candleSubs.get(remote_id);
            if (!market)
                return;
            for (const datum of msg.params.data) {
                const candle = this._constructCandle(datum);
                this.emit("candle", candle, market);
            }
        }
        if (msg.method === "snapshotOrderbook") {
            const market = this._level2UpdateSubs.get(remote_id); // coming from l2update sub
            if (!market)
                return;
            const result = this._constructLevel2Snapshot(msg.params, market);
            this.emit("l2snapshot", result, market);
            return;
        }
        if (msg.method === "updateOrderbook") {
            const market = this._level2UpdateSubs.get(remote_id);
            if (!market)
                return;
            const result = this._constructLevel2Update(msg.params, market);
            this.emit("l2update", result, market);
            return;
        }
    }
    _constructTicker(param, market) {
        const { ask, bid, last, open, low, high, volume, volumeQuote, timestamp } = param;
        const change = (parseFloat(last) - parseFloat(open)).toFixed(8);
        const changePercent = (((parseFloat(last) - parseFloat(open)) / parseFloat(open)) *
            100).toFixed(8);
        return new Ticker_1.Ticker({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestamp: moment_1.default.utc(timestamp).valueOf(),
            last,
            open,
            high,
            low,
            volume,
            quoteVolume: volumeQuote,
            ask,
            bid,
            change,
            changePercent,
        });
    }
    _constructTradesFromMessage(datum, market) {
        const { id, price, quantity, side, timestamp } = datum;
        const unix = (0, moment_1.default)(timestamp).valueOf();
        return new Trade_1.Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            tradeId: id.toFixed(),
            side,
            unix,
            price,
            amount: quantity,
        });
    }
    _constructCandle(datum) {
        const unix = (0, moment_1.default)(datum.timestamp).valueOf();
        return new Candle_1.Candle(unix, datum.open, datum.max, datum.min, datum.close, datum.volume);
    }
    _constructLevel2Snapshot(data, market) {
        const { ask, bid, sequence } = data;
        const asks = ask.map(p => new Level2Point_1.Level2Point(p.price, p.size));
        const bids = bid.map(p => new Level2Point_1.Level2Point(p.price, p.size));
        return new Level2Snapshots_1.Level2Snapshot({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            sequenceId: sequence,
            asks,
            bids,
        });
    }
    _constructLevel2Update(data, market) {
        const { ask, bid, sequence } = data;
        const asks = ask.map(p => new Level2Point_1.Level2Point(p.price, p.size, p.count));
        const bids = bid.map(p => new Level2Point_1.Level2Point(p.price, p.size, p.count));
        return new Level2Update_1.Level2Update({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            sequenceId: sequence,
            asks,
            bids,
        });
    }
}
exports.HitBtcClient = HitBtcClient;
function candlePeriod(period) {
    switch (period) {
        case CandlePeriod_1.CandlePeriod._1m:
            return "M1";
        case CandlePeriod_1.CandlePeriod._3m:
            return "M3";
        case CandlePeriod_1.CandlePeriod._5m:
            return "M5";
        case CandlePeriod_1.CandlePeriod._15m:
            return "M15";
        case CandlePeriod_1.CandlePeriod._30m:
            return "M30";
        case CandlePeriod_1.CandlePeriod._1h:
            return "H1";
        case CandlePeriod_1.CandlePeriod._4h:
            return "H4";
        case CandlePeriod_1.CandlePeriod._1d:
            return "D1";
        case CandlePeriod_1.CandlePeriod._1w:
            return "D7";
        case CandlePeriod_1.CandlePeriod._1M:
            return "1M";
    }
}
//# sourceMappingURL=HitBtcClient.js.map