"use strict";
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicMultiClient = void 0;
const events_1 = require("events");
const semaphore_1 = __importDefault(require("semaphore"));
const SubscriptionType_1 = require("./SubscriptionType");
const Util_1 = require("./Util");
const NotImplementedFn_1 = require("./NotImplementedFn");
class BasicMultiClient extends events_1.EventEmitter {
    constructor() {
        super();
        this.subscribeLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this.unsubscribeLevel3Snapshots = NotImplementedFn_1.NotImplementedFn;
        this.subscribeLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this.unsubscribeLevel3Updates = NotImplementedFn_1.NotImplementedFn;
        this._clients = new Map();
        this.hasTickers = false;
        this.hasTrades = false;
        this.hasCandles = false;
        this.hasLevel2Snapshots = false;
        this.hasLevel2Updates = false;
        this.hasLevel3Snapshots = false;
        this.hasLevel3Updates = false;
        this.throttleMs = 250;
        this.sem = (0, semaphore_1.default)(3); // this can be overriden to allow more or less
    }
    async reconnect() {
        for (const client of Array.from(this._clients.values())) {
            (await client).reconnect();
            await (0, Util_1.wait)(this.throttleMs); // delay the reconnection throttling
        }
    }
    async close() {
        for (const client of Array.from(this._clients.values())) {
            (await client).close();
        }
    }
    ////// PUBLIC
    subscribeTicker(market) {
        if (!this.hasTickers)
            return;
        this._subscribe(market, this._clients, SubscriptionType_1.SubscriptionType.ticker);
    }
    async unsubscribeTicker(market) {
        if (!this.hasTickers)
            return;
        if (this._clients.has(market.id)) {
            const client = await this._clients.get(market.id);
            client.unsubscribeTicker(market);
        }
    }
    subscribeCandles(market) {
        if (!this.hasCandles)
            return;
        this._subscribe(market, this._clients, SubscriptionType_1.SubscriptionType.candle);
    }
    async unsubscribeCandles(market) {
        if (!this.hasCandles)
            return;
        if (this._clients.has(market.id)) {
            const client = await this._clients.get(market.id);
            client.unsubscribeCandles(market);
        }
    }
    subscribeTrades(market) {
        if (!this.hasTrades)
            return;
        this._subscribe(market, this._clients, SubscriptionType_1.SubscriptionType.trade);
    }
    async unsubscribeTrades(market) {
        if (!this.hasTrades)
            return;
        if (this._clients.has(market.id)) {
            const client = await this._clients.get(market.id);
            client.unsubscribeTrades(market);
        }
    }
    subscribeLevel2Updates(market) {
        if (!this.hasLevel2Updates)
            return;
        this._subscribe(market, this._clients, SubscriptionType_1.SubscriptionType.level2update);
    }
    async unsubscribeLevel2Updates(market) {
        if (!this.hasLevel2Updates)
            return;
        if (this._clients.has(market.id)) {
            const client = await this._clients.get(market.id);
            client.unsubscribeLevel2Updates(market);
        }
    }
    subscribeLevel2Snapshots(market) {
        if (!this.hasLevel2Snapshots)
            return;
        this._subscribe(market, this._clients, SubscriptionType_1.SubscriptionType.level2snapshot);
    }
    async unsubscribeLevel2Snapshots(market) {
        if (!this.hasLevel2Snapshots)
            return;
        if (this._clients.has(market.id)) {
            const client = await this._clients.get(market.id);
            client.unsubscribeLevel2Snapshots(market);
        }
    }
    ////// PROTECTED
    _createBasicClientThrottled(clientArgs) {
        return new Promise(resolve => {
            this.sem.take(() => {
                const client = this._createBasicClient(clientArgs);
                client.on("connecting", () => this.emit("connecting", clientArgs.market));
                client.on("connected", () => this.emit("connected", clientArgs.market));
                client.on("disconnected", () => this.emit("disconnected", clientArgs.market));
                client.on("reconnecting", () => this.emit("reconnecting", clientArgs.market));
                client.on("closing", () => this.emit("closing", clientArgs.market));
                client.on("closed", () => this.emit("closed", clientArgs.market));
                client.on("error", err => this.emit("error", err, clientArgs.market));
                const clearSem = async () => {
                    await (0, Util_1.wait)(this.throttleMs);
                    this.sem.leave();
                    resolve(client);
                };
                client.once("connected", clearSem);
                client._connect();
            });
        });
    }
    async _subscribe(market, map, subscriptionType) {
        try {
            const remote_id = market.id;
            let client = null;
            // construct a client
            if (!map.has(remote_id)) {
                const clientArgs = { auth: this.auth, market: market };
                client = this._createBasicClientThrottled(clientArgs);
                // we MUST store the promise in here otherwise we will stack up duplicates
                map.set(remote_id, client);
            }
            // wait for client to be made!
            client = await map.get(remote_id);
            if (subscriptionType === SubscriptionType_1.SubscriptionType.ticker) {
                const subscribed = client.subscribeTicker(market);
                if (subscribed) {
                    client.on("ticker", (ticker, market) => {
                        this.emit("ticker", ticker, market);
                    });
                }
            }
            if (subscriptionType === SubscriptionType_1.SubscriptionType.candle) {
                const subscribed = client.subscribeCandles(market);
                if (subscribed) {
                    client.on("candle", (candle, market) => {
                        this.emit("candle", candle, market);
                    });
                }
            }
            if (subscriptionType === SubscriptionType_1.SubscriptionType.trade) {
                const subscribed = client.subscribeTrades(market);
                if (subscribed) {
                    client.on("trade", (trade, market) => {
                        this.emit("trade", trade, market);
                    });
                }
            }
            if (subscriptionType === SubscriptionType_1.SubscriptionType.level2update) {
                const subscribed = client.subscribeLevel2Updates(market);
                if (subscribed) {
                    client.on("l2update", (l2update, market) => {
                        this.emit("l2update", l2update, market);
                    });
                    client.on("l2snapshot", (l2snapshot, market) => {
                        this.emit("l2snapshot", l2snapshot, market);
                    });
                }
            }
            if (subscriptionType === SubscriptionType_1.SubscriptionType.level2snapshot) {
                const subscribed = client.subscribeLevel2Snapshots(market);
                if (subscribed) {
                    client.on("l2snapshot", (l2snapshot, market) => {
                        this.emit("l2snapshot", l2snapshot, market);
                    });
                }
            }
        }
        catch (ex) {
            this.emit("error", ex, market);
        }
    }
}
exports.BasicMultiClient = BasicMultiClient;
//# sourceMappingURL=BasicMultiClient.js.map