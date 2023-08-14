import { Level2Snapshot } from "../Level2Snapshots";
import { Level2Update } from "../Level2Update";
import { Market } from "../Market";
import { BinanceBase } from "./BinanceBase";
import { BinanceClientOptions } from "./BinanceBase";
export declare class BinanceFuturesCoinmClient extends BinanceBase {
    constructor({ useAggTrades, requestSnapshot, socketBatchSize, socketThrottleMs, restThrottleMs, l2snapshotSpeed, l2updateSpeed, watcherMs, }?: BinanceClientOptions);
    /**
   * Custom construction for a partial depth update. This deviates from
   * the spot market by including the `pu` property where updates may
   * not be sequential. The update message looks like:
    {
      "e": "depthUpdate",           // Event type
      "E": 1591270260907,           // Event time
      "T": 1591270260891,           // Transction time
      "s": "BTCUSD_200626",         // Symbol
      "ps": "BTCUSD",               // Pair
      "U": 17285681,                // First update ID in event
      "u": 17285702,                // Final update ID in event
      "pu": 17285675,               // Final update Id in last stream(ie `u` in last stream)
      "b": [                        // Bids to be updated
        [
          "9517.6",                 // Price level to be updated
          "10"                      // Quantity
        ]
      ],
      "a": [                        // Asks to be updated
        [
          "9518.5",                 // Price level to be updated
          "45"                      // Quantity
        ]
      ]
    }
   */
    protected _constructLevel2Update(msg: any, market: Market): Level2Update;
    /**
   * Partial book snapshot that. This deviates from the spot market by
   * including a previous last update id, `pu`.
      {
        "e":"depthUpdate",        // Event type
        "E":1591269996801,        // Event time
        "T":1591269996646,        // Transaction time
        "s":"BTCUSD_200626",      // Symbol
        "ps":"BTCUSD",            // Pair
        "U":17276694,
        "u":17276701,
        "pu":17276678,
        "b":[                     // Bids to be updated
          [
            "9523.0",             // Price Level
            "5"                   // Quantity
          ],
          [
            "9522.8",
            "8"
          ]
        ],
        "a":[                     // Asks to be updated
          [
            "9524.6",             // Price level to be
            "2"                   // Quantity
          ],
          [
            "9524.7",
            "3"
          ]
        ]
      }
   */
    protected _constructLevel2Snapshot(msg: any, market: Market): Level2Snapshot;
}
