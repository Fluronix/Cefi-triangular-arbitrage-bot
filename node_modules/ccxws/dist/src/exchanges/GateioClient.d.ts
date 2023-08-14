/// <reference types="node" />
import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { Level2Snapshot } from "../Level2Snapshots";
import { Level2Update } from "../Level2Update";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
/**
 * Gate.io now supports subscribing to multiple markets from a single socket connection.
 * These requests will be debounced so that multiple subscriptions will trigger a
 * single call to subscribe.
 *
 * Additionally, depending on the REST method used, the market_id's will be lower
 * or uppercase. Websockets require market_id in uppercase, however the client
 * can handle either.
 */
export declare class GateioClient extends BasicClient {
    debounceWait: number;
    protected _debounceHandles: Map<any, any>;
    protected _pingInterval: NodeJS.Timeout;
    constructor({ wssPath, watcherMs }?: ClientOptions);
    protected _debounce(type: any, fn: any): void;
    protected _beforeConnect(): void;
    protected _startPing(): void;
    protected _stopPing(): void;
    protected _sendPing(): void;
    protected _sendSubTicker(): void;
    protected _sendUnsubTicker(): void;
    protected _sendSubTrades(): void;
    protected _sendUnsubTrades(): void;
    protected _sendSubLevel2Updates(): void;
    protected _sendUnsubLevel2Updates(): void;
    protected _sendSubCandles: (...args: any[]) => any;
    protected _sendUnsubCandles: (...args: any[]) => any;
    protected _sendSubLevel2Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel2Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    protected _onMessage(raw: any): void;
    protected _constructTicker(rawTick: any, market: any): Ticker;
    protected _constructTrade(rawTrade: any, market: any): Trade;
    protected _constructLevel2Snapshot(rawUpdate: any, market: any): Level2Snapshot;
    protected _constructLevel2Update(rawUpdate: any, market: any): Level2Update;
}
