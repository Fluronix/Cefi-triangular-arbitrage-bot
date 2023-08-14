import { BasicClient } from "../BasicClient";
export declare class FtxBaseClient extends BasicClient {
    constructor({ name, wssPath, watcherMs }: {
        name: any;
        wssPath: any;
        watcherMs: any;
    });
    protected _sendSubTicker(market: any): void;
    protected _sendUnsubTicker(market: any): void;
    protected _sendSubTrades(market: any): void;
    protected _sendUnsubTrades(market: any): void;
    protected _sendSubLevel2Updates(market: any): void;
    protected _sendUnsubLevel2Updates(market: any): void;
    protected _sendSubCandles: (...args: any[]) => any;
    protected _sendUnsubCandles: (...args: any[]) => any;
    protected _sendSubLevel2Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel2Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    protected _onMessage(raw: any): void;
    protected _tickerMessageHandler(data: any, symbol: any): void;
    protected _tradesMessageHandler(data: any, symbol: any): void;
    protected _orderbookMessageHandler(data: any, symbol: any, type: any): void;
    protected _orderbookUpdateEvent(data: any, market: any): void;
    protected _orderbookSnapshotEvent(data: any, market: any): void;
    protected _orderbookEventContent(data: any, market: any): {
        exchange: string;
        base: any;
        quote: any;
        timestampMs: number;
        asks: any;
        bids: any;
        checksum: any;
    };
    protected _timeToTimestampMs(time: any): number;
}
