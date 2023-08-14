import { BasicClient } from "../BasicClient";
import { Candle } from "../Candle";
import { CandlePeriod } from "../CandlePeriod";
import { ClientOptions } from "../ClientOptions";
import { CancelableFn } from "../flowcontrol/Fn";
import { Level2Update } from "../Level2Update";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
/**
 * Implements the v3 API:
 * https://bittrex.github.io/api/v3#topic-Synchronizing
 * https://bittrex.github.io/guides/v3/upgrade
 *
 * This client uses SignalR and requires a custom connection strategy to
 * obtain a socket. Otherwise, things are relatively the same vs a
 * standard client.
 */
export declare class BittrexClient extends BasicClient {
    candlePeriod: CandlePeriod;
    orderBookDepth: number;
    connectInitTimeoutMs: number;
    protected _subbedTickers: boolean;
    protected _messageId: number;
    protected _requestLevel2Snapshot: CancelableFn;
    protected _sendSubLevel2Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel2Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    constructor({ wssPath, watcherMs, throttleL2Snapshot }?: ClientOptions);
    protected _beforeConnect(): void;
    protected _beforeClose(): void;
    protected _sendHeartbeat(): void;
    protected _sendSubTicker(): void;
    protected _sendUnsubTicker(): void;
    protected _sendSubTrades(remote_id: any): void;
    protected _sendUnsubTrades(remote_id: any): void;
    protected _sendSubCandles(remote_id: any): void;
    protected _sendUnsubCandles(remote_id: any): void;
    protected _sendSubLevel2Updates(remote_id: any, market: any): void;
    protected _sendUnsubLevel2Updates(remote_id: any): void;
    /**
     * Requires connecting to SignalR which has a whole BS negotiation
     * to obtain a token, similar to Kucoin actually.
     */
    protected _connect(): void;
    /**
     * Asynchronously connect to a socket. This method will retrieve a token
     * from an HTTP request and then construct a websocket. If the HTTP
     * request fails, it will retry until successful.
     */
    protected _connectAsync(): Promise<void>;
    protected _onMessage(raw: any): void;
    /**
   {
      "sequence": 3584000,
      "deltas": [
        {
          symbol: 'BTC-USDT',
          high: '12448.02615735',
          low: '11773.32163568',
          volume: '640.86060471',
          quoteVolume: '7714634.67704918',
          percentChange: '3.98',
          updatedAt: '2020-08-17T20:16:27.617Z'
        }
      ]
    }
   */
    protected _processTickers(err: any, raw: any): void;
    protected _constructTicker(msg: any, market: any): Ticker;
    /**
   {
      deltas: [
        {
          id: 'edacd990-7c5f-4c75-8a66-ce0a71093b3c',
          executedAt: '2020-08-17T20:36:39.96Z',
          quantity: '0.00714818',
          rate: '12301.34800000',
          takerSide: 'BUY'
        }
      ],
      sequence: 18344,
      marketSymbol: 'BTC-USDT'
    }
   */
    protected _processTrades(err: any, raw: any): void;
    protected _constructTrade(msg: any, market: any): Trade;
    /**
   {
      sequence: 10808,
      marketSymbol: 'BTC-USDT',
      interval: 'MINUTE_1',
      delta: {
        startsAt: '2020-08-17T20:47:00Z',
        open: '12311.59599999',
        high: '12311.59599999',
        low: '12301.57150000',
        close: '12301.57150000',
        volume: '1.65120614',
        quoteVolume: '20319.96359337'
      }
    }
   */
    protected _processCandles(err: any, raw: any): void;
    protected _constructCandle(msg: any): Candle;
    /**
   {
      marketSymbol: 'BTC-USDT',
      depth: 500,
      sequence: 545851,
      bidDeltas: [
        { quantity: '0', rate: '12338.47320003' },
        { quantity: '0.01654433', rate: '10800.62000000' }
      ],
      askDeltas: []
    }
   */
    protected _processLevel2Update(err: any, raw: any): void;
    protected _constructLevel2Update(msg: any, market: any): Level2Update;
    protected __requestLevel2Snapshot(market: any): Promise<void>;
}
