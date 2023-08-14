import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { Level2Snapshot } from "../Level2Snapshots";
import { Level2Update } from "../Level2Update";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
/**
 * Implements the exchange according to API specifications:
 * https://github.com/DigiFinex/api/blob/master/Websocket_API_en.md
 */
export declare class DigifinexClient extends BasicClient {
    id: number;
    constructor({ wssPath, watcherMs }?: ClientOptions);
    protected _sendSubTicker(remote_id: any): void;
    protected _sendUnsubTicker(remote_id: any): void;
    protected _sendSubTrades(remote_id: any): void;
    protected _sendUnsubTrades(remote_id: any): void;
    protected _sendSubLevel2Updates(remote_id: any): void;
    protected _sendUnsubLevel2Updates(remote_id: any): void;
    protected _sendSubCandles: (...args: any[]) => any;
    protected _sendUnsubCandles: (...args: any[]) => any;
    protected _sendSubLevel2Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel2Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    protected _onMessage(raw: any): void;
    protected _onMessageInf(err: any, raw: any): void;
    /**
   {
    "method": "ticker.update",
    "params": [{
      "symbol": "BTC_USDT",
      "open_24h": "1760",
      "low_24h": "1.00",
      "base_volume_24h": "11.40088557",
      "quote_volume_24h": "29786.30588557",
      "last": "4000",
      "last_qty": "1",
      "best_bid": "3375",
      "best_bid_size": "0.003",
      "best_ask": "4000",
      "best_ask_size": "108.2542",
      "timestamp": 1586762545336
    }],
    "id": null
  }
  */
    protected _constructTicker(data: any, market: any): Ticker;
    /**
    {
      "method": "trades.update",
      "params":
      [
        true,
        [
          {
            id: 3282939928,
            time: 1597419159,
            amount: '0.1',
            price: '11687.04',
            type: 'sell'
          }
        ],
        "ETH_USDT"
      ],
      "id": null
    }
   */
    protected _constructTrade(datum: any, market: any): Trade;
    /**
   {
      "method": "depth.update",
      "params": [
        true,
        {
          "asks": [
            ["11702.01", "0.001"],
            ["11700.24", "0.8716"],
            ["11699.57", "0.1029"]
          ],
          "bids": [
            ["11697.89", "0.2184"],
            ["11697.13", "7.0356"],
            ["11696.79", "0.2149"]
          ]
        },
        "BTC_USDT"
      ],
      "id": null
    }
   */
    protected _constructL2Snapshot(datum: any, market: any): Level2Snapshot;
    /**
   {
      "method": "depth.update",
      "params": [
        false,
        {
          "asks": [
            ["11702.81", "0.001"],
            ["11699.92", "0.008"],
            ["11788.73", "0"],
            ["11787.24", "0"]
          ],
          "bids": [
            ["11642.72", "13.1172"],
            ["11627.05", "2.1258"],
            ["11621.42", "0"],
            ["11620.87", "0"]
          ]
        },
        "BTC_USDT"
      ],
      "id": null
    }
   */
    protected _constructL2Update(datum: any, market: any): Level2Update;
}
