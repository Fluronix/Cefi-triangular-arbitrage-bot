import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { Level2Snapshot } from "../Level2Snapshots";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
export declare class ZbClient extends BasicClient {
    remoteIdMap: Map<string, string>;
    constructor({ wssPath, watcherMs }?: ClientOptions);
    protected _sendSubTicker(remote_id: string): void;
    protected _sendUnsubTicker(remote_id: string): void;
    protected _sendSubTrades(remote_id: string): void;
    protected _sendUnsubTrades(remote_id: string): void;
    protected _sendSubLevel2Snapshots(remote_id: string): void;
    protected _sendUnsubLevel2Snapshots(remote_id: string): void;
    protected _sendSubCandles: (...args: any[]) => any;
    protected _sendUnsubCandles: (...args: any[]) => any;
    protected _sendSubLevel2Updates: (...args: any[]) => any;
    protected _sendUnsubLevel2Updates: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    protected _onMessage(raw: any): void;
    protected _constructTicker(data: any, market: any): Ticker;
    protected _constructTradesFromMessage(datum: any, market: any): Trade;
    protected _constructLevel2Snapshot(msg: any, market: any): Level2Snapshot;
}
