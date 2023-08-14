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
exports.BitstampClient = void 0;
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const semaphore = require("semaphore");
const Level2Point_1 = require("../Level2Point");
const BasicClient_1 = require("../BasicClient");
const Level2Snapshots_1 = require("../Level2Snapshots");
const Util_1 = require("../Util");
const https = __importStar(require("../Https"));
const NotImplementedFn_1 = require("../NotImplementedFn");
const Trade_1 = require("../Trade");
const Level2Update_1 = require("../Level2Update");
/**
 * BistampClient v2 no longer uses Pusher. We can leverage the
 * BasicClient now instead of performing custom actions.
 *
 * Documentation for Version 2
 * https://www.bitstamp.net/websocket/v2/
 */
class BitstampClient extends BasicClient_1.BasicClient {
    constructor({ wssPath = "wss://ws.bitstamp.net", watcherMs } = {}) {
        super(wssPath, "Bitstamp", undefined, watcherMs);
        this._sendSubTicker = NotImplementedFn_1.NotImplementedFn;
        this._sendSubCandles = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubCandles = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubTicker = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this.requestSnapshot = true;
        this.hasTrades = true;
        this.hasLevel2Snapshots = true;
        this.hasLevel2Updates = true;
        this._restSem = semaphore(1);
        this.REST_REQUEST_DELAY_MS = 250;
    }
    _sendSubTrades(remote_id) {
        this._wss.send(JSON.stringify({
            event: "bts:subscribe",
            data: {
                channel: `live_trades_${remote_id}`,
            },
        }));
    }
    _sendUnsubTrades(remote_id) {
        this._wss.send(JSON.stringify({
            event: "bts:unsubscribe",
            data: {
                channel: `live_trades_${remote_id}`,
            },
        }));
    }
    _sendSubLevel2Snapshots(remote_id) {
        this._wss.send(JSON.stringify({
            event: "bts:subscribe",
            data: {
                channel: `order_book_${remote_id}`,
            },
        }));
    }
    _sendUnsubLevel2Snapshots(remote_id) {
        this._wss.send(JSON.stringify({
            event: "bts:unsubscribe",
            data: {
                channel: `order_book_${remote_id}`,
            },
        }));
    }
    _sendSubLevel2Updates(remote_id) {
        if (this.requestSnapshot)
            this._requestLevel2Snapshot(this._level2UpdateSubs.get(remote_id));
        this._wss.send(JSON.stringify({
            event: "bts:subscribe",
            data: {
                channel: `diff_order_book_${remote_id}`,
            },
        }));
    }
    _sendUnsubLevel2Updates(remote_id) {
        this._wss.send(JSON.stringify({
            event: "bts:unsubscribe",
            data: {
                channel: `diff_order_book_${remote_id}`,
            },
        }));
    }
    /////////////////////////////////////////////
    _onMessage(raw) {
        const msg = JSON.parse(raw);
        if (msg.event === "trade" && msg.channel.startsWith("live_trades")) {
            this._onTrade(msg);
            return;
        }
        if (msg.event === "data" && msg.channel.startsWith("order_book")) {
            this._onLevel2Snapshot(msg);
            return;
        }
        if (msg.event === "data" && msg.channel.startsWith("diff_order_book")) {
            this._onLevel2Update(msg);
            return;
        }
        // Handle forced reconnection events which may be triggered by
        // maintenance. Upon reconnection, the request will transition
        // to a new server.
        if (msg.event === "bts.request_reconnect") {
            this.reconnect();
            return;
        }
    }
    /**
   Process trade events
    {
      "data": {
        "microtimestamp": "1560180218394137",
        "amount": 0.0063150000000000003,
        "buy_order_id": 3486145418,
        "sell_order_id": 3486144483,
        "amount_str": "0.00631500",
        "price_str": "7917.13",
        "timestamp": "1560180218",
        "price": 7917.1300000000001,
        "type": 0,
        "id": 90350862
      },
      "event": "trade",
      "channel": "live_trades_btcusd"
    }

   */
    _onTrade(msg) {
        const remote_id = msg.channel.substr(msg.channel.lastIndexOf("_") + 1);
        const market = this._tradeSubs.get(remote_id);
        if (!market)
            return;
        const data = msg.data;
        const trade = new Trade_1.Trade({
            exchange: "Bitstamp",
            base: market.base,
            quote: market.quote,
            tradeId: data.id.toFixed(),
            unix: Math.round(parseInt(data.microtimestamp) / 1000),
            side: data.type === 1 ? "sell" : "buy",
            price: data.price_str,
            amount: data.amount_str,
            buyOrderId: data.buy_order_id,
            sellOrderId: data.sell_order_id,
        });
        this.emit("trade", trade, market);
    }
    /**
    Process level2 snapshot message
    {
      "data": {
        "timestamp": "1560181957",
        "microtimestamp": "1560181957623999",
        "bids": [
          ["7929.20", "1.10000000"],
          ["7927.07", "1.14028647"],
          ["7926.92", "0.02000000"],
          ["7926.31", "3.35799775"],
          ["7926.30", "0.10000000"]
        ],
        "asks": [
          ["7936.73", "0.50000000"],
          ["7937.10", "1.00000000"],
          ["7937.12", "0.02000000"],
          ["7937.13", "0.20101742"],
          ["7937.15", "0.06000000"]
        ]
      },
      "event": "data",
      "channel": "order_book_btcusd"
    }
   */
    _onLevel2Snapshot(msg) {
        const remote_id = msg.channel.substr(msg.channel.lastIndexOf("_") + 1);
        const market = this._level2SnapshotSubs.get(remote_id);
        if (!market)
            return;
        let { bids, asks, microtimestamp } = msg.data;
        bids = bids.map(([price, size]) => new Level2Point_1.Level2Point(price, size));
        asks = asks.map(([price, size]) => new Level2Point_1.Level2Point(price, size));
        const spot = new Level2Snapshots_1.Level2Snapshot({
            exchange: "Bitstamp",
            base: market.base,
            quote: market.quote,
            timestampMs: Math.round(parseInt(microtimestamp) / 1000),
            bids,
            asks,
        });
        this.emit("l2snapshot", spot, market);
    }
    /**
    Process level2 update message

    {
      "data": {
        "timestamp": "1560182488",
        "microtimestamp": "1560182488522670",
        "bids": [
          ["7937.24", "0.00000000"],
          ["7937.10", "0.00000000"],
          ["7935.33", "3.14680000"],
          ["7935.01", "0.00000000"],
          ["7934.55", "0.00000000"]
        ],
        "asks": [
          ["7945.54", "0.10000000"],
          ["7945.64", "0.06000000"],
          ["7946.48", "4.00000000"],
          ["7947.75", "3.14700000"],
          ["7948.10", "0.00000000"]
        ]
      },
      "event": "data",
      "channel": "diff_order_book_btcusd"
    }
   */
    _onLevel2Update(msg) {
        const remote_id = msg.channel.substr(msg.channel.lastIndexOf("_") + 1);
        const market = this._level2UpdateSubs.get(remote_id);
        if (!market)
            return;
        let { bids, asks, microtimestamp } = msg.data;
        bids = bids.map(([price, size]) => new Level2Point_1.Level2Point(price, size));
        asks = asks.map(([price, size]) => new Level2Point_1.Level2Point(price, size));
        const update = new Level2Update_1.Level2Update({
            exchange: "Bitstamp",
            base: market.base,
            quote: market.quote,
            timestampMs: Math.round(parseInt(microtimestamp) / 1000),
            bids,
            asks,
        });
        this.emit("l2update", update, market);
    }
    /////////////////////////////////////////////
    // SNAPSHOTS
    /////////////////////////////////////////////
    _requestLevel2Snapshots() {
        if (this.requestSnapshot) {
            for (const market of Array.from(this._level2UpdateSubs.values())) {
                this._requestLevel2Snapshot(market);
            }
        }
    }
    _requestLevel2Snapshot(market) {
        this._restSem.take(async () => {
            try {
                const remote_id = market.id;
                const uri = `https://www.bitstamp.net/api/v2/order_book/${remote_id}?group=1`;
                const raw = await https.get(uri);
                const timestampMs = raw.timestamp * 1000;
                const asks = raw.asks.map(p => new Level2Point_1.Level2Point(p[0], p[1]));
                const bids = raw.bids.map(p => new Level2Point_1.Level2Point(p[0], p[1]));
                const snapshot = new Level2Snapshots_1.Level2Snapshot({
                    exchange: "Bitstamp",
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
                this._requestLevel2Snapshot(market);
            }
            finally {
                await (0, Util_1.wait)(this.REST_REQUEST_DELAY_MS);
                this._restSem.leave();
            }
        });
    }
}
exports.BitstampClient = BitstampClient;
//# sourceMappingURL=BitstampClient.js.map