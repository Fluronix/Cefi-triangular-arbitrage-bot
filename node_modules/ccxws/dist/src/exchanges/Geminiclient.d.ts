/// <reference types="node" />
import { EventEmitter } from "events";
import { ClientOptions } from "../ClientOptions";
import { IClient } from "../IClient";
import { Level2Snapshot } from "../Level2Snapshots";
import { Level2Update } from "../Level2Update";
import { Market } from "../Market";
import { SmartWss } from "../SmartWss";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
export declare type GeminiSubscription = {
    market: Market;
    wss: SmartWss;
    lastMessage: any;
    reconnectIntervalHandle: number;
    remoteId: string;
    trades: boolean;
    level2updates: boolean;
    tickers: boolean;
};
export declare class GeminiClient extends EventEmitter implements IClient {
    wssPath: string;
    name: string;
    reconnectIntervalMs: number;
    tickersCache: Map<string, Ticker>;
    readonly hasTickers: boolean;
    readonly hasTrades: boolean;
    readonly hasCandles: boolean;
    readonly hasLevel2Snapshots: boolean;
    readonly hasLevel2Updates: boolean;
    readonly hasLevel3Snapshots: boolean;
    readonly hasLevel3Updates: boolean;
    protected _subscriptions: Map<string, GeminiSubscription>;
    constructor({ wssPath, watcherMs }?: ClientOptions);
    reconnect(): void;
    subscribeTrades(market: Market): void;
    unsubscribeTrades(market: Market): void;
    subscribeLevel2Updates(market: Market): void;
    unsubscribeLevel2Updates(market: Market): Promise<void>;
    subscribeTicker(market: Market): void;
    unsubscribeTicker(market: Market): Promise<void>;
    subscribeCandles: (...args: any[]) => any;
    unsubscribeCandles: (...args: any[]) => any;
    subscribeLevel2Snapshots: (...args: any[]) => any;
    unsubscribeLevel2Snapshots: (...args: any[]) => any;
    subscribeLevel3Snapshots: (...args: any[]) => any;
    unsubscribeLevel3Snapshots: (...args: any[]) => any;
    subscribeLevel3Updates: (...args: any[]) => any;
    unsubscribeLevel3Updates: (...args: any[]) => any;
    close(): void;
    protected _subscribe(market: Market, mode: string): void;
    protected _unsubscribe(market: Market, mode: string): void;
    /** Connect to the websocket stream by constructing a path from
     * the subscribed markets.
     */
    protected _connect(remote_id: string): SmartWss;
    /**
     * Handles an error
     */
    protected _onError(remote_id: any, err: any): void;
    /**
     * Fires when a socket is connecting
     */
    protected _onConnecting(remote_id: any): void;
    /**
     * Fires when connected
     */
    protected _onConnected(remote_id: any): void;
    /**
     * Fires when there is a disconnection event
     */
    protected _onDisconnected(remote_id: any): void;
    /**
     * Fires when the underlying socket is closing
     */
    protected _onClosing(remote_id: any): void;
    /**
     * Fires when the underlying socket has closed
     */
    protected _onClosed(remote_id: any): void;
    /**
     * Close the underlying connction, which provides a way to reset the things
     */
    protected _close(subscription?: any): void;
    /**
     * Reconnects the socket
     */
    protected _reconnect(subscription: any): void;
    /**
     * Starts an interval to check if a reconnction is required
     */
    protected _startReconnectWatcher(subscription: any): void;
    /**
     * Stops an interval to check if a reconnection is required
     */
    protected _stopReconnectWatcher(subscription: any): void;
    /**
     * Checks if a reconnecton is required by comparing the current
     * date to the last receieved message date
     */
    protected _onReconnectCheck(subscription: any): void;
    protected _onMessage(remote_id: string, raw: string): void;
    protected _constructTrade(event: any, market: any, timestamp: any): Trade;
    protected _constructL2Snapshot(events: any, market: any, sequenceId: any, eventId: any): Level2Snapshot;
    protected _constructL2Update(events: any, market: any, sequenceId: any, timestampMs: any, eventId: any): Level2Update;
    protected _constructTicker(msg: any, market: any): Ticker;
    /**
     * Ensures that a ticker for the market exists
     * @param {*} market
     */
    protected _getTicker(market: any): Ticker;
}
