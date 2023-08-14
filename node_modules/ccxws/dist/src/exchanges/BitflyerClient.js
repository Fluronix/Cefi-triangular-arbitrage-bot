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
exports.BitflyerClient = void 0;
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const semaphore_1 = __importDefault(require("semaphore"));
const BasicClient_1 = require("../BasicClient");
const Level2Point_1 = require("../Level2Point");
const Level2Update_1 = require("../Level2Update");
const NotImplementedFn_1 = require("../NotImplementedFn");
const https = __importStar(require("../Https"));
const Util_1 = require("../Util");
const Level2Snapshots_1 = require("../Level2Snapshots");
const Trade_1 = require("../Trade");
const moment_1 = __importDefault(require("moment"));
const Ticker_1 = require("../Ticker");
class BitflyerClient extends BasicClient_1.BasicClient {
    constructor({ wssPath = "wss://ws.lightstream.bitflyer.com/json-rpc", watcherMs, } = {}) {
        super(wssPath, "BitFlyer", undefined, watcherMs);
        this._sendSubCandles = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubCandles = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel2Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel2Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this.hasTickers = true;
        this.hasTrades = true;
        this.hasLevel2Updates = true;
        this.requestSnapshot = true;
        this._restSem = (0, semaphore_1.default)(1);
        this.REST_REQUEST_DELAY_MS = 250;
    }
    _sendSubTicker(remote_id) {
        this._wss.send(JSON.stringify({
            method: "subscribe",
            params: {
                channel: `lightning_ticker_${remote_id}`,
            },
        }));
    }
    _sendUnsubTicker(remote_id) {
        this._wss.send(JSON.stringify({
            method: "unsubscribe",
            params: {
                channel: `lightning_ticker_${remote_id}`,
            },
        }));
    }
    _sendSubTrades(remote_id) {
        this._wss.send(JSON.stringify({
            method: "subscribe",
            params: {
                channel: `lightning_executions_${remote_id}`,
            },
        }));
    }
    _sendSubLevel2Updates(remote_id) {
        // this method is trigger on connections events... so safe to send snapshot request here
        if (this.requestSnapshot)
            this._requestLevel2Snapshot(this._level2UpdateSubs.get(remote_id));
        this._wss.send(JSON.stringify({
            method: "subscribe",
            params: {
                channel: `lightning_board_${remote_id}`,
            },
        }));
    }
    _sendUnsubTrades(remote_id) {
        this._wss.send(JSON.stringify({
            method: "unsubscribe",
            params: {
                channel: `lightning_executions_${remote_id}`,
            },
        }));
    }
    _sendUnsubLevel2Updates(remote_id) {
        this._wss.send(JSON.stringify({
            method: "unsubscribe",
            params: {
                channel: `lightning_board_${remote_id}`,
            },
        }));
    }
    _onMessage(data) {
        const parsed = JSON.parse(data);
        if (!parsed.params || !parsed.params.channel || !parsed.params.message)
            return;
        const { channel, message } = parsed.params;
        if (channel.startsWith("lightning_ticker_")) {
            const remote_id = channel.substr("lightning_ticker_".length);
            const market = this._tickerSubs.get(remote_id);
            if (!market)
                return;
            const ticker = this._createTicker(message, market);
            this.emit("ticker", ticker, market);
            return;
        }
        // trades
        if (channel.startsWith("lightning_executions_")) {
            const remote_id = channel.substr("lightning_executions_".length);
            const market = this._tradeSubs.get(remote_id);
            if (!market)
                return;
            for (const datum of message) {
                const trade = this._createTrades(datum, market);
                this.emit("trade", trade, market);
            }
        }
        // orderbook
        if (channel.startsWith("lightning_board_")) {
            const remote_id = channel.substr("lightning_board_".length);
            const market = this._level2UpdateSubs.get(remote_id);
            if (!market)
                return;
            const update = this._createLevel2Update(message, market);
            this.emit("l2update", update, market);
        }
    }
    _createTicker(data, market) {
        const { timestamp, best_bid, best_ask, best_bid_size, best_ask_size, ltp, volume, volume_by_product, } = data;
        return new Ticker_1.Ticker({
            exchange: "bitFlyer",
            base: market.base,
            quote: market.quote,
            timestamp: moment_1.default.utc(timestamp).valueOf(),
            last: ltp.toFixed(8),
            volume: volume.toFixed(8),
            quoteVolume: volume_by_product.toFixed(8),
            bid: best_bid.toFixed(8),
            bidVolume: best_bid_size.toFixed(8),
            ask: best_ask.toFixed(8),
            askVolume: best_ask_size.toFixed(8),
        });
    }
    _createTrades(datum, market) {
        let { size, side, exec_date, price, id, buy_child_order_acceptance_id, sell_child_order_acceptance_id, } = datum;
        side = side.toLowerCase();
        const unix = (0, moment_1.default)(exec_date).valueOf();
        return new Trade_1.Trade({
            exchange: "bitFlyer",
            base: market.base,
            quote: market.quote,
            tradeId: id.toFixed(),
            unix,
            side: side.toLowerCase(),
            price: price.toFixed(8),
            amount: size.toFixed(8),
            buyOrderId: buy_child_order_acceptance_id,
            sellOrderId: sell_child_order_acceptance_id,
        });
    }
    _createLevel2Update(msg, market) {
        const asks = msg.asks.map(p => new Level2Point_1.Level2Point(p.price.toFixed(8), p.size.toFixed(8)));
        const bids = msg.bids.map(p => new Level2Point_1.Level2Point(p.price.toFixed(8), p.size.toFixed(8)));
        return new Level2Update_1.Level2Update({
            exchange: "bitFlyer",
            base: market.base,
            quote: market.quote,
            asks,
            bids,
        });
    }
    _requestLevel2Snapshot(market) {
        this._restSem.take(async () => {
            try {
                const remote_id = market.id;
                const uri = `https://api.bitflyer.com/v1/board?product_code=${remote_id}`;
                const raw = (await https.get(uri));
                const asks = raw.asks.map(p => new Level2Point_1.Level2Point(p.price.toFixed(8), p.size.toFixed(8)));
                const bids = raw.bids.map(p => new Level2Point_1.Level2Point(p.price.toFixed(8), p.size.toFixed(8)));
                const snapshot = new Level2Snapshots_1.Level2Snapshot({
                    exchange: "bitFlyer",
                    base: market.base,
                    quote: market.quote,
                    asks,
                    bids,
                });
                this.emit("l2snapshot", snapshot, market);
            }
            catch (ex) {
                this._onError(ex);
                this._requestLevel2Snapshot(market);
            }
            finally {
                await (0, Util_1.wait)(this.REST_REQUEST_DELAY_MS);
                this._restSem.leave();
            }
        });
    }
}
exports.BitflyerClient = BitflyerClient;
//# sourceMappingURL=BitflyerClient.js.map