"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KrakenOrderBook = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
const L2Point_1 = require("./L2Point");
const crc_1 = __importDefault(require("crc"));
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
class KrakenOrderBook {
    /**
     * Creates an order book from the points provided. Can be used with a
     * snapshot to immeidately construct an orderbook. All input values
     * are expected to be KrakenOrderBookPoint instances.
     *
     * ```javascript
     * ob = new KrakenOrderBook(snapshot);
     * ```
     */
    constructor(snapshot) {
        this.asks = snapshot.asks
            .map(p => new L2Point_1.L2Point(Number(p.price), Number(p.size), p.timestamp, {
            rawPrice: p.price,
            rawSize: p.size,
        }))
            .sort(sortDesc);
        this.bids = snapshot.bids
            .map(p => new L2Point_1.L2Point(Number(p.price), Number(p.size), p.timestamp, {
            rawPrice: p.price,
            rawSize: p.size,
        }))
            .sort(sortAsc);
    }
    /**
     * Updates the orderbook with a new price level entry. This value will
     * either be and insertion, update, or deletion. The bid parameter
     * determines which side of the book the update falls on.
     *
     * ```javascript
     * client.on("l2update", update => ob.update(update));
     * ```
     */
    update(update) {
        for (const { price, size, timestamp } of update.asks) {
            this._update(false, price, size, timestamp);
        }
        for (const { price, size, timestamp } of update.bids) {
            this._update(true, price, size, timestamp);
        }
    }
    _update(bid, price, size, timestamp) {
        const priceNum = Number(price);
        const sizeNum = Number(size);
        let arr;
        let index;
        // The best bids are the highest priced, meaning the tail of array
        // using the best bids would be sorted ascending
        if (bid) {
            arr = this.bids;
            index = findIndexAsc(arr, priceNum);
        }
        // The best asks are the lowest priced, meaning the tail of array
        // with the best asks would be sorted descending
        else {
            arr = this.asks;
            index = findIndexDesc(arr, priceNum);
        }
        // We perform an update when the index of hte current value has
        // the same price as the update we are now processing.
        if (arr[index] && arr[index].meta.rawPrice === price) {
            // Only perform an update if the new value has a newer timestamp
            // than the existing value
            if (timestamp <= arr[index].timestamp) {
                return;
            }
            // Remove the value when the size is 0
            if (sizeNum === 0) {
                arr.splice(index, 1);
                return;
            }
            // Otherwise we perform an update by changing the size and timestamp
            arr[index].size = sizeNum;
            arr[index].meta.rawSize = size;
            arr[index].timestamp = timestamp;
        }
        // Otherwise we are performing an insert, which we will construct
        // a new point. Because we are using splice, which should have a
        // worst case runtime of O(N), we
        // O()
        else if (sizeNum > 0) {
            const point = new L2Point_1.L2Point(Number(price), Number(size), Number(timestamp), {
                rawPrice: price,
                rawSize: size,
            });
            arr.splice(index, 0, point);
        }
    }
    /**
     * Captures a simple snapshot of best asks and bids up to the
     * requested depth.
     */
    snapshot(depth) {
        const asks = [];
        for (let i = this.asks.length - 1; i >= this.asks.length - depth; i--) {
            const val = this.asks[i];
            if (val)
                asks.push(val);
        }
        const bids = [];
        for (let i = this.bids.length - 1; i >= this.bids.length - depth; i--) {
            const val = this.bids[i];
            if (val)
                bids.push(val);
        }
        return {
            asks,
            bids,
        };
    }
    /**
     * Returns the checksum of the order book based on the algorithm
     * specified in https://docs.kraken.com/websockets/#book-checksum
     */
    checksum() {
        const snap = this.snapshot(10);
        const data = checksumString(snap.asks, snap.bids);
        return crc_1.default.crc32(data).toString(10);
    }
}
exports.KrakenOrderBook = KrakenOrderBook;
/**
 * Performs a binary search of a sorted array for the insert or update
 * position of the value and operates on a KrakenOrderBookPoint value
 */
function findIndexAsc(arr, key, l = 0, r = arr.length) {
    const mid = Math.floor((l + r) / 2);
    if (l === r)
        return mid;
    if (arr[mid] && arr[mid].price === key)
        return mid;
    if (arr[mid] && arr[mid].price > key)
        return findIndexAsc(arr, key, l, mid);
    if (arr[mid] && arr[mid].price < key)
        return findIndexAsc(arr, key, mid + 1, r);
}
/**
 * Performs a binary search of a sorted array for the insert or update
 * position of the value and operates on a KrakenOrderBookPoint value
 */
function findIndexDesc(arr, key, l = 0, r = arr.length) {
    const mid = Math.floor((l + r) / 2);
    if (l === r)
        return mid;
    if (arr[mid] && arr[mid].price === key)
        return mid;
    if (arr[mid] && arr[mid].price < key)
        return findIndexDesc(arr, key, l, mid);
    if (arr[mid] && arr[mid].price > key)
        return findIndexDesc(arr, key, mid + 1, r);
}
/**
 * Converts a raw number value into the format for crc checksum. This
 * format removes the . from the number, and strips all prefixed 0's
 * before the first real digit. For examples '0.00050000' => '50000'
 */
function crcNum(val) {
    let result = "";
    const chars = val.split("");
    let start = true;
    for (const char of chars) {
        if (start && char === "0")
            continue;
        if (char === ".")
            continue;
        start = false;
        result += char;
    }
    return result;
}
/**
 * Creates the checksum string from the bid and ask values based on the
 * algorithm. This converts string values into the stripped number
 * format in `crcNum` and concatenates the price and size for asks then
 * bids.
 * @param {L2Point[]} asks
 * @param {L2Point[]} bids
 */
function checksumString(asks, bids) {
    let data = "";
    for (const ask of asks) {
        data += crcNum(ask.meta.rawPrice);
        data += crcNum(ask.meta.rawSize);
    }
    for (const bid of bids) {
        data += crcNum(bid.meta.rawPrice);
        data += crcNum(bid.meta.rawSize);
    }
    return data;
}
/**
 * Sorts points from high to low
 */
function sortDesc(a, b) {
    if (a.price > b.price)
        return -1;
    if (a.price < b.price)
        return 1;
    return 0;
}
/**
 * Sorts points from low to high
 */
function sortAsc(a, b) {
    if (a.price < b.price)
        return -1;
    if (a.price > b.price)
        return 1;
    return 0;
}
//# sourceMappingURL=KrakenOrderBook.js.map