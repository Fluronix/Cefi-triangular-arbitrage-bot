"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BithumbClient = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const moment_1 = __importDefault(require("moment"));
const BasicClient_1 = require("../BasicClient");
const Debounce_1 = require("../flowcontrol/Debounce");
const Throttle_1 = require("../flowcontrol/Throttle");
const Level2Point_1 = require("../Level2Point");
const Level2Snapshots_1 = require("../Level2Snapshots");
const Level2Update_1 = require("../Level2Update");
const Ticker_1 = require("../Ticker");
const Trade_1 = require("../Trade");
const https = __importStar(require("../Https"));
const NotImplementedFn_1 = require("../NotImplementedFn");
class BithumbClient extends BasicClient_1.BasicClient {
    constructor({ wssPath = "wss://pubwss.bithumb.com/pub/ws", watcherMs } = {}) {
        super(wssPath, "Bithumb", undefined, watcherMs);
        this._sendSubTicker = NotImplementedFn_1.NotImplementedFn;
        this._sendSubCandles = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubCandles = NotImplementedFn_1.NotImplementedFn;
        this._sendSubTrades = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel2Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel2Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel2Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this._restL2SnapshotPath = "https://api.bithumb.com/public/orderbook";
        this.hasTickers = true;
        this.hasTrades = true;
        this.hasLevel2Updates = true;
        this.remoteIdMap = new Map();
        this.restThrottleMs = 50;
        this._requestLevel2Snapshot = (0, Throttle_1.throttle)(this.__requestLevel2Snapshot.bind(this), this.restThrottleMs); // prettier-ignore
        this._sendSubTicker = (0, Debounce_1.debounce)(this.__sendSubTicker.bind(this));
        this._sendSubTrades = (0, Debounce_1.debounce)(this.__sendSubTrades.bind(this));
        this._sendSubLevel2Updates = (0, Debounce_1.debounce)(this.__sendSubLevel2Updates.bind(this));
    }
    __sendSubTicker() {
        const symbols = Array.from(this._tickerSubs.keys());
        this._wss.send(JSON.stringify({
            type: "ticker",
            symbols,
            tickTypes: ["24H"],
        }));
    }
    _sendUnsubTicker() {
        //
    }
    __sendSubTrades() {
        const symbols = Array.from(this._tradeSubs.keys());
        this._wss.send(JSON.stringify({
            type: "transaction",
            symbols,
        }));
    }
    _sendUnsubTrades() {
        //
    }
    __sendSubLevel2Updates() {
        const symbols = Array.from(this._level2UpdateSubs.keys());
        for (const symbol of symbols) {
            this._requestLevel2Snapshot(this._level2UpdateSubs.get(symbol));
        }
        this._wss.send(JSON.stringify({
            type: "orderbookdepth",
            symbols,
        }));
    }
    _sendUnsubLevel2Updates() {
        //
    }
    _onMessage(raw) {
        const msg = JSON.parse(raw);
        // console.log(raw);
        // tickers
        if (msg.type === "ticker") {
            const remoteId = msg.content.symbol;
            const market = this._tickerSubs.get(remoteId);
            if (!market)
                return;
            const ticker = this._constructTicker(msg.content, market);
            this.emit("ticker", ticker, market);
            return;
        }
        // trades
        if (msg.type === "transaction") {
            for (const datum of msg.content.list) {
                const remoteId = datum.symbol;
                const market = this._tradeSubs.get(remoteId);
                if (!market)
                    return;
                const trade = this._constructTrade(datum, market);
                this.emit("trade", trade, market);
            }
            return;
        }
        // l2pudate
        if (msg.type === "orderbookdepth") {
            const remoteId = msg.content.list[0].symbol;
            const market = this._level2UpdateSubs.get(remoteId);
            if (!market)
                return;
            const update = this._constructL2Update(msg, market);
            this.emit("l2update", update, market);
            return;
        }
    }
    /**
    {
      "type":"ticker",
      "content":{
        "tickType":"24H",
        "date":"20200814",
        "time":"063809",
        "openPrice":"13637000",
        "closePrice":"13714000",
        "lowPrice":"13360000",
        "highPrice":"13779000",
        "value":"63252021221.2101",
        "volume":"4647.44384349",
        "sellVolume":"2372.30829641",
        "buyVolume":"2275.03363265",
        "prevClosePrice":"13601000",
        "chgRate":"0.56",
        "chgAmt":"77000",
        "volumePower":"95.89",
        "symbol":"BTC_KRW"
      }
    }
   */
    _constructTicker(data, market) {
        const timestamp = moment_1.default
            .parseZone(data.date + data.time + "+09:00", "YYYYMMDDhhmmssZ")
            .valueOf();
        return new Ticker_1.Ticker({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestamp,
            last: data.closePrice,
            open: data.openPrice,
            high: data.highPrice,
            low: data.lowPrice,
            volume: data.volume,
            quoteVolume: data.value,
            change: data.chgAmt,
            changePercent: data.chgRate,
        });
    }
    /**
   {
     "type":"transaction",
     "content":
     {
       "list":
       [
         {
          "buySellGb":"1",
          "contPrice":"485900",
          "contQty":"0.196",
          "contAmt":"95236.400",
          "contDtm":"2020-08-14 06:28:41.621909",
          "updn":"dn",
          "symbol":"ETH_KRW"
        },
        {
          "buySellGb":"2",
          "contPrice":"486400",
          "contQty":"5.4277",
          "contAmt":"2640033.2800",
          "contDtm":"2020-08-14 06:28:42.453539",
          "updn":"up",
          "symbol":"ETH_KRW"
        }
      ]
    }
  }
   */
    _constructTrade(datum, market) {
        const unix = moment_1.default
            .parseZone(datum.contDtm + "+09:00", "YYYY-MM-DD hh:mm:ss.SSSSSS")
            .valueOf();
        const side = datum.buySellGb == 1 ? "buy" : "sell";
        const price = datum.contPrice;
        const amount = datum.contQty;
        return new Trade_1.Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            side,
            unix,
            price,
            amount,
        });
    }
    /**
   {
      "type": "orderbookdepth",
      "content": {
        "list": [
          {
            "symbol": "BTC_KRW",
            "orderType": "ask",
            "price": "13811000",
            "quantity": "0",
            "total": "0"
          },
          {
            "symbol": "BTC_KRW",
            "orderType": "ask",
            "price": "13733000",
            "quantity": "0.0213",
            "total": "1"
          },
          {
            "symbol": "BTC_KRW",
            "orderType": "bid",
            "price": "6558000",
            "quantity": "0",
            "total": "0"
          },
          {
            "symbol": "BTC_KRW",
            "orderType": "bid",
            "price": "13728000",
            "quantity": "0.0185",
            "total": "1"
          }
        ],
        "datetime": "1597355189967132"
      }
    }
   */
    _constructL2Update(msg, market) {
        const timestampMs = Math.trunc(Number(msg.content.datetime) / 1000);
        const asks = [];
        const bids = [];
        for (const data of msg.content.list) {
            const point = new Level2Point_1.Level2Point(data.price, data.quantity, data.total);
            if (data.orderType === "bid")
                bids.push(point);
            else
                asks.push(point);
        }
        return new Level2Update_1.Level2Update({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestampMs,
            asks,
            bids,
            datetime: msg.content.datetime,
        });
    }
    async __requestLevel2Snapshot(market) {
        let failed = false;
        try {
            const remote_id = market.id;
            const uri = `${this._restL2SnapshotPath}/${remote_id}`;
            const raw = (await https.get(uri));
            const timestampMs = Number(raw.data.timestamp);
            const asks = raw.data.asks.map(p => new Level2Point_1.Level2Point(p.price, p.quantity));
            const bids = raw.data.bids.map(p => new Level2Point_1.Level2Point(p.price, p.quantity));
            const snapshot = new Level2Snapshots_1.Level2Snapshot({
                exchange: this.name,
                base: market.base,
                quote: market.quote,
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
exports.BithumbClient = BithumbClient;
//# sourceMappingURL=BithumbClient.js.map