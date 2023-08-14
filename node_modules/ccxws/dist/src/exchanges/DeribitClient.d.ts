import { BasicClient } from "../BasicClient";
import { Candle } from "../Candle";
import { CandlePeriod } from "../CandlePeriod";
import { ClientOptions } from "../ClientOptions";
import { CancelableFn } from "../flowcontrol/Fn";
import { Level2Snapshot } from "../Level2Snapshots";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
export declare class DeribitClient extends BasicClient {
    id: number;
    candlePeriod: CandlePeriod;
    protected _send: CancelableFn;
    constructor({ wssPath, watcherMs }?: ClientOptions);
    protected _beforeClose(): void;
    protected __send(message: any): void;
    protected _sendSubTicker(remote_id: any): void;
    protected _sendUnsubTicker(remote_id: any): void;
    protected _sendSubTrades(remote_id: any): void;
    protected _sendUnsubTrades(remote_id: any): void;
    protected _sendSubCandles(remote_id: any): void;
    protected _sendUnsubCandles(remote_id: any): void;
    protected _sendSubLevel2Updates(remote_id: any): void;
    protected _sendUnsubLevel2Updates(remote_id: any): void;
    protected _sendSubLevel2Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel2Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    protected _onMessage(raw: any): void;
    /**
    {
      "jsonrpc": "2.0",
      "method": "subscription",
      "params": {
        "channel": "ticker.BTC-PERPETUAL.raw",
        "data": {
          "timestamp": 1597244851057,
          "stats": {
            "volume_usd": 404775400.0,
            "volume": 35574.05167122,
            "price_change": 0.493,
            "low": 11131.5,
            "high": 11632.5
          },
          "state": "open",
          "settlement_price": 11452.62,
          "open_interest": 117979530,
          "min_price": 11443.06,
          "max_price": 11791.58,
          "mark_price": 11617.8,
          "last_price": 11618.0,
          "instrument_name": "BTC-PERPETUAL",
          "index_price": 11609.61,
          "funding_8h": 0.00001212,
          "estimated_delivery_price": 11609.61,
          "current_funding": 0.00020545,
          "best_bid_price": 11618.0,
          "best_bid_amount": 7460.0,
          "best_ask_price": 11618.5,
          "best_ask_amount": 497870.0
        }
      }
    }
   */
    protected _constructTicker(msg: any, market: any): Ticker;
    /**
   * PERPETUAL
    {
      "trade_seq": 56761222,
      "trade_id": "88095252",
      "timestamp": 1597246721811,
      "tick_direction": 3,
      "price": 11576.0,
      "mark_price": 11574.5,
      "instrument_name": "BTC-PERPETUAL",
      "index_price": 11567.32,
      "direction": "buy",
      "amount": 4310.0
    }
   */
    protected _constructTrade(datum: any, market: any): Trade;
    /**
    {
      "volume" : 0.05219351,
      "tick" : 1573645080000,
      "open" : 8869.79,
      "low" : 8788.25,
      "high" : 8870.31,
      "cost" : 460,
      "close" : 8791.25
    },
   */
    protected _constructCandle(data: any): Candle;
    /**
    {
      "type" : "snapshot",
      "timestamp" : 1554373962454,
      "instrument_name" : "BTC-PERPETUAL",
      "change_id" : 297217,
      "bids" : [
        [
          "new",
          5042.34,
          30
        ],
        [
          "new",
          5041.94,
          20
        ]
      ],
      "asks" : [
        [
          "new",
          5042.64,
          40
        ],
        [
          "new",
          5043.3,
          40
        ]
      ]
    }
   */
    protected _constructLevel2Snapshot(data: any, market: any): Level2Snapshot;
    /**
   {
      "type" : "change",
      "timestamp" : 1554373911330,
      "prev_change_id" : 297217,
      "instrument_name" : "BTC-PERPETUAL",
      "change_id" : 297218,
      "bids" : [
        [
          "delete",
          5041.94,
          0
        ],
        [
          "delete",
          5042.34,
          0
        ]
      ],
      "asks" : [

      ]
    }
   */
    protected _constructLevel2Update(data: any, market: any): Level2Snapshot;
}
