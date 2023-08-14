import { Level2Snapshot } from "../Level2Snapshots";
import { Level2Update } from "../Level2Update";
import { L2Point } from "./L2Point";
export declare class DeribitOrderBook {
    sequenceId: number;
    asks: L2Point[];
    bids: L2Point[];
    constructor(snapshot: Level2Snapshot);
    update(update: Level2Update): void;
    protected _updatePoint(bid: boolean, price: number, size: number, timestamp: number): void;
    /**
     * Captures a simple snapshot of best asks and bids up to the
     * requested depth.
     */
    snapshot(depth: number): {
        sequenceId: number;
        asks: L2Point[];
        bids: L2Point[];
    };
}
