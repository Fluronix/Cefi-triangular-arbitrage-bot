/// <reference types="node" />
import { BasicClient } from "../BasicClient";
import { BasicMultiClient } from "../BasicMultiClient";
import { CandlePeriod } from "../CandlePeriod";
import { IClient } from "../IClient";
import { Level2Snapshot } from "../Level2Snapshots";
import { Level2Update } from "../Level2Update";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
export declare type CoinexClientOptions = {};
export declare class CoinexClient extends BasicMultiClient {
    options: CoinexClientOptions;
    candlePeriod: CandlePeriod;
    constructor(options?: CoinexClientOptions);
    protected _createBasicClient(): IClient;
}
export declare class CoinexSingleClient extends BasicClient {
    retryErrorTimeout: number;
    parent: CoinexClient;
    protected _id: number;
    protected _idSubMap: Map<any, any>;
    protected _pingInterval: NodeJS.Timeout;
    constructor({ wssPath, watcherMs, parent }: {
        wssPath?: string;
        watcherMs?: number;
        parent: any;
    });
    get candlePeriod(): CandlePeriod;
    protected _beforeConnect(): void;
    protected _startPing(): void;
    protected _stopPing(): void;
    protected _sendPing(): void;
    protected _failSubscription(id: any): void;
    protected _sendSubTicker(remote_id: any): void;
    protected _sendUnsubTicker(): void;
    protected _sendSubTrades(remote_id: any): void;
    protected _sendUnsubTrades(): void;
    protected _sendSubLevel2Updates(remote_id: any): void;
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
