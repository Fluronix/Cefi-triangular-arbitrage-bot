import { Level2Point } from "./Level2Point";
export declare class Level2Snapshot {
    base: string;
    quote: string;
    exchange: string;
    sequenceId: number;
    timestampMs: number;
    asks: Level2Point[];
    bids: Level2Point[];
    constructor(props: any);
    get marketId(): string;
    /**
     * @deprecated use Market object (second argument to each event) to determine exchange and trade pair
     */
    get fullId(): string;
}
