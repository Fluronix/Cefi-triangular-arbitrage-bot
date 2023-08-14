"use strict";
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BiboxBasicClient = exports.BiboxClient = void 0;
const zlib_1 = __importDefault(require("zlib"));
const events_1 = require("events");
const Watcher_1 = require("../Watcher");
const BasicClient_1 = require("../BasicClient");
const Ticker_1 = require("../Ticker");
const Trade_1 = require("../Trade");
const Level2Point_1 = require("../Level2Point");
const Level2Snapshots_1 = require("../Level2Snapshots");
const Candle_1 = require("../Candle");
const SubscriptionType_1 = require("../SubscriptionType");
const CandlePeriod_1 = require("../CandlePeriod");
const Throttle_1 = require("../flowcontrol/Throttle");
const Util_1 = require("../Util");
const NotImplementedFn_1 = require("../NotImplementedFn");
class BiboxClient extends events_1.EventEmitter {
    /**
    Bibox allows listening to multiple markets on the same
    socket. Unfortunately, they throw errors if you subscribe
    to too more than 20 markets at a time re:
    https://github.com/Biboxcom/API_Docs_en/wiki/WS_request#1-access-to-the-url
    This makes like hard and we need to batch connections, which
    is why we can't use the BasicMultiClient.
   */
    constructor(options) {
        super();
        this.subscribeLevel2Updates = NotImplementedFn_1.NotImplementedFn;
        this.unsubscribeLevel2Updates = NotImplementedFn_1.NotImplementedAsyncFn;
        this.subscribeLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this.unsubscribeLevel3Snapshots = NotImplementedFn_1.NotImplementedAsyncFn;
        this.subscribeLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this.unsubscribeLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        /**
        Stores the client used for each subscription request with teh
        key: remoteId_subType
        The value is the underlying client that is used.
       */
        this._subClients = new Map();
        /**
        List of all active clients. Clients will be removed when all
        subscriptions have vanished.
       */
        this._clients = [];
        this.options = options;
        this.hasTickers = true;
        this.hasTrades = true;
        this.hasCandles = true;
        this.hasLevel2Snapshots = true;
        this.hasLevel2Updates = false;
        this.hasLevel3Snapshots = false;
        this.hasLevel3Updates = false;
        this.subsPerClient = 20;
        this.throttleMs = 200;
        this._subscribe = (0, Throttle_1.throttle)(this.__subscribe.bind(this), this.throttleMs);
        this.candlePeriod = CandlePeriod_1.CandlePeriod._1m;
    }
    subscribeTicker(market) {
        this._subscribe(market, SubscriptionType_1.SubscriptionType.ticker);
    }
    async unsubscribeTicker(market) {
        this._unsubscribe(market, SubscriptionType_1.SubscriptionType.ticker);
    }
    subscribeTrades(market) {
        this._subscribe(market, SubscriptionType_1.SubscriptionType.trade);
    }
    unsubscribeTrades(market) {
        this._unsubscribe(market, SubscriptionType_1.SubscriptionType.trade);
    }
    subscribeCandles(market) {
        this._subscribe(market, SubscriptionType_1.SubscriptionType.candle);
    }
    async unsubscribeCandles(market) {
        this._unsubscribe(market, SubscriptionType_1.SubscriptionType.candle);
    }
    async subscribeLevel2Snapshots(market) {
        this._subscribe(market, SubscriptionType_1.SubscriptionType.level2snapshot);
    }
    async unsubscribeLevel2Snapshots(market) {
        this._unsubscribe(market, SubscriptionType_1.SubscriptionType.level2snapshot);
    }
    close() {
        this._subscribe.cancel();
        for (const client of this._clients) {
            client.close();
        }
    }
    async reconnect() {
        for (const client of this._clients) {
            client.reconnect();
            await (0, Util_1.wait)(this.timeoutMs);
        }
    }
    __subscribe(market, subscriptionType) {
        // construct the subscription key from the remote_id and the type
        // of subscription being performed
        const subKey = market.id + "_" + subscriptionType;
        // try to find the subscription client from the existing lookup
        let client = this._subClients.get(subKey);
        // if we haven't seen this market sub before first try
        // to find an available existing client
        if (!client) {
            // first try to find a client that has less than 20 subscriptions...
            client = this._clients.find(p => p.subCount < this.subsPerClient);
            // make sure we set the value
            this._subClients.set(subKey, client);
        }
        // if we were unable to find any avaialble clients, we will need
        // to create a new client.
        if (!client) {
            // construct a new client
            client = new BiboxBasicClient(this.options);
            // set properties
            client.parent = this;
            // wire up the events to pass through
            client.on("connecting", () => this.emit("connecting", market, subscriptionType));
            client.on("connected", () => this.emit("connected", market, subscriptionType));
            client.on("disconnected", () => this.emit("disconnected", market, subscriptionType));
            client.on("reconnecting", () => this.emit("reconnecting", market, subscriptionType));
            client.on("closing", () => this.emit("closing", market, subscriptionType));
            client.on("closed", () => this.emit("closed", market, subscriptionType));
            client.on("ticker", (ticker, market) => this.emit("ticker", ticker, market));
            client.on("trade", (trade, market) => this.emit("trade", trade, market));
            client.on("candle", (candle, market) => this.emit("candle", candle, market));
            client.on("l2snapshot", (l2snapshot, market) => this.emit("l2snapshot", l2snapshot, market));
            client.on("error", err => this.emit("error", err));
            // push it into the list of clients
            this._clients.push(client);
            // make sure we set the value
            this._subClients.set(subKey, client);
        }
        // now that we have a client, call the sub method, which
        // should be an idempotent method, so no harm in calling it again
        switch (subscriptionType) {
            case SubscriptionType_1.SubscriptionType.ticker:
                client.subscribeTicker(market);
                break;
            case SubscriptionType_1.SubscriptionType.trade:
                client.subscribeTrades(market);
                break;
            case SubscriptionType_1.SubscriptionType.candle:
                client.subscribeCandles(market);
                break;
            case SubscriptionType_1.SubscriptionType.level2snapshot:
                client.subscribeLevel2Snapshots(market);
                break;
        }
    }
    _unsubscribe(market, subscriptionType) {
        // construct the subscription key from the remote_id and the type
        // of subscription being performed
        const subKey = market.id + "_" + subscriptionType;
        // find the client
        const client = this._subClients.get(subKey);
        // abort if nothign to do
        if (!client)
            return;
        // perform the unsubscribe operation
        switch (subscriptionType) {
            case SubscriptionType_1.SubscriptionType.ticker:
                client.unsubscribeTicker(market);
                break;
            case SubscriptionType_1.SubscriptionType.trade:
                client.unsubscribeTrades(market);
                break;
            case SubscriptionType_1.SubscriptionType.candle:
                client.unsubscribeCandles(market);
                break;
            case SubscriptionType_1.SubscriptionType.level2snapshot:
                client.unsubscribeLevel2Snapshots(market);
                break;
        }
        // remove the client if nothing left to do
        if (client.subCount === 0) {
            client.close();
            const idx = this._clients.indexOf(client);
            this._clients.splice(idx, 1);
        }
    }
}
exports.BiboxClient = BiboxClient;
class BiboxBasicClient extends BasicClient_1.BasicClient {
    /**
    Manages connections for a single market. A single
    socket is only allowed to work for 20 markets.
   */
    constructor({ wssPath = "wss://push.bibox.com", watcherMs = 600 * 1000 } = {}) {
        super(wssPath, "Bibox");
        this._sendSubLevel2Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel2Updates = NotImplementedFn_1.NotImplementedAsyncFn;
        this._sendSubLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Snapshots = NotImplementedFn_1.NotImplementedAsyncFn;
        this._sendSubLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this._sendUnsubLevel3Updates = NotImplementedFn_1.NotImplementedAsyncFn;
        this._watcher = new Watcher_1.Watcher(this, watcherMs);
        this.hasTickers = true;
        this.hasTrades = true;
        this.hasCandles = true;
        this.hasLevel2Snapshots = true;
        this.subCount = 0;
    }
    get candlePeriod() {
        return this.parent.candlePeriod;
    }
    /**
    Server will occassionally send ping messages. Client is expected
    to respond with a pong message that matches the identifier.
    If client fails to do this, server will abort connection after
    second attempt.
   */
    _sendPong(id) {
        this._wss.send(JSON.stringify({ pong: id }));
    }
    _sendSubTicker(remote_id) {
        this.subCount++;
        this._wss.send(JSON.stringify({
            event: "addChannel",
            channel: `bibox_sub_spot_${remote_id}_ticker`,
        }));
    }
    async _sendUnsubTicker(remote_id) {
        this.subCount--;
        this._wss.send(JSON.stringify({
            event: "removeChannel",
            channel: `bibox_sub_spot_${remote_id}_ticker`,
        }));
    }
    async _sendSubTrades(remote_id) {
        this.subCount++;
        this._wss.send(JSON.stringify({
            event: "addChannel",
            channel: `bibox_sub_spot_${remote_id}_deals`,
        }));
    }
    _sendUnsubTrades(remote_id) {
        this.subCount--;
        this._wss.send(JSON.stringify({
            event: "removeChannel",
            channel: `bibox_sub_spot_${remote_id}_deals`,
        }));
    }
    _sendSubCandles(remote_id) {
        this.subCount++;
        this._wss.send(JSON.stringify({
            event: "addChannel",
            channel: `bibox_sub_spot_${remote_id}_kline_${candlePeriod(this.candlePeriod)}`,
        }));
    }
    async _sendUnsubCandles(remote_id) {
        this.subCount--;
        this._wss.send(JSON.stringify({
            event: "removeChannel",
            channel: `bibox_sub_spot_${remote_id}_kline_${candlePeriod(this.candlePeriod)}`,
        }));
    }
    async _sendSubLevel2Snapshots(remote_id) {
        this.subCount++;
        this._wss.send(JSON.stringify({
            event: "addChannel",
            channel: `bibox_sub_spot_${remote_id}_depth`,
        }));
    }
    async _sendUnsubLevel2Snapshots(remote_id) {
        this.subCount--;
        this._wss.send(JSON.stringify({
            event: "removeChannel",
            channel: `bibox_sub_spot_${remote_id}_depth`,
        }));
    }
    /**
    Message usually arives as a string, that must first be converted
    to JSON. Then we can process each message in the payload and
    perform gunzip on the data.
   */
    _onMessage(raw) {
        const msgs = typeof raw == "string" ? JSON.parse(raw) : raw;
        if (Array.isArray(msgs)) {
            for (const msg of msgs) {
                this._processsMessage(msg);
            }
        }
        else {
            this._processsMessage(msgs);
        }
    }
    /**
    Process the individaul message that was sent from the server.
    Message will be informat:

    {
      channel: 'bibox_sub_spot_BTC_USDT_deals',
      binary: '1',
      data_type: 1,
      data:
        'H4sIAAAAAAAA/xTLMQ6CUAyA4bv8c0Ne4RWeHdUbiJMxhghDB5QgTsa7Gw/wXT4sQ6w4+/5wO5+OPcIW84SrWdPtsllbrAjLGvcJJ6cmVZoNYZif78eGo1UqjSK8YvxLIUa8bjWnrtbyvf4CAAD//1PFt6BnAAAA'
    }
   */
    _processsMessage(msg) {
        // if we detect gzip data, we need to process it
        if (msg.binary == 1) {
            const buffer = zlib_1.default.gunzipSync(Buffer.from(msg.data, "base64"));
            msg.data = JSON.parse(buffer.toString());
        }
        // server will occassionally send a ping message and client
        // must respon with appropriate identifier
        if (msg.ping) {
            this._sendPong(msg.ping);
            return;
        }
        // watch for error messages
        if (msg.error) {
            const err = new Error(msg.error);
            err.message = msg;
            this.emit("error", err);
            return;
        }
        if (!msg.channel) {
            return;
        }
        if (msg.channel.endsWith("_deals")) {
            // trades are send in descendinging order
            // out library standardize to asc order so perform a reverse
            const data = msg.data.slice().reverse();
            for (const datum of data) {
                const market = this._tradeSubs.get(datum.pair);
                if (!market)
                    return;
                const trade = this._constructTradesFromMessage(datum, market);
                this.emit("trade", trade, market);
            }
            return;
        }
        // tickers
        if (msg.channel.endsWith("_ticker")) {
            const market = this._tickerSubs.get(msg.data.pair);
            if (!market)
                return;
            const ticker = this._constructTicker(msg, market);
            this.emit("ticker", ticker, market);
            return;
        }
        // l2 updates
        if (msg.channel.endsWith("depth")) {
            const remote_id = msg.data.pair;
            const market = this._level2SnapshotSubs.get(remote_id) || this._level2UpdateSubs.get(remote_id);
            if (!market)
                return;
            const snapshot = this._constructLevel2Snapshot(msg, market);
            this.emit("l2snapshot", snapshot, market);
            return;
        }
        // candle
        if (msg.channel.endsWith(`kline_${candlePeriod(this.candlePeriod)}`)) {
            // bibox_sub_spot_BTC_USDT_kline_1min
            const remote_id = msg.channel
                .replace("bibox_sub_spot_", "")
                .replace(`_kline_${candlePeriod(this.candlePeriod)}`, "");
            const market = this._candleSubs.get(remote_id);
            if (!market)
                return;
            for (const datum of msg.data) {
                const candle = this._constructCandle(datum);
                this.emit("candle", candle, market);
            }
        }
    }
    /*
    Constructs a ticker from the source
    {
      channel: 'bibox_sub_spot_BIX_BTC_ticker',
      binary: 1,
      data_type: 1,
      data:
      { last: '0.00003573',
        buy: '0.00003554',
        sell: '0.00003589',
        base_last_cny: '0.86774973',
        last_cny: '0.86',
        buy_amount: '6.1867',
        percent: '-1.68%',
        pair: 'BIX_BTC',
        high: '0.00003700',
        vol: '737995',
        last_usd: '0.12',
        low: '0.00003535',
        sell_amount: '880.0475',
        timestamp: 1547546988399 }
      }
  */
    _constructTicker(msg, market) {
        let { last, buy, sell, vol, percent, low, high, timestamp } = msg.data;
        percent = percent.replace(/%|\+/g, "");
        const change = (parseFloat(last) * parseFloat(percent)) / 100;
        const open = parseFloat(last) - change;
        return new Ticker_1.Ticker({
            exchange: "Bibox",
            base: market.base,
            quote: market.quote,
            timestamp,
            last,
            open: open.toFixed(8),
            high: high,
            low: low,
            volume: vol,
            change: change.toFixed(8),
            changePercent: percent,
            bid: buy,
            ask: sell,
        });
    }
    /*
    Construct a trade
    {
      channel: 'bibox_sub_spot_BIX_BTC_deals',
      binary: '1',
      data_type: 1,
      data:
      [ { pair: 'BIX_BTC',
          time: 1547544945204,
          price: 0.0000359,
          amount: 6.1281,
          side: 2,
          id: 189765713 } ]
    }
  */
    _constructTradesFromMessage(datum, market) {
        let { time, price, amount, side, id } = datum;
        side = side === 1 ? "buy" : "sell";
        return new Trade_1.Trade({
            exchange: "Bibox",
            base: market.base,
            quote: market.quote,
            tradeId: id,
            side,
            unix: time,
            price,
            amount,
        });
    }
    /**
   {
      channel: 'bibox_sub_spot_BTC_USDT_kline_1min',
      binary: 1,
      data_type: 1,
      data: [
        {
          time: 1597259460000,
          open: '11521.38000000',
          high: '11540.58990000',
          low: '11521.28990000',
          close: '11540.56990000',
          vol: '11.24330000'
        },
        {
          time: 1597259520000,
          open: '11540.55990000',
          high: '11540.58990000',
          low: '11533.13000000',
          close: '11536.83990000',
          vol: '10.88200000'
        }
      ]
    }
   */
    _constructCandle(datum) {
        return new Candle_1.Candle(datum.time, datum.open, datum.high, datum.low, datum.close, datum.vol);
    }
    /* Converts from a raw message
    {
        "binary": 0,
        "channel": "ok_sub_spot_bch_btc_depth",
        "data": { update_time: 1547549824601,
            asks:
            [ { volume: '433.588', price: '0.00003575' },
              { volume: '1265.6753', price: '0.00003576' },
                 ..
              { volume: '69.5745', price: '0.000041' },
              { volume: '5.277', price: '0.00004169' },
              ... 100 more items ],
            bids:
            [ { volume: '6.1607', price: '0.00003571' },
              { volume: '704.8954', price: '0.00003538' },
                 ..
              { volume: '155000', price: '2e-8' },
              { volume: '8010000', price: '1e-8' } ],
            pair: 'BIX_BTC' }
    }
  */
    _constructLevel2Snapshot(msg, market) {
        const asks = msg.data.asks.map(p => new Level2Point_1.Level2Point(p.price, p.volume));
        const bids = msg.data.bids.map(p => new Level2Point_1.Level2Point(p.price, p.volume));
        return new Level2Snapshots_1.Level2Snapshot({
            exchange: "Bibox",
            base: market.base,
            quote: market.quote,
            timestampMs: msg.data.update_time,
            asks,
            bids,
        });
    }
}
exports.BiboxBasicClient = BiboxBasicClient;
function candlePeriod(period) {
    switch (period) {
        case CandlePeriod_1.CandlePeriod._1m:
            return "1min";
        case CandlePeriod_1.CandlePeriod._5m:
            return "5min";
        case CandlePeriod_1.CandlePeriod._15m:
            return "15min";
        case CandlePeriod_1.CandlePeriod._30m:
            return "30min";
        case CandlePeriod_1.CandlePeriod._1h:
            return "1hour";
        case CandlePeriod_1.CandlePeriod._2h:
            return "2hour";
        case CandlePeriod_1.CandlePeriod._4h:
            return "4hour";
        case CandlePeriod_1.CandlePeriod._6h:
            return "6hour";
        case CandlePeriod_1.CandlePeriod._12h:
            return "12hour";
        case CandlePeriod_1.CandlePeriod._1d:
            return "day";
        case CandlePeriod_1.CandlePeriod._1w:
            return "week";
    }
}
//# sourceMappingURL=BiboxClient.js.map