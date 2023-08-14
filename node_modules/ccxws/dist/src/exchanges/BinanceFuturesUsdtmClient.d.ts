import { Level2Snapshot } from "../Level2Snapshots";
import { Level2Update } from "../Level2Update";
import { Market } from "../Market";
import { BinanceBase, BinanceClientOptions } from "./BinanceBase";
export declare class BinanceFuturesUsdtmClient extends BinanceBase {
    constructor({ useAggTrades, requestSnapshot, socketBatchSize, socketThrottleMs, restThrottleMs, l2snapshotSpeed, l2updateSpeed, watcherMs, }?: BinanceClientOptions);
    /**
   * Custom construction for a partial depth update. This deviates from
   * the spot market by including the `pu` property where updates may
   * not be sequential. The update message looks like:
   * {
      "e": "depthUpdate", // Event type
      "E": 123456789,     // Event time
      "T": 123456788,     // transaction time
      "s": "BTCUSDT",      // Symbol
      "U": 157,           // First update ID in event
      "u": 160,           // Final update ID in event
      "pu": 149,          // Final update Id in last stream(ie `u` in last stream)
      "b": [              // Bids to be updated
        [
          "0.0024",       // Price level to be updated
          "10"            // Quantity
        ]
      ],
      "a": [              // Asks to be updated
        [
          "0.0026",       // Price level to be updated
          "100"          // Quantity
        ]
      ]
    }
   */
    protected _constructLevel2Update(msg: any, market: any): Level2Update;
    /**
   * Partial book snapshot that. This deviates from the spot market by
   * including a previous last update id, `pu`.
      {
        "e": "depthUpdate", // Event type
        "E": 1571889248277, // Event time
        "T": 1571889248276, // transaction time
        "s": "BTCUSDT",
        "U": 390497796,
        "u": 390497878,
        "pu": 390497794,
        "b": [          // Bids to be updated
          [
            "7403.89",  // Price Level to be
            "0.002"     // Quantity
          ],
          [
            "7403.90",
            "3.906"
          ]
        ],
        "a": [          // Asks to be updated
          [
            "7405.96",  // Price level to be
            "3.340"     // Quantity
          ],
          [
            "7406.63",
            "4.525"
          ]
        ]
      }
   */
    protected _constructLevel2Snapshot(msg: any, market: Market): Level2Snapshot;
}
