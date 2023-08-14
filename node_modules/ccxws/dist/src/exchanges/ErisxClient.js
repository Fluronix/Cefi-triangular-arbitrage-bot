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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErisXClient = void 0;
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const moment = require("moment");
const BasicClient_1 = require("../BasicClient");
const jwt = __importStar(require("../Jwt"));
const Level2Point_1 = require("../Level2Point");
const Level2Snapshots_1 = require("../Level2Snapshots");
const Level3Point_1 = require("../Level3Point");
const Level3Snapshot_1 = require("../Level3Snapshot");
const Level3Update_1 = require("../Level3Update");
const NotImplementedFn_1 = require("../NotImplementedFn");
const Trade_1 = require("../Trade");
/**
 * ErisX has limited market data and presently only supports trades and
 * level3 order books. It requires authenticating with a token to view
 * the market data, which is performed on initial connection. ErisX also
 * requires a unique "correlationId" for each request sent to the server.
 * Requests are limited to 40 per second.
 */
class ErisXClient extends BasicClient_1.BasicClient {
    constructor({ wssPath = "wss://trade-api.erisx.com/", watcherMs = 600000, apiKey, apiSecret, l2depth = 20, } = {}) {
        super(wssPath, "ErisX", undefined, watcherMs);
        this._sendSubTicker = NotImplementedFn_1.NotImplementedFn;
        this._sendSubCandles = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubCandles = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubTicker = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel2Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel2Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.hasTrades = true;
        this.hasLevel2Snapshots = true;
        this.hasLevel3Updates = true;
        this.l2depth = l2depth;
        this._messageId = 0;
    }
    fetchSecurities() {
        this._wss.send(JSON.stringify({
            correlation: "SecurityList",
            type: "SecurityList",
            securityGroup: "ALL",
        }));
    }
    _onConnected() {
        this._sendAuthentication();
    }
    _sendAuthentication() {
        this._wss.send(JSON.stringify({
            correlation: this._nextId(),
            type: "AuthenticationRequest",
            token: this._createToken(),
        }));
    }
    _nextId() {
        return (++this._messageId).toString();
    }
    _createToken() {
        const payload = {
            iat: Date.now(),
            sub: this.apiKey,
        };
        return jwt.hs256(payload, this.apiSecret);
    }
    _sendSubTrades(remote_id) {
        this._wss.send(JSON.stringify({
            correlation: this._nextId(),
            type: "MarketDataSubscribe",
            symbol: remote_id,
            tradeOnly: true,
        }));
    }
    _sendUnsubTrades(remote_id) {
        this._wss.send(JSON.stringify({
            correlation: this._nextId(),
            type: "MarketDataUnsubscribe",
            symbol: remote_id,
            tradeOnly: true,
        }));
    }
    _sendSubLevel2Snapshots(remote_id) {
        this._wss.send(JSON.stringify({
            correlation: this._nextId(),
            type: "TopOfBookMarketDataSubscribe",
            symbol: remote_id,
            topOfBookDepth: this.l2depth,
        }));
    }
    _sendUnsubLevel2Snapshots(remote_id) {
        this._wss.send(JSON.stringify({
            correlation: this._nextId(),
            type: "TopOfBookMarketDataUnsubscribe",
            symbol: remote_id,
            topOfBookDepth: this.l2depth,
        }));
    }
    _sendSubLevel3Updates(remote_id) {
        this._wss.send(JSON.stringify({
            correlation: this._nextId(),
            type: "MarketDataSubscribe",
            symbol: remote_id,
        }));
    }
    _sendUnsubLevel3Snapshots(remote_id) {
        this._wss.send(JSON.stringify({
            correlation: this._nextId(),
            type: "MarketDataUnsubscribe",
            symbol: remote_id,
        }));
    }
    _onMessage(raw) {
        const msg = JSON.parse(raw);
        // authentication
        if (msg.type === "AuthenticationResult") {
            if (msg.success) {
                super._onConnected();
            }
            else {
                this.emit("error", new Error("Authentication failed"));
            }
            return;
        }
        // logout
        if (msg.type === "Logout") {
            this.emit("error", new Error("Session has been logged out"));
            return;
        }
        // unsolicited
        if (msg.type === "OFFLINE") {
            this.emit("error", new Error("Exchange is offline"));
            return;
        }
        // status
        if (msg.type === "INFO_MESSAGE") {
            return;
        }
        // securities
        if (msg.type === "SecuritiesResponse") {
            this.emit("markets", msg.securities);
            return;
        }
        // trade
        if (msg.type === "MarketDataIncrementalRefreshTrade") {
            const market = this._tradeSubs.get(msg.symbol);
            if (!market)
                return;
            const trades = this._constructTrades(msg, market);
            for (const trade of trades) {
                this.emit("trade", trade, market);
            }
            return;
        }
        // l2 snapshot
        if (msg.type === "TopOfBookMarketData") {
            const market = this._level2SnapshotSubs.get(msg.symbol);
            if (!market)
                return;
            const snapshot = this._constructLevel2Snapshot(msg, market);
            this.emit("l2snapshot", snapshot, market);
            return;
        }
        // l3
        if (msg.type === "MarketDataIncrementalRefresh") {
            const market = this._level3UpdateSubs.get(msg.symbol);
            if (!market)
                return;
            // snapshot
            if (msg.endFlag === null) {
                const snapshot = this._constructLevel3Snapshot(msg, market);
                this.emit("l3snapshot", snapshot, market);
            }
            // update
            else {
                const update = this._constructLevel3Update(msg, market);
                this.emit("l3update", update, market);
            }
            return;
        }
    }
    /**
   {
      "correlation": "15978410832102",
      "type": "MarketDataIncrementalRefreshTrade",
      "symbol": "LTC/USD",
      "sendingTime": "20200819-12:44:50.896",
      "trades": [{
        "updateAction": "NEW",
        "price": 64.2,
        "currency": "LTC",
        "tickerType": "PAID",
        "transactTime": "20200819-12:44:50.872994129",
        "size": 2.0,
        "symbol": "LTC/USD",
        "numberOfOrders": 1
      }],
      "endFlag":  "END_OF_TRADE"
    }
   */
    _constructTrades(msg, market) {
        return msg.trades.map(p => this._constructTrade(p, market));
    }
    /**
   {
      "updateAction": "NEW",
      "price": 64.2,
      "currency": "LTC",
      "tickerType": "PAID",
      "transactTime": "20200819-12:44:50.872994129",
      "size": 2.0,
      "symbol": "LTC/USD",
      "numberOfOrders": 1
   }
   */
    _constructTrade(msg, market) {
        const timestamp = moment.utc(msg.transactTime, "YYYYMMDD-hh:mm:ss.SSSSSSSSS");
        const unix = timestamp.valueOf();
        const tradeId = msg.transactTime.replace(/[-:.]/g, "");
        const amount = msg.size.toFixed(8);
        const price = msg.price.toFixed(8);
        return new Trade_1.Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            tradeId,
            unix,
            price,
            amount,
            raw: msg,
        });
    }
    /**
   {
    "correlation": "15978412650812",
    "type": "TopOfBookMarketData",
    "bids": [
        {
            "action": "NEW",
            "count": 1,
            "totalVolume": 1.0,
            "price": 413.2,
            "lastUpdate": "20200819-12:47:49.975"
        },
        {
            "action": "UPDATE",
            "count": 2,
            "totalVolume": 2.00,
            "price": 412.9,
            "lastUpdate": "20200819-12:47:39.984"
        }
    ],
    "offers": [
        {
            "action": "NO CHANGE",
            "count": 1,
            "totalVolume": 1.00,
            "price": 413.3,
            "lastUpdate": "20200819-12:47:40.166"
        },
        {
            "action": "NO CHANGE",
            "count": 1,
            "totalVolume": 1.56,
            "price": 413.4,
            "lastUpdate": "20200819-12:47:20.196"
        }
    ],
    "symbol": "ETH/USD"
    }
   */
    _constructLevel2Snapshot(msg, market) {
        const map = p => new Level2Point_1.Level2Point(p.price.toFixed(8), p.totalVolume.toFixed(8), p.count, undefined, moment.utc(p.lastUpdate, "YYYYMMDD-hh:mm:ss.SSSSSSSSS").valueOf());
        const bids = msg.bids.map(map);
        const asks = msg.offers.map(map);
        return new Level2Snapshots_1.Level2Snapshot({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            asks,
            bids,
        });
    }
    /**
   {
      "correlation": "4",
      "type": "MarketDataIncrementalRefresh",
      "symbol": "BTC/USD",
      "sendingTime": "20201007-17:37:40.588",
      "bids": [
          {
              "id": "1000000fd05b8",
              "updateAction": "NEW",
              "price": 10632.2,
              "amount": 1.6,
              "symbol": "BTC/USD"
          },
          {
              "id": "1000000fd05a0",
              "updateAction": "NEW",
              "price": 10629.4,
              "amount": 1.6,
              "symbol": "BTC/USD"
          },
          {
              "id": "1000000fc7402",
              "updateAction": "NEW",
              "price": 10623.4,
              "amount": 0.99,
              "symbol": "BTC/USD"
          }
      ],
      "offers": [
          {
              "id": "1000000fd0522",
              "updateAction": "NEW",
              "price": 10633.5,
              "amount": 1.6,
              "symbol": "BTC/USD"
          },
          {
              "id": "1000000fd05b7",
              "updateAction": "NEW",
              "price": 10637,
              "amount": 1.6,
              "symbol": "BTC/USD"
          },
          {
              "id": "1000000fc7403",
              "updateAction": "NEW",
              "price": 10638.4,
              "amount": 0.99,
              "symbol": "BTC/USD"
          }
      ],
      "transactTime": "20201007-17:37:40.587917127",
      "endFlag": null
    }
   */
    _constructLevel3Snapshot(msg, market) {
        const timestampMs = moment.utc(msg.transactTime, "YYYYMMDD-hh:mm:ss.SSSSSSSSS").valueOf();
        const asks = msg.offers.map(p => new Level3Point_1.Level3Point(p.id, p.price.toFixed(8), p.amount.toFixed(8), {
            type: p.updateAction,
        }));
        const bids = msg.bids.map(p => new Level3Point_1.Level3Point(p.id, p.price.toFixed(8), p.amount.toFixed(8), {
            type: p.updateAction,
        }));
        return new Level3Snapshot_1.Level3Snapshot({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestampMs,
            asks,
            bids,
        });
    }
    /**
   {
      "correlation": "4",
      "type": "MarketDataIncrementalRefresh",
      "symbol": "BTC/USD",
      "sendingTime": "20201007-17:37:42.931",
      "bids": [
          {
              "id": "1000000fc7402",
              "updateAction": "NEW",
              "price": 10625,
              "amount": 0.99,
              "symbol": "BTC/USD"
          }
      ],
      "offers": [],
      "transactTime": "20201007-17:37:42.930970367",
      "endFlag": "END_OF_EVENT"
    }
   */
    _constructLevel3Update(msg, market) {
        const timestampMs = moment.utc(msg.transactTime, "YYYYMMDD-hh:mm:ss.SSSSSSSSS").valueOf();
        const asks = msg.bids.map(p => new Level3Point_1.Level3Point(p.id, p.price.toFixed(8), p.amount.toFixed(8), {
            type: p.updateAction,
        }));
        const bids = msg.offers.map(p => new Level3Point_1.Level3Point(p.id, p.price.toFixed(8), p.amount.toFixed(8), {
            type: p.updateAction,
        }));
        return new Level3Update_1.Level3Update({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            timestampMs,
            asks,
            bids,
        });
    }
}
exports.ErisXClient = ErisXClient;
//# sourceMappingURL=ErisxClient.js.map