"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiClient = void 0;
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const events_1 = require("events");
const Level2Point_1 = require("../Level2Point");
const Level2Snapshots_1 = require("../Level2Snapshots");
const Level2Update_1 = require("../Level2Update");
const NotImplementedFn_1 = require("../NotImplementedFn");
const SmartWss_1 = require("../SmartWss");
const Ticker_1 = require("../Ticker");
const Trade_1 = require("../Trade");
class GeminiClient extends events_1.EventEmitter {
    constructor({ wssPath, watcherMs = 30000 } = {}) {
        super();
        this.subscribeCandles = NotImplementedFn_1.NotImplementedFn;
        this.unsubscribeCandles = NotImplementedFn_1.NotImplementedFn;
        this.subscribeLevel2Snapshots = NotImplementedFn_1.NotImplementedFn;
        this.unsubscribeLevel2Snapshots = NotImplementedFn_1.NotImplementedFn;
        this.subscribeLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this.unsubscribeLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this.subscribeLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this.unsubscribeLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this.wssPath = wssPath;
        this.name = "Gemini";
        this._subscriptions = new Map();
        this.reconnectIntervalMs = watcherMs;
        this.tickersCache = new Map(); // key-value pairs of <market_id>: Ticker
        this.hasTickers = true;
        this.hasTrades = true;
        this.hasCandles = false;
        this.hasLevel2Snapshots = false;
        this.hasLevel2Updates = true;
        this.hasLevel3Snapshots = false;
        this.hasLevel3Updates = false;
    }
    reconnect() {
        for (const subscription of this._subscriptions.values()) {
            this._reconnect(subscription);
        }
    }
    subscribeTrades(market) {
        this._subscribe(market, "trades");
    }
    unsubscribeTrades(market) {
        this._unsubscribe(market, "trades");
    }
    subscribeLevel2Updates(market) {
        this._subscribe(market, "level2updates");
    }
    unsubscribeLevel2Updates(market) {
        this._unsubscribe(market, "level2updates");
        return;
    }
    subscribeTicker(market) {
        this._subscribe(market, "tickers");
    }
    unsubscribeTicker(market) {
        this._unsubscribe(market, "tickers");
        return;
    }
    close() {
        this._close();
    }
    ////////////////////////////////////////////
    // PROTECTED
    _subscribe(market, mode) {
        let remote_id = market.id.toLowerCase();
        if (mode === "tickers")
            remote_id += "-tickers";
        let subscription = this._subscriptions.get(remote_id);
        if (subscription && subscription[mode])
            return;
        if (!subscription) {
            subscription = {
                market,
                wss: this._connect(remote_id),
                lastMessage: undefined,
                reconnectIntervalHandle: undefined,
                remoteId: remote_id,
                trades: false,
                level2updates: false,
                tickers: false,
            };
            this._startReconnectWatcher(subscription);
            this._subscriptions.set(remote_id, subscription);
        }
        subscription[mode] = true;
    }
    _unsubscribe(market, mode) {
        let remote_id = market.id.toLowerCase();
        if (mode === "tickers")
            remote_id += "-tickers";
        const subscription = this._subscriptions.get(remote_id);
        if (!subscription)
            return;
        subscription[mode] = false;
        if (!subscription.trades && !subscription.level2updates) {
            this._close(this._subscriptions.get(remote_id));
            this._subscriptions.delete(remote_id);
        }
        if (mode === "tickers") {
            this.tickersCache.delete(market.id);
        }
    }
    /** Connect to the websocket stream by constructing a path from
     * the subscribed markets.
     */
    _connect(remote_id) {
        const forTickers = remote_id.endsWith("-tickers");
        const wssPath = this.wssPath || forTickers
            ? `wss://api.gemini.com/v1/marketdata/${remote_id}?heartbeat=true&top_of_book=true`
            : `wss://api.gemini.com/v1/marketdata/${remote_id}?heartbeat=true`;
        const wss = new SmartWss_1.SmartWss(wssPath);
        wss.on("error", err => this._onError(remote_id, err));
        wss.on("connecting", () => this._onConnecting(remote_id));
        wss.on("connected", () => this._onConnected(remote_id));
        wss.on("disconnected", () => this._onDisconnected(remote_id));
        wss.on("closing", () => this._onClosing(remote_id));
        wss.on("closed", () => this._onClosed(remote_id));
        wss.on("message", raw => {
            try {
                this._onMessage(remote_id, raw);
            }
            catch (err) {
                this._onError(remote_id, err);
            }
        });
        wss.connect();
        return wss;
    }
    /**
     * Handles an error
     */
    _onError(remote_id, err) {
        this.emit("error", err, remote_id);
    }
    /**
     * Fires when a socket is connecting
     */
    _onConnecting(remote_id) {
        this.emit("connecting", remote_id);
    }
    /**
     * Fires when connected
     */
    _onConnected(remote_id) {
        const subscription = this._subscriptions.get(remote_id);
        if (!subscription) {
            return;
        }
        this._startReconnectWatcher(subscription);
        this.emit("connected", remote_id);
    }
    /**
     * Fires when there is a disconnection event
     */
    _onDisconnected(remote_id) {
        this._stopReconnectWatcher(this._subscriptions.get(remote_id));
        this.emit("disconnected", remote_id);
    }
    /**
     * Fires when the underlying socket is closing
     */
    _onClosing(remote_id) {
        this._stopReconnectWatcher(this._subscriptions.get(remote_id));
        this.emit("closing", remote_id);
    }
    /**
     * Fires when the underlying socket has closed
     */
    _onClosed(remote_id) {
        this.emit("closed", remote_id);
    }
    /**
     * Close the underlying connction, which provides a way to reset the things
     */
    _close(subscription) {
        if (subscription && subscription.wss) {
            try {
                subscription.wss.close();
            }
            catch (ex) {
                if (ex.message === "WebSocket was closed before the connection was established")
                    return;
                this.emit("error", ex);
            }
            subscription.wss = undefined;
            this._stopReconnectWatcher(subscription);
        }
        else {
            this._subscriptions.forEach(sub => this._close(sub));
            this._subscriptions = new Map();
        }
    }
    /**
     * Reconnects the socket
     */
    _reconnect(subscription) {
        this.emit("reconnecting", subscription.remoteId);
        subscription.wss.once("closed", () => {
            subscription.wss = this._connect(subscription.remoteId);
        });
        this._close(subscription);
    }
    /**
     * Starts an interval to check if a reconnction is required
     */
    _startReconnectWatcher(subscription) {
        this._stopReconnectWatcher(subscription); // always clear the prior interval
        subscription.reconnectIntervalHandle = setInterval(() => this._onReconnectCheck(subscription), this.reconnectIntervalMs);
    }
    /**
     * Stops an interval to check if a reconnection is required
     */
    _stopReconnectWatcher(subscription) {
        if (subscription) {
            clearInterval(subscription.reconnectIntervalHandle);
            subscription.reconnectIntervalHandle = undefined;
        }
    }
    /**
     * Checks if a reconnecton is required by comparing the current
     * date to the last receieved message date
     */
    _onReconnectCheck(subscription) {
        if (!subscription.lastMessage ||
            subscription.lastMessage < Date.now() - this.reconnectIntervalMs) {
            this._reconnect(subscription);
        }
    }
    ////////////////////////////////////////////
    // ABSTRACT
    _onMessage(remote_id, raw) {
        const msg = JSON.parse(raw);
        const subscription = this._subscriptions.get(remote_id);
        const market = subscription.market;
        subscription.lastMessage = Date.now();
        if (!market)
            return;
        if (msg.type === "heartbeat") {
            // ex: '{"type":"heartbeat","socket_sequence":272}'
            /*
        A few notes on heartbeats and sequenceIds taken from the Gemini docs:
        - Ongoing order events are interspersed with heartbeats every five seconds
        - So you can easily ensure that you are receiving all of your WebSocket messages in the expected order without any gaps, events and heartbeats contain a special sequence number.
        - Your subscription begins - you receive your first event with socket_sequence set to a value of 0
        - For all further messages, each message - whether a heartbeat or an event - should increase this sequence number by one.
        - Each time you reconnect, the sequence number resets to zero.
        - If you have multiple WebSocket connections, each will have a separate sequence number beginning with zero - make sure to keep track of each sequence number separately!
      */
            if (subscription.level2updates) {
                /*
          So when subbed to l2 updates using sequenceId, a heartbeat event will arrive which includes sequenceId.
          You'll need to receive the heartbeat, otherwise sequence will have a gap in next l2update,
          So emit an l2update w/no ask or bid changes, only including the sequenceId
        */
                const sequenceId = msg.socket_sequence;
                this.emit("l2update", this._constructL2Update([], market, sequenceId, null, null), market);
                return;
            }
        }
        if (msg.type === "update") {
            const { timestampms, eventId, socket_sequence } = msg;
            const sequenceId = socket_sequence;
            // process trades
            if (subscription.trades) {
                const events = msg.events.filter(p => p.type === "trade" && /ask|bid/.test(p.makerSide));
                for (const event of events) {
                    const trade = this._constructTrade(event, market, timestampms);
                    this.emit("trade", trade, market);
                }
                return;
            }
            // process l2 updates
            if (subscription.level2updates) {
                const updates = msg.events.filter(p => p.type === "change");
                if (socket_sequence === 0) {
                    const snapshot = this._constructL2Snapshot(updates, market, sequenceId, eventId);
                    this.emit("l2snapshot", snapshot, market);
                }
                else {
                    const update = this._constructL2Update(updates, market, sequenceId, timestampms, eventId);
                    this.emit("l2update", update, market);
                }
                return;
            }
            // process ticker
            // tickers are processed from a seperate websocket
            if (subscription.tickers) {
                const ticker = this._constructTicker(msg, market);
                if (ticker.last && ticker.bid && ticker.ask) {
                    this.emit("ticker", ticker, market);
                }
                return;
            }
        }
    }
    _constructTrade(event, market, timestamp) {
        const side = event.makerSide === "ask" ? "sell" : "buy";
        const price = event.price;
        const amount = event.amount;
        return new Trade_1.Trade({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            tradeId: event.tid.toFixed(),
            side,
            unix: timestamp,
            price,
            amount,
        });
    }
    _constructL2Snapshot(events, market, sequenceId, eventId) {
        const asks = [];
        const bids = [];
        for (const { side, price, remaining, reason, delta } of events) {
            const update = new Level2Point_1.Level2Point(price, remaining, undefined, { reason, delta });
            if (side === "ask")
                asks.push(update);
            else
                bids.push(update);
        }
        return new Level2Snapshots_1.Level2Snapshot({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            sequenceId,
            eventId,
            asks,
            bids,
        });
    }
    _constructL2Update(events, market, sequenceId, timestampMs, eventId) {
        const asks = [];
        const bids = [];
        for (const { side, price, remaining, reason, delta } of events) {
            const update = new Level2Point_1.Level2Point(price, remaining, undefined, { reason, delta });
            if (side === "ask")
                asks.push(update);
            else
                bids.push(update);
        }
        return new Level2Update_1.Level2Update({
            exchange: this.name,
            base: market.base,
            quote: market.quote,
            sequenceId,
            eventId,
            timestampMs,
            asks,
            bids,
        });
    }
    _constructTicker(msg, market) {
        const ticker = this._getTicker(market);
        for (let i = 0; i < msg.events.length; i++) {
            const event = msg.events[i];
            // asks - top_of_book in use
            if (event.type === "change" && event.side === "ask") {
                ticker.ask = event.price;
                ticker.timestamp = msg.timestampms;
            }
            // bids - top_of_book in use
            if (event.type === "change" && event.side === "bid") {
                ticker.bid = event.price;
                ticker.timestamp = msg.timestampms;
            }
            // attach latest trade information
            if (event.type === "trade") {
                ticker.last = event.price;
                ticker.timestamp = msg.timestampms;
            }
        }
        return ticker;
    }
    /**
     * Ensures that a ticker for the market exists
     * @param {*} market
     */
    _getTicker(market) {
        if (!this.tickersCache.has(market.id)) {
            this.tickersCache.set(market.id, new Ticker_1.Ticker({
                exchange: this.name,
                base: market.base,
                quote: market.quote,
            }));
        }
        return this.tickersCache.get(market.id);
    }
}
exports.GeminiClient = GeminiClient;
//# sourceMappingURL=Geminiclient.js.map