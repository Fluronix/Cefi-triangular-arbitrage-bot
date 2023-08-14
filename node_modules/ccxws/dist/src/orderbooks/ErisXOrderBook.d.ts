import { Level3Point } from "../Level3Point";
import { Level3Snapshot } from "../Level3Snapshot";
import { Level3Update } from "../Level3Update";
import { L3PointStore } from "./L3PointStore";
/**
 * Maintains a Level 3 order book for ErisX
 */
export declare class ErisXOrderBook {
    asks: L3PointStore;
    bids: L3PointStore;
    timestampMs: number;
    runId: number;
    sequenceId: number;
    constructor(snap: Level3Snapshot);
    update(update: Level3Update): void;
    updatePoint(point: Level3Point, isAsk: boolean): void;
    snapshot(depth?: number): {
        sequenceId: number;
        runId: number;
        asks: import("./L2Point").L2Point[];
        bids: import("./L2Point").L2Point[];
    };
}
