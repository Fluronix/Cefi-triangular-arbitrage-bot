"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitfinexClient = exports.BitfinexTradeMessageType = void 0;
const BasicClient_1 = require("../BasicClient");
const Level2Point_1 = require("../Level2Point");
const Level2Snapshots_1 = require("../Level2Snapshots");
const Level2Update_1 = require("../Level2Update");
const Level3Point_1 = require("../Level3Point");
const Level3Snapshot_1 = require("../Level3Snapshot");
const Level3Update_1 = require("../Level3Update");
const NotImplementedFn_1 = require("../NotImplementedFn");
const Ticker_1 = require("../Ticker");
const Trade_1 = require("../Trade");
var BitfinexTradeMessageType;
(function (BitfinexTradeMessageType) {
    /**
     * Receive both execution events and updates
     */
    BitfinexTradeMessageType["All"] = "all";
    /**
     * Receive trade events immediately at the time of execution. Events
     * do not include the database identifier, only the sequence identifier.
     */
    BitfinexTradeMessageType["Execution"] = "te";
    /**
     * Receive trade events that have been written to the database. These
     * events include both the sequence identifier as well as the database
     * identifier. These events are delayed by 1-2 seconds after the
     * trade event.
     */
    BitfinexTradeMessageType["Update"] = "tu";
})(BitfinexTradeMessageType = exports.BitfinexTradeMessageType || (exports.BitfinexTradeMessageType = {}));
class BitfinexClient extends BasicClient_1.BasicClient {
    constructor({ wssPath = "wss://api.bitfinex.com/ws/2", watcherMs, l2UpdateDepth = 250, enableEmptyHeartbeatEvents = false, tradeMessageType = BitfinexTradeMessageType.Update, } = {}) {
        super(wssPath, "Bitfinex", undefined, watcherMs);
        this._sendSubCandles = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel2Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendSubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubCandles = NotImplementedFn_1.NotImplementedAsyncFn;
        this._sendUnsubLevel2Snapshots = NotImplementedFn_1.NotImplementedAsyncFn;
        this._sendUnsubLevel3Snapshots = NotImplementedFn_1.NotImplementedAsyncFn;
        this._channels = {};
        this.hasTickers = true;
        this.hasTrades = true;
        this.hasLevel2Updates = true;
        this.hasLevel3Updates = true;
        this.l2UpdateDepth = l2UpdateDepth;
        this.enableEmptyHeartbeatEvents = enableEmptyHeartbeatEvents;
        this.tradeMessageType = tradeMessageType;
    }
    _onConnected() {
        // immediately send the config event to include sequence IDs in every message
        this._sendConfiguration();
        super._onConnected();
    }
    /**
     * Override the default BasicClient _unsubscribe by deferring removal
     * of from the appropriate map until the unsubscribe event has been
     * received.
     *
     * If enableEmptyHeartbeatEvents (validating sequenceIds) we need to
     * keep receiving events from a channel after we sent the unsub event
     * until unsubscribe is confirmed. This is because every message's
     * sequenceId must be validated, and some may arrive between sending
     * unsub and it being confirmed. So we dont remove from the map and
     * will continue emitting events for this channel until they stop
     * arriving.
     */
    _unsubscribe(market, map, sendFn) {
        const remote_id = market.id;
        if (map.has(remote_id)) {
            if (this._wss.isConnected) {
                sendFn(remote_id, market);
            }
        }
    }
    _sendConfiguration() {
        // see docs for "conf" flags. https://docs.bitfinex.com/docs/ws-general#configuration
        // combine multiple flags by summing their values
        // 65536 adds a sequence ID to each message
        // 32768 adds a Timestamp in milliseconds to each received event
        // 131072 Enable checksum for every book iteration. Checks the top 25 entries for each side of book. Checksum is a signed int. more info https://docs.bitfinex.com/docs/ws-websocket-checksum. it's sent in its own
        // separate event so we've disabled it
        this._wss.send(JSON.stringify({ event: "conf", flags: 65536 + 32768 }));
    }
    _sendSubTicker(remote_id) {
        this._wss.send(JSON.stringify({
            event: "subscribe",
            channel: "ticker",
            pair: remote_id,
        }));
    }
    _sendUnsubTicker(remote_id) {
        this._sendUnsubscribe(remote_id);
    }
    _sendSubTrades(remote_id) {
        this._wss.send(JSON.stringify({
            event: "subscribe",
            channel: "trades",
            pair: remote_id,
        }));
    }
    _sendUnsubTrades(remote_id) {
        const chanId = this._findChannel("trades", remote_id);
        this._sendUnsubscribe(chanId);
    }
    _sendSubLevel2Updates(remote_id) {
        this._wss.send(JSON.stringify({
            event: "subscribe",
            channel: "book",
            pair: remote_id,
            len: String(this.l2UpdateDepth), // len must be of type string, even though it's a number
        }));
    }
    _sendUnsubLevel2Updates(remote_id) {
        const chanId = this._findChannel("level2updates", remote_id);
        this._sendUnsubscribe(chanId);
    }
    _sendSubLevel3Updates(remote_id) {
        this._wss.send(JSON.stringify({
            event: "subscribe",
            channel: "book",
            pair: remote_id,
            prec: "R0",
            length: "100",
        }));
    }
    _sendUnsubLevel3Updates(remote_id) {
        const chanId = this._findChannel("level3updates", remote_id);
        this._sendUnsubscribe(chanId);
    }
    _sendUnsubscribe(chanId) {
        if (chanId) {
            this._wss.send(JSON.stringify({
                event: "unsubscribe",
                chanId: chanId,
            }));
        }
    }
    _findChannel(type, remote_id) {
        for (const raw of Object.values(this._channels)) {
            const chan = raw;
            if (chan.pair === remote_id) {
                if (type === "trades" && chan.channel === "trades")
                    return chan.chanId;
                if (type === "level2updates" && chan.channel === "book" && chan.prec !== "R0")
                    return chan.chanId;
                if (type === "level3updates" && chan.channel === "book" && chan.prec === "R0")
                    return chan.chanId;
            }
        }
    }
    /**
     * Handle heartbeat messages on each channel.
     */
    _onHeartbeatMessage(msg, channel) {
        if (channel.channel === "ticker") {
            let market = this._tickerSubs.get(channel.pair);
            if (!market)
                return;
            this._onTickerHeartbeat(msg, market);
            return;
        }
        // trades
        if (channel.channel === "trades") {
            let market = this._tradeSubs.get(channel.pair);
            if (!market)
                return;
            this._onTradeMessageHeartbeat(msg, market);
            return;
        }
        // level3
        if (channel.channel === "book" && channel.prec === "R0") {
            let market = this._level3UpdateSubs.get(channel.pair);
            if (!market)
                return;
            this._onLevel3UpdateHeartbeat(msg, market);
            return;
        }
        // level2
        if (channel.channel === "book") {
            let market = this._level2UpdateSubs.get(channel.pair);
            if (!market)
                return;
            this._onLevel2UpdateHeartbeat(msg, market);
            return;
        }
    }
    _onMessage(raw) {
        const msg = JSON.parse(raw);
        // capture channel metadata
        if (msg.event === "subscribed") {
            this._channels[msg.chanId] = msg;
            return;
        }
        // process unsubscribe event
        if (msg.event === "unsubscribed") {
            this._onUnsubscribeMessage(msg);
            return;
        }
        // lookup channel
        const channel = this._channels[msg[0]];
        if (!channel)
            return;
        // handle heartbeats
        if (msg[1] === "hb") {
            this._onHeartbeatMessage(msg, channel);
            return;
        }
        if (channel.channel === "ticker") {
            const market = this._tickerSubs.get(channel.pair);
            if (!market)
                return;
            this._onTicker(msg, market);
            return;
        }
        // trades
        if (channel.channel === "trades") {
            const market = this._tradeSubs.get(channel.pair);
            if (!market)
                return;
            // handle tradeMessageType (constructor param) filtering
            // example trade update msg: [ 359491, 'tu' or 'te', [ 560287312, 1609712228656, 0.005, 33432 ], 6 ]
            // note: "tu" means it's got the tradeId, this is delayed by 1-2 seconds and includes tradeId.
            // "te" is the same but available immediately and without the tradeId
            const tradeEventType = msg[1];
            if (this.tradeMessageType === BitfinexTradeMessageType.All ||
                tradeEventType === this.tradeMessageType) {
                this._onTradeMessage(msg, market);
            }
            return;
        }
        // level3
        if (channel.channel === "book" && channel.prec === "R0") {
            const market = this._level3UpdateSubs.get(channel.pair);
            if (!market)
                return;
            if (Array.isArray(msg[1][0]))
                this._onLevel3Snapshot(msg, market);
            else
                this._onLevel3Update(msg, market);
            return;
        }
        // level2
        if (channel.channel === "book") {
            const market = this._level2UpdateSubs.get(channel.pair);
            if (!market)
                return;
            if (Array.isArray(msg[1][0]))
                this._onLevel2Snapshot(msg, market);
            else
                this._onLevel2Update(msg, market);
            return;
        }
    }
    _onUnsubscribeMessage(msg) {
        const chanId = msg.chanId;
        const channel = this._channels[chanId];
        if (!channel)
            return;
        const marketId = channel.pair;
        // remove channel metadata
        delete this._channels[chanId];
        // remove from appropriate subscription map
        if (channel.channel === "ticker") {
            this._tickerSubs.delete(marketId);
        }
        else if (channel.channel === "trades") {
            this._tradeSubs.delete(marketId);
        }
        else if (channel.channel === "book" && channel.prec === "R0") {
            this._level3UpdateSubs.delete(marketId);
        }
        else if (channel.channel === "book") {
            this._level2UpdateSubs.delete(marketId);
        }
    }
    /**
     * Handle heartbeat events in the ticker channel.
     */
    _onTickerHeartbeat(msg, market) {
        const sequenceId = Number(msg[2]);
        const timestampMs = msg[3];
        if (this.enableEmptyHeartbeatEvents === false)
            return;
        // handle heartbeat by emitting empty update w/sequenceId.
        // heartbeat msg: [ 198655, 'hb', 3, 1610920929093 ]
        let ticker = new Ticker_1.Ticker({
            exchange: "Bitfinex",
            base: market.base,
            quote: market.quote,
            timestamp: timestampMs,
            sequenceId,
        });
        this.emit("ticker", ticker, market);
        return;
    }
    _onTicker(msg, market) {
        const msgBody = msg[1];
        const sequenceId = Number(msg[2]);
        const [bid, bidSize, ask, askSize, change, changePercent, last, volume, high, low] = msgBody;
        const open = last + change;
        const ticker = new Ticker_1.Ticker({
            exchange: "Bitfinex",
            base: market.base,
            quote: market.quote,
            timestamp: Date.now(),
            sequenceId,
            last: last.toFixed(8),
            open: open.toFixed(8),
            high: high.toFixed(8),
            low: low.toFixed(8),
            volume: volume.toFixed(8),
            change: change.toFixed(8),
            changePercent: changePercent.toFixed(2),
            bid: bid.toFixed(8),
            bidVolume: bidSize.toFixed(8),
            ask: ask.toFixed(8),
            askVolume: askSize.toFixed(8),
        });
        this.emit("ticker", ticker, market);
    }
    /**
     * Handle heartbeat events in the trades channel.
     */
    _onTradeMessageHeartbeat(msg, market) {
        const timestampMs = msg[3];
        const sequenceId = Number(msg[2]);
        if (this.enableEmptyHeartbeatEvents === false)
            return;
        // handle heartbeat by emitting empty update w/sequenceId.
        // example trade heartbeat msg: [ 198655, 'hb', 3, 1610920929093 ]
        let trade = new Trade_1.Trade({
            exchange: "Bitfinex",
            base: market.base,
            quote: market.quote,
            timestamp: timestampMs,
            sequenceId,
        });
        this.emit("trade", trade, market);
        return;
    }
    /**
     * Handle the trade history payload received when initially subscribing, which includes recent trades history.
     * Each trade in history is emitted as its own trade event.
     */
    _onTradeHistoryMessage(msg, market) {
        // handle the initial trades snapshot
        // trade snapshot example msg:
        /*
        [
            CHANNEL_ID,
            [
                [
                    ID,
                    MTS,
                    AMOUNT,
                    PRICE
                ],
                ...
            ],
            sequenceId,
            timestampMs
        ]
        */
        const sequenceId = Number(msg[2]);
        for (const thisTrade of msg[1]) {
            let [id, unix, amount, price] = thisTrade;
            let side = amount > 0 ? "buy" : "sell";
            price = price.toFixed(8);
            amount = Math.abs(amount).toFixed(8);
            let trade = new Trade_1.Trade({
                exchange: "Bitfinex",
                base: market.base,
                quote: market.quote,
                tradeId: id.toFixed(),
                sequenceId,
                unix: unix,
                side,
                price,
                amount,
            });
            this.emit("trade", trade, market);
        }
    }
    _onTradeMessage(msg, market) {
        const isTradeHistory = Array.isArray(msg[1]);
        if (isTradeHistory) {
            this._onTradeHistoryMessage(msg, market);
            return;
        }
        // example msg: [ 359491, 'tu', [ 560287312, 1609712228656, 0.005, 33432 ], 6 ]
        let [id, unix, amount, price] = msg[2];
        const sequenceId = Number(msg[3]);
        const side = amount > 0 ? "buy" : "sell";
        price = price.toFixed(8);
        amount = Math.abs(amount).toFixed(8);
        const trade = new Trade_1.Trade({
            exchange: "Bitfinex",
            base: market.base,
            quote: market.quote,
            tradeId: id.toFixed(),
            sequenceId,
            unix: unix,
            side,
            price,
            amount,
        });
        this.emit("trade", trade, market);
    }
    _onLevel2Snapshot(msg, market) {
        /*
            example msg:
            [
                646750,
                [
                    [ 31115, 1, 1 ],
                    [ 31114, 1, 0.31589592 ],
                    ...
                ],
                1,
                1609794291015
            ]
        */
        const bids = [];
        const asks = [];
        const sequenceId = Number(msg[2]);
        const timestampMs = msg[3];
        for (const [price, count, size] of msg[1]) {
            const isBid = size > 0;
            const result = new Level2Point_1.Level2Point(price.toFixed(8), Math.abs(size).toFixed(8), count.toFixed(0));
            if (isBid)
                bids.push(result);
            else
                asks.push(result);
        }
        const result = new Level2Snapshots_1.Level2Snapshot({
            exchange: "Bitfinex",
            base: market.base,
            quote: market.quote,
            sequenceId,
            timestampMs,
            bids,
            asks,
        });
        this.emit("l2snapshot", result, market);
    }
    /**
     * Handle heartbeat events in the l2updatae channel
     */
    _onLevel2UpdateHeartbeat(msg, market) {
        const sequenceId = Number(msg[2]);
        const timestampMs = msg[3];
        if (this.enableEmptyHeartbeatEvents === false)
            return;
        // handle heartbeat by emitting empty update w/sequenceId.
        // heartbeat msg: [ 169546, 'hb', 17, 1610921150321 ]
        let update = new Level2Update_1.Level2Update({
            exchange: "Bitfinex",
            base: market.base,
            quote: market.quote,
            sequenceId,
            timestampMs,
            asks: [],
            bids: [],
        });
        this.emit("l2update", update, market);
        return;
    }
    _onLevel2Update(msg, market) {
        // example msg: [ 646750, [ 30927, 5, 0.0908 ], 19, 1609794565952 ]
        const [price, count, size] = msg[1];
        const sequenceId = Number(msg[2]);
        const timestampMs = msg[3];
        if (!price.toFixed)
            return;
        const point = new Level2Point_1.Level2Point(price.toFixed(8), Math.abs(size).toFixed(8), count.toFixed(0));
        const asks = [];
        const bids = [];
        const isBid = size > 0;
        if (isBid)
            bids.push(point);
        else
            asks.push(point);
        const isDelete = count === 0;
        if (isDelete)
            point.size = (0).toFixed(8); // reset the size to 0, comes in as 1 or -1 to indicate bid/ask
        const update = new Level2Update_1.Level2Update({
            exchange: "Bitfinex",
            base: market.base,
            quote: market.quote,
            sequenceId,
            timestampMs,
            asks,
            bids,
        });
        this.emit("l2update", update, market);
    }
    _onLevel3Snapshot(msg, market) {
        /*
         example msg:
         [
           648087,
           [
             [ 55888179267, 31111, 0.05 ],
             [ 55895806791, 31111, 0.989 ],
             ...
           ],
           1,
           1609794565952
         ]
         */
        const bids = [];
        const asks = [];
        const orders = msg[1];
        const sequenceId = Number(msg[2]);
        const timestampMs = msg[3];
        for (const [orderId, price, size] of orders) {
            const point = new Level3Point_1.Level3Point(orderId.toFixed(), price.toFixed(8), Math.abs(size).toFixed(8));
            if (size > 0)
                bids.push(point);
            else
                asks.push(point);
        }
        const result = new Level3Snapshot_1.Level3Snapshot({
            exchange: "Bitfinex",
            base: market.base,
            quote: market.quote,
            sequenceId,
            timestampMs,
            asks,
            bids,
        });
        this.emit("l3snapshot", result, market);
    }
    /**
     * Handle heartbeat events in the l3updatae channel
     */
    _onLevel3UpdateHeartbeat(msg, market) {
        const sequenceId = Number(msg[2]);
        const timestampMs = msg[3];
        if (this.enableEmptyHeartbeatEvents === false)
            return;
        // handle heartbeat by emitting empty update w/sequenceId.
        // heartbeat msg: [ 169546, 'hb', 17, 1610921150321 ]
        let result = new Level3Update_1.Level3Update({
            exchange: "Bitfinex",
            base: market.base,
            quote: market.quote,
            sequenceId,
            timestampMs,
            asks: [],
            bids: [],
        });
        this.emit("l3update", result, market);
    }
    _onLevel3Update(msg, market) {
        // example msg: [ 648087, [ 55895794256, 31107, 0.07799627 ], 4, 1609794565952 ]
        const bids = [];
        const asks = [];
        const [orderId, price, size] = msg[1];
        const sequenceId = Number(msg[2]);
        const timestampMs = msg[3];
        const point = new Level3Point_1.Level3Point(orderId.toFixed(), price.toFixed(8), Math.abs(size).toFixed(8));
        if (size > 0)
            bids.push(point);
        else
            asks.push(point);
        const result = new Level3Update_1.Level3Update({
            exchange: "Bitfinex",
            base: market.base,
            quote: market.quote,
            sequenceId,
            timestampMs,
            asks,
            bids,
        });
        this.emit("l3update", result, market);
    }
}
exports.BitfinexClient = BitfinexClient;
//# sourceMappingURL=BitfinexClient.js.map