"use strict";
/* eslint-disable @typescript-eslint/no-implied-eval */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Watcher = void 0;
/**
 * Watcher subscribes to a client's messages and
 * will trigger a restart of the client if no
 * information has been transmitted in the checking interval
 */
class Watcher {
    constructor(client, intervalMs = 90000) {
        this.client = client;
        this.intervalMs = intervalMs;
        this._intervalHandle = undefined;
        this._lastMessage = undefined;
        client.on("ticker", this.markAlive.bind(this));
        client.on("candle", this.markAlive.bind(this));
        client.on("trade", this.markAlive.bind(this));
        client.on("l2snapshot", this.markAlive.bind(this));
        client.on("l2update", this.markAlive.bind(this));
        client.on("l3snapshot", this.markAlive.bind(this));
        client.on("l3update", this.markAlive.bind(this));
    }
    /**
     * Starts an interval to check if a reconnction is required
     */
    start() {
        this.stop(); // always clear the prior interval
        this._intervalHandle = setInterval(this._onCheck.bind(this), this.intervalMs);
    }
    /**
     * Stops an interval to check if a reconnection is required
     */
    stop() {
        clearInterval(this._intervalHandle);
        this._intervalHandle = undefined;
    }
    /**
     * Marks that a message was received
     */
    markAlive() {
        this._lastMessage = Date.now();
    }
    /**
     * Checks if a reconnecton is required by comparing the current
     * date to the last receieved message date
     */
    _onCheck() {
        if (!this._lastMessage || this._lastMessage < Date.now() - this.intervalMs) {
            this._reconnect();
        }
    }
    /**
     * Logic to perform a reconnection event of the client
     */
    _reconnect() {
        this.client.reconnect();
        this.stop();
    }
}
exports.Watcher = Watcher;
//# sourceMappingURL=Watcher.js.map