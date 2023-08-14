import { L2Point } from "./L2Point";
import { Level2Snapshot } from "../Level2Snapshots";
import { Level2Update } from "../Level2Update";
/**
 * Prototype implementation of an order book for Kraken. This should be
 * used with a feed that originiates with data provided by Kraken
 * spec: https://docs.kraken.com/websockets/#message-book.
 *
 * ```javascript
 * const client = new KrakenClient();
 * const market = { id: "XXBTZUSD", base: "BTC", quote: "USD" };
 * client.subscribeLevel2Updates(market);
 *
 * let ob;
 * client.on("l2snapshot", snap => {
 *   const asks = snap.asks.map(p => new KrakenOrderBookPoint(p.price, p.size, p.timestamp));
 *   const bids = snap.bids.map(p => new KrakenOrderBookPoint(p.price, p.size, p.timestamp));
 *   ob = new KrakenOrderBook(asks, bids);
 * });
 *
 * client.on("l2update", update => {
 *   for (let a of update.asks) {
 *     ob.update(false, a.price, a.size, a.timestamp);
 *   }
 *   for (let b of update.bids) {
 *     ob.update(true, b.price, b.size, b.timestamp);
 *   }
 * });
 * ```
 *
 * @remarks
 *
 * This implementation uses sorted arrays to store ask and bid values.
 * The rationale is that after each batch of updates a snapshot operation
 * must be performed which will require ordering the values the book.
 *
 * This uses binary search to find the mutation index for the array.
 * This means we have worst case time complexity of:
 *
 * updates: O(log n)
 * insert: O(n)
 * delete: O(n)
 * snapshots: O(1)
 *
 * Because most order books operate towards the tip of the book,
 * highest bid and lowest ask, we can get average time complexity
 * improvements by using sorted arrays such that the bulk of the
 * operations occur towards the end of the array. This reduces the
 * number of operations required in shift operation.
 *
 * We will perform further research to determine the optimal data
 * structure before releasing a non-prototype version for other
 * exchanges.
 */
export declare class KrakenOrderBook {
    /**
     * Best ask value is the lowest price. This means that most activity
     * will happen towards the lowest price and we need to sort desc.
     */
    asks: L2Point[];
    /**
     * Best bid value is the highest price. this means that most
     * activity will happen towards the highest price and we need to
     * sort asc.
     */
    bids: L2Point[];
    /**
     * Creates an order book from the points provided. Can be used with a
     * snapshot to immeidately construct an orderbook. All input values
     * are expected to be KrakenOrderBookPoint instances.
     *
     * ```javascript
     * ob = new KrakenOrderBook(snapshot);
     * ```
     */
    constructor(snapshot: Level2Snapshot);
    /**
     * Updates the orderbook with a new price level entry. This value will
     * either be and insertion, update, or deletion. The bid parameter
     * determines which side of the book the update falls on.
     *
     * ```javascript
     * client.on("l2update", update => ob.update(update));
     * ```
     */
    update(update: Level2Update): void;
    protected _update(bid: boolean, price: string, size: string, timestamp: number): void;
    /**
     * Captures a simple snapshot of best asks and bids up to the
     * requested depth.
     */
    snapshot(depth: number): {
        asks: any[];
        bids: any[];
    };
    /**
     * Returns the checksum of the order book based on the algorithm
     * specified in https://docs.kraken.com/websockets/#book-checksum
     */
    checksum(): string;
}
