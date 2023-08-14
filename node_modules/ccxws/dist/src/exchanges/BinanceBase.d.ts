/**
 * Binance now (as of Nov 2019) has the ability to perform live subscribes using
 * a single socket. With this functionality, there is no longer a need to
 * use the URL-mutation code and we can use a BasicClient and allow subscribing
 * and unsubscribing.
 *
 * Binance allows subscribing to many streams at the same time, however there is
 * a max payload length that cannot be exceeded. This requires the use of a
 * subscription batching method.
 *
 * Binance limits the number of messages that can be sent as well so throttling
 * of batched sends must be performed.
 *
 * _sendSubTrades calls _batchSub
 * _batchSub uses the `batch` flow control helper to batch all calls on the
 *    same tick into a single call
 * _batchSub calls _sendMessage
 * _sendMessage uses the `throttle` flow controler helper to limit calls to
 *    1 per second
 *
 */
import { BasicClient } from "../BasicClient";
import { Candle } from "../Candle";
import { CandlePeriod } from "../CandlePeriod";
import { CancelableFn } from "../flowcontrol/Fn";
import { Level2Snapshot } from "../Level2Snapshots";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
import { Market } from "../Market";
import { Level2Update } from "../Level2Update";
export declare type BinanceClientOptions = {
    name?: string;
    wssPath?: string;
    restL2SnapshotPath?: string;
    watcherMs?: number;
    useAggTrades?: boolean;
    requestSnapshot?: boolean;
    socketBatchSize?: number;
    socketThrottleMs?: number;
    restThrottleMs?: number;
    l2updateSpeed?: string;
    l2snapshotSpeed?: string;
    testNet?: boolean;
    batchTickers?: boolean;
};
export declare class BinanceBase extends BasicClient {
    useAggTrades: boolean;
    l2updateSpeed: string;
    l2snapshotSpeed: string;
    requestSnapshot: boolean;
    candlePeriod: CandlePeriod;
    batchTickers: boolean;
    protected _messageId: number;
    protected _restL2SnapshotPath: string;
    protected _tickersActive: boolean;
    protected _batchSub: CancelableFn;
    protected _batchUnsub: CancelableFn;
    protected _sendMessage: CancelableFn;
    protected _requestLevel2Snapshot: CancelableFn;
    constructor({ name, wssPath, restL2SnapshotPath, watcherMs, useAggTrades, requestSnapshot, socketBatchSize, socketThrottleMs, restThrottleMs, l2updateSpeed, l2snapshotSpeed, batchTickers, }?: BinanceClientOptions);
    protected _onClosing(): void;
    protected _sendSubTicker(remote_id: string): void;
    protected _sendUnsubTicker(remote_id: string): void;
    protected __batchSub(args: any[]): void;
    protected __batchUnsub(args: any): void;
    protected __sendMessage(msg: any): void;
    protected _sendSubTrades(remote_id: string): void;
    protected _sendUnsubTrades(remote_id: string): void;
    protected _sendSubCandles(remote_id: string): void;
    protected _sendUnsubCandles(remote_id: string): void;
    protected _sendSubLevel2Snapshots(remote_id: string): void;
    protected _sendUnsubLevel2Snapshots(remote_id: string): void;
    protected _sendSubLevel2Updates(remote_id: string): void;
    protected _sendUnsubLevel2Updates(remote_id: string): void;
    protected _sendSubLevel3Snapshots(): void;
    protected _sendUnsubLevel3Snapshots(): void;
    protected _sendSubLevel3Updates(): void;
    protected _sendUnsubLevel3Updates(): void;
    protected _onMessage(raw: string): void;
    protected _constructTicker(msg: any, market: Market): Ticker;
    protected _constructAggTrade({ data }: {
        data: any;
    }, market: Market): Trade;
    protected _constructRawTrade({ data }: {
        data: any;
    }, market: Market): Trade;
    /**
   * Kline data looks like:
   { stream: 'btcusdt@kline_1m',
    data:
    { e: 'kline',
      E: 1571068845689,
      s:  'BTCUSDT',
      k:
        { t: 1571068800000,
          T: 1571068859999,
          s: 'BTCUSDT',
          i: '1m',
          f: 189927800,
          L: 189928107,
          o: '8254.05000000',
          c: '8253.61000000',
          h: '8256.58000000',
          l: '8250.93000000',
          v: '19.10571600',
          n: 308,
          x: false,
          q: '157694.32610840',
          V: '8.19456200',
          Q: '67640.56793106',
          B: '0' } } }
   */
    protected _constructCandle({ data }: {
        data: any;
    }): Candle;
    protected _constructLevel2Snapshot(msg: any, market: Market): Level2Snapshot;
    /**
   {
      "e": "depthUpdate", // Event type
      "E": 123456789,     // Event time
      "s": "BNBBTC",      // Symbol
      "U": 157,           // First update ID in event
      "u": 160,           // Final update ID in event
      "b": [              // Bids to be updated
        [
          "0.0024",       // Price level to be updated
          "10"            // Quantity
        ]
      ],
      "a": [              // Asks to be updated
        [
          "0.0026",       // Price level to be updated
          "100"           // Quantity
        ]
      ]
    }
   */
    protected _constructLevel2Update(msg: any, market: any): Level2Update;
    protected __requestLevel2Snapshot(market: any): Promise<void>;
}
export declare function candlePeriod(p: any): "1m" | "3m" | "5m" | "15m" | "30m" | "1h" | "2h" | "4h" | "6h" | "8h" | "12h" | "1d" | "3d" | "1w" | "1M";
