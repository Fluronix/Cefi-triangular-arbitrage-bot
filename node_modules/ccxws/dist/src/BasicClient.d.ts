/// <reference types="node" />
import { EventEmitter } from "events";
import { IClient } from "./IClient";
import { SmartWss } from "./SmartWss";
import { Watcher } from "./Watcher";
import { Market } from "./Market";
export declare type MarketMap = Map<string, Market>;
export declare type WssFactoryFn = (path: string) => SmartWss;
export declare type SendFn = (remoteId: string, market: Market) => void;
/**
 * Single websocket connection client with
 * subscribe and unsubscribe methods. It is also an EventEmitter
 * and broadcasts 'trade' events.
 *
 * Anytime the WSS client connects (such as a reconnect)
 * it run the _onConnected method and will resubscribe.
 */
export declare abstract class BasicClient extends EventEmitter implements IClient {
    readonly wssPath: string;
    readonly name: string;
    hasTickers: boolean;
    hasTrades: boolean;
    hasCandles: boolean;
    hasLevel2Snapshots: boolean;
    hasLevel2Updates: boolean;
    hasLevel3Snapshots: boolean;
    hasLevel3Updates: boolean;
    protected _wssFactory: WssFactoryFn;
    protected _tickerSubs: MarketMap;
    protected _tradeSubs: MarketMap;
    protected _candleSubs: MarketMap;
    protected _level2SnapshotSubs: MarketMap;
    protected _level2UpdateSubs: MarketMap;
    protected _level3SnapshotSubs: MarketMap;
    protected _level3UpdateSubs: MarketMap;
    protected _wss: SmartWss;
    protected _watcher: Watcher;
    constructor(wssPath: string, name: string, wssFactory?: WssFactoryFn, watcherMs?: number);
    close(): void;
    reconnect(): void;
    subscribeTicker(market: Market): boolean;
    unsubscribeTicker(market: Market): Promise<void>;
    subscribeCandles(market: Market): boolean;
    unsubscribeCandles(market: Market): Promise<void>;
    subscribeTrades(market: Market): boolean;
    unsubscribeTrades(market: Market): Promise<void>;
    subscribeLevel2Snapshots(market: Market): boolean;
    unsubscribeLevel2Snapshots(market: Market): Promise<void>;
    subscribeLevel2Updates(market: Market): boolean;
    unsubscribeLevel2Updates(market: Market): Promise<void>;
    subscribeLevel3Snapshots(market: Market): boolean;
    unsubscribeLevel3Snapshots(market: Market): Promise<void>;
    subscribeLevel3Updates(market: Market): boolean;
    unsubscribeLevel3Updates(market: Market): Promise<void>;
    /**
     * Helper function for performing a subscription operation
     * where a subscription map is maintained and the message
     * send operation is performed
     * @param {Market} market
     * @param {Map}} map
     * @param {String} msg
     * @param {Function} sendFn
     * @returns {Boolean} returns true when a new subscription event occurs
     */
    protected _subscribe(market: Market, map: MarketMap, sendFn: SendFn): boolean;
    /**
     * Helper function for performing an unsubscription operation
     * where a subscription map is maintained and the message
     * send operation is performed
     */
    protected _unsubscribe(market: Market, map: MarketMap, sendFn: SendFn): void;
    /**
     * Idempotent method for creating and initializing
     * a long standing web socket client. This method
     * is only called in the subscribe method. Multiple calls
     * have no effect.
     */
    protected _connect(): void;
    /**
     * Handles the error event
     * @param {Error} err
     */
    protected _onError(err: any): void;
    /**
     * Handles the connecting event. This is fired any time the
     * underlying websocket begins a connection.
     */
    protected _onConnecting(): void;
    /**
     * This method is fired anytime the socket is opened, whether
     * the first time, or any subsequent reconnects. This allows
     * the socket to immediate trigger resubscription to relevent
     * feeds
     */
    protected _onConnected(): void;
    /**
     * Handles a disconnection event
     */
    protected _onDisconnected(): void;
    /**
     * Handles the closing event
     */
    protected _onClosing(): void;
    /**
     * Fires before connect
     */
    protected _beforeConnect(): void;
    /**
     * Fires before close
     */
    protected _beforeClose(): void;
    /**
     * Handles the closed event
     */
    protected _onClosed(): void;
    protected abstract _onMessage(msg: any): any;
    protected abstract _sendSubTicker(remoteId: string, market: Market): any;
    protected abstract _sendSubCandles(remoteId: string, market: Market): any;
    protected abstract _sendUnsubCandles(remoteId: string, market: Market): any;
    protected abstract _sendUnsubTicker(remoteId: string, market: Market): any;
    protected abstract _sendSubTrades(remoteId: string, market: Market): any;
    protected abstract _sendUnsubTrades(remoteId: string, market: Market): any;
    protected abstract _sendSubLevel2Snapshots(remoteId: string, market: Market): any;
    protected abstract _sendUnsubLevel2Snapshots(remoteId: string, market: Market): any;
    protected abstract _sendSubLevel2Updates(remoteId: string, market: Market): any;
    protected abstract _sendUnsubLevel2Updates(remoteId: string, market: Market): any;
    protected abstract _sendSubLevel3Snapshots(remoteId: string, market: Market): any;
    protected abstract _sendUnsubLevel3Snapshots(remoteId: string, market: Market): any;
    protected abstract _sendSubLevel3Updates(remoteId: string, market: Market): any;
    protected abstract _sendUnsubLevel3Updates(remoteId: string, market: Market): any;
}
