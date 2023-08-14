/// <reference types="node" />
import { IClient } from "../IClient";
import { EventEmitter } from "events";
import { BasicClient } from "../BasicClient";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
import { Level2Snapshot } from "../Level2Snapshots";
import { Candle } from "../Candle";
import { SubscriptionType } from "../SubscriptionType";
import { CandlePeriod } from "../CandlePeriod";
import { Market } from "../Market";
import { CancelableFn } from "../flowcontrol/Fn";
export declare type BatchedClient = IClient & {
    parent?: IClient;
    subCount?: number;
};
export declare class BiboxClient extends EventEmitter implements IClient {
    readonly throttleMs: number;
    readonly timeoutMs: number;
    readonly subsPerClient: number;
    readonly options: any;
    readonly hasTickers: boolean;
    readonly hasTrades: boolean;
    readonly hasCandles: boolean;
    readonly hasLevel2Snapshots: boolean;
    readonly hasLevel2Updates: boolean;
    readonly hasLevel3Snapshots: boolean;
    readonly hasLevel3Updates: boolean;
    candlePeriod: CandlePeriod;
    protected _subClients: Map<string, BiboxBasicClient>;
    protected _clients: BiboxBasicClient[];
    protected _subscribe: CancelableFn;
    subscribeLevel2Updates: (...args: any[]) => any;
    unsubscribeLevel2Updates: (...args: any[]) => Promise<any>;
    subscribeLevel3Snapshots: (...args: any[]) => any;
    unsubscribeLevel3Snapshots: (...args: any[]) => Promise<any>;
    subscribeLevel3Updates: (...args: any[]) => any;
    unsubscribeLevel3Updates: (...args: any[]) => any;
    /**
    Bibox allows listening to multiple markets on the same
    socket. Unfortunately, they throw errors if you subscribe
    to too more than 20 markets at a time re:
    https://github.com/Biboxcom/API_Docs_en/wiki/WS_request#1-access-to-the-url
    This makes like hard and we need to batch connections, which
    is why we can't use the BasicMultiClient.
   */
    constructor(options?: any);
    subscribeTicker(market: Market): void;
    unsubscribeTicker(market: any): Promise<void>;
    subscribeTrades(market: any): void;
    unsubscribeTrades(market: any): void;
    subscribeCandles(market: any): void;
    unsubscribeCandles(market: any): Promise<void>;
    subscribeLevel2Snapshots(market: any): Promise<void>;
    unsubscribeLevel2Snapshots(market: any): Promise<void>;
    close(): void;
    reconnect(): Promise<void>;
    protected __subscribe(market: Market, subscriptionType: SubscriptionType): void;
    protected _unsubscribe(market: Market, subscriptionType: SubscriptionType): void;
}
export declare class BiboxBasicClient extends BasicClient {
    subCount: number;
    parent: BiboxClient;
    protected _sendSubLevel2Updates: (...args: any[]) => any;
    protected _sendUnsubLevel2Updates: (...args: any[]) => Promise<any>;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => Promise<any>;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => Promise<any>;
    /**
    Manages connections for a single market. A single
    socket is only allowed to work for 20 markets.
   */
    constructor({ wssPath, watcherMs }?: {
        wssPath?: string;
        watcherMs?: number;
    });
    get candlePeriod(): CandlePeriod;
    /**
    Server will occassionally send ping messages. Client is expected
    to respond with a pong message that matches the identifier.
    If client fails to do this, server will abort connection after
    second attempt.
   */
    protected _sendPong(id: any): void;
    protected _sendSubTicker(remote_id: string): void;
    protected _sendUnsubTicker(remote_id: string): Promise<void>;
    protected _sendSubTrades(remote_id: string): Promise<void>;
    protected _sendUnsubTrades(remote_id: string): void;
    protected _sendSubCandles(remote_id: any): void;
    protected _sendUnsubCandles(remote_id: any): Promise<void>;
    protected _sendSubLevel2Snapshots(remote_id: any): Promise<void>;
    protected _sendUnsubLevel2Snapshots(remote_id: any): Promise<void>;
    /**
    Message usually arives as a string, that must first be converted
    to JSON. Then we can process each message in the payload and
    perform gunzip on the data.
   */
    protected _onMessage(raw: any): void;
    /**
    Process the individaul message that was sent from the server.
    Message will be informat:

    {
      channel: 'bibox_sub_spot_BTC_USDT_deals',
      binary: '1',
      data_type: 1,
      data:
        'H4sIAAAAAAAA/xTLMQ6CUAyA4bv8c0Ne4RWeHdUbiJMxhghDB5QgTsa7Gw/wXT4sQ6w4+/5wO5+OPcIW84SrWdPtsllbrAjLGvcJJ6cmVZoNYZif78eGo1UqjSK8YvxLIUa8bjWnrtbyvf4CAAD//1PFt6BnAAAA'
    }
   */
    protected _processsMessage(msg: any): void;
    protected _constructTicker(msg: any, market: Market): Ticker;
    protected _constructTradesFromMessage(datum: any, market: Market): Trade;
    /**
   {
      channel: 'bibox_sub_spot_BTC_USDT_kline_1min',
      binary: 1,
      data_type: 1,
      data: [
        {
          time: 1597259460000,
          open: '11521.38000000',
          high: '11540.58990000',
          low: '11521.28990000',
          close: '11540.56990000',
          vol: '11.24330000'
        },
        {
          time: 1597259520000,
          open: '11540.55990000',
          high: '11540.58990000',
          low: '11533.13000000',
          close: '11536.83990000',
          vol: '10.88200000'
        }
      ]
    }
   */
    protected _constructCandle(datum: any): Candle;
    protected _constructLevel2Snapshot(msg: any, market: Market): Level2Snapshot;
}
