import { Level3Snapshot } from "../Level3Snapshot";
import { Level3Update } from "../Level3Update";
import { L2Point } from "./L2Point";
import { L3Point } from "./L3Point";
/**
 * Prototype for maintaining a Level 3 order book for Kucoin according
 * to the instructions defined here:
 * https://docs.kucoin.com/#full-matchengine-data-level-3
 *
 * This technique uses a Map to store orders. It has efficient updates
 * but will be slow for performing tip of book or snapshot operations.
 *
 * # Example
 * ```javascript
 * const ccxws = require("ccxws");
 * const KucoinOrderBook = require("ccxws/src/orderbooks/KucoinOrderBook");
 *
 * let market = { id: "BTC-USDT", base: "BTC", quote: "USDT" };
 * let updates = [];
 * let ob;
 *
 * const client = new ccxws.Kucoin();
 * client.subscribeLevel3Updates(market);
 * client.on("l3snapshot", snapshot => {
 *   ob = new KucoinOrderBook(snapshot, updates);
 * });
 *
 * client.on("l3update", update => {
 *   // enqueue updates until snapshot arrives
 *   if (!ob) {
 *     updates.push(update);
 *     return;
 *   }
 *
 *   // validate the sequence and exit if we are out of sync
 *   if (ob.sequenceId + 1 !== update.sequenceId) {
 *     console.log(`out of sync, expected ${ob.sequenceId + 1}, got ${update.sequenceId}`);
 *     process.exit(1);
 *   }
 *
 *   // apply update
 *   ob.update(update);
 * });
 * ```
 */
export declare class KucoinOrderBook {
    asks: Map<string, L3Point>;
    bids: Map<string, L3Point>;
    sequenceId: number;
    /**
     * Constructs a new order book by starting with a snapshop and replaying
     * any updates that have been queued.
     */
    constructor(snap: Level3Snapshot, updates: Level3Update[]);
    update(update: Level3Update): void;
    /**
     * Captures a price aggregated snapshot
     * @param {number} depth
     */
    snapshot(depth?: number): {
        sequenceId: number;
        asks: L2Point[];
        bids: L2Point[];
    };
}
