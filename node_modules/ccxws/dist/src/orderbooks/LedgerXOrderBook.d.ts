import { Level3Snapshot } from "../Level3Snapshot";
import { Level3Update } from "../Level3Update";
import { L3PointStore } from "./L3PointStore";
/**
 * Maintains a Level 3 order book for LedgerX
 */
export declare class LedgerXOrderBook {
    asks: L3PointStore;
    bids: L3PointStore;
    sequenceId: number;
    runId: number;
    constructor(snap: Level3Snapshot);
    reset(): void;
    update(update: Level3Update & {
        runId: number;
        timestamp: number;
    }): void;
    /**
     * Captures a price aggregated snapshot
     * @param {number} depth
     */
    snapshot(depth?: number): {
        sequenceId: number;
        runId: number;
        asks: import("./L2Point").L2Point[];
        bids: import("./L2Point").L2Point[];
    };
}
