/// <reference types="node" />
import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { Level2Snapshot } from "../Level2Snapshots";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
export declare class UpbitClient extends BasicClient {
    debouceTimeoutHandles: Map<string, NodeJS.Timeout>;
    debounceWait: number;
    constructor({ wssPath, watcherMs }?: ClientOptions);
    protected _sendSubTicker(): void;
    protected _sendUnsubTicker(): void;
    protected _sendSubTrades(): void;
    protected _sendUnsubTrades(): void;
    protected _sendSubLevel2Snapshots(): void;
    protected _sendUnsubLevel2Snapshots(): void;
    protected _sendSubCandles: (...args: any[]) => any;
    protected _sendUnsubCandles: (...args: any[]) => any;
    protected _sendSubLevel2Updates: (...args: any[]) => any;
    protected _sendUnsubLevel2Updates: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    protected _debounce(type: string, fn: () => void): void;
    protected _onMessage(raw: Buffer): void;
    protected _processsMessage(msg: any): void;
    protected _constructTicker(msg: any, market: any): Ticker;
    protected _constructTradesFromMessage(datum: any, market: any): Trade;
    protected _constructLevel2Snapshot(msg: any, market: any): Level2Snapshot;
}
