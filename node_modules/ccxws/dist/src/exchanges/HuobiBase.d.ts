/// <reference types="node" />
import { BasicClient } from "../BasicClient";
import { Candle } from "../Candle";
import { CandlePeriod } from "../CandlePeriod";
import { Level2Snapshot } from "../Level2Snapshots";
import { Level2Update } from "../Level2Update";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
export declare class HuobiBase extends BasicClient {
    candlePeriod: CandlePeriod;
    constructor({ name, wssPath, watcherMs }: {
        name: any;
        wssPath: any;
        watcherMs: any;
    });
    protected _sendPong(ts: number): void;
    protected _sendSubTicker(remote_id: string): void;
    protected _sendUnsubTicker(remote_id: string): void;
    protected _sendSubTrades(remote_id: string): void;
    protected _sendUnsubTrades(remote_id: string): void;
    protected _sendSubCandles(remote_id: string): void;
    protected _sendUnsubCandles(remote_id: string): void;
    protected _sendSubLevel2Updates(remote_id: string): void;
    protected _sendUnsubLevel2Updates(remote_id: string): void;
    protected _sendSubLevel2Snapshots(remote_id: string): void;
    protected _sendUnsubLevel2Snapshots(remote_id: string): void;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    protected _onMessage(raw: Buffer): void;
    protected _constructTicker(data: any, market: any): Ticker;
    protected _constructTradesFromMessage(datum: any, market: any): Trade;
    protected _constructCandle(msg: any): Candle;
    /**
   {
      "ch": "market.BTC_CQ.depth.size_150.high_freq",
      "tick": {
        "asks": [
          [11756.82, 1966],
          [11756.91, 3],
          [11756.93, 936]
        ],
        "bids": [
          [11756.81, 2639],
          [11755.13, 73],
          [11754.93, 1]
        ],
        "ch": "market.BTC_CQ.depth.size_150.high_freq",
        "event": "snapshot",
        "id": 91435179848,
        "mrid": 91435179848,
        "ts": 1597347675927,
        "version": 279029079
      },
      "ts": 1597347675927
    }
   */
    protected _constructL2UpdateSnapshot(msg: any, market: any): Level2Snapshot;
    /**
   {
      "ch": "market.BTC_CQ.depth.size_150.high_freq",
      "tick": {
        "asks": [],
        "bids": [
          [11750.4, 0],
          [11742.49, 44]
        ],
        "ch": "market.BTC_CQ.depth.size_150.high_freq",
        "event": "update",
        "id": 91435179926,
        "mrid": 91435179926,
        "ts": 1597347675971,
        "version": 279029080
      },
      "ts": 1597347675971
    }
   */
    protected _constructL2Update(msg: any, market: any): Level2Update;
    protected _constructLevel2Snapshot(msg: any, market: any): Level2Snapshot;
}
