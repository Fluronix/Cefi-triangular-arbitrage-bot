import { BasicClient } from "../BasicClient";
import { BasicMultiClient } from "../BasicMultiClient";
import { Candle } from "../Candle";
import { CandlePeriod } from "../CandlePeriod";
import { IClient } from "../IClient";
import { Level2Snapshot } from "../Level2Snapshots";
import { Market } from "../Market";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
export declare type CexClientOptions = {
    apiKey: string;
    apiSecret: string;
};
export declare class CexClient extends BasicMultiClient {
    name: string;
    options: CexClientOptions;
    candlePeriod: CandlePeriod;
    /**
     * Creates a new CEX.io client using the supplied credentials
     */
    constructor(options: CexClientOptions);
    protected _createBasicClient(clientArgs: {
        market: Market;
    }): IClient;
}
export declare class SingleCexClient extends BasicClient {
    auth: {
        apiKey: string;
        apiSecret: string;
    };
    market: Market;
    hasTickers: boolean;
    hasTrades: boolean;
    hasCandles: boolean;
    hasLevel2Snapshots: boolean;
    authorized: boolean;
    parent: CexClient;
    protected _sendSubLevel2Updates: (...args: any[]) => any;
    protected _sendUnsubLevel2Updates: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    constructor({ wssPath, watcherMs, apiKey, apiSecret, market, parent, }: {
        wssPath?: string;
        watcherMs?: number;
        apiKey: string;
        apiSecret: string;
        market: Market;
        parent: CexClient;
    });
    get candlePeriod(): CandlePeriod;
    /**
     * This method is fired anytime the socket is opened, whether
     * the first time, or any subsequent reconnects.
     * Since this is an authenticated feed, we first send an authenticate
     * request, and the normal subscriptions happen after authentication has
     * completed in the _onAuthorized method.
     */
    protected _onConnected(): void;
    /**
     * Trigger after an authorization packet has been successfully received.
     * This code triggers the usual _onConnected code afterwards.
     */
    protected _onAuthorized(): void;
    protected _sendAuthorizeRequest(): void;
    protected _sendPong(): void;
    protected _sendSubTicker(): void;
    protected _sendUnsubTicker(): void;
    protected _sendSubTrades(remote_id: string): void;
    protected _sendUnsubTrades(): void;
    protected _sendSubCandles(remote_id: string): void;
    protected _sendUnsubCandles(): void;
    protected _sendSubLevel2Snapshots(remote_id: string): void;
    protected _sendUnsubLevel2Snapshots(): void;
    protected _onMessage(raw: any): void;
    protected _constructTicker(data: any, market: Market): Ticker;
    protected _constructevel2Snapshot(msg: any, market: Market): Level2Snapshot;
    protected _constructTrade(data: any, market: Market): Trade;
    /**
   {
      e: 'ohlcv1m',
      data: {
        pair: 'BTC:USD',
        time: '1597261140',
        o: '11566.8',
        h: '11566.8',
        l: '11566.8',
        c: '11566.8',
        v: 664142,
        d: 664142
      }
    }
   */
    protected _constructCandle(data: any): Candle;
}
