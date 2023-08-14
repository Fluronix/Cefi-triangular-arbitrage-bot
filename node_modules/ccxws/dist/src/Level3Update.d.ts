import { Level3Point } from "./Level3Point";
export declare class Level3Update {
    exchange: string;
    base: string;
    quote: string;
    sequenceId: number;
    timestampMs: number;
    asks: Level3Point[];
    bids: Level3Point[];
    constructor(props: any);
    /**
     * @deprecated use Market object (second argument to each event) to determine exchange and trade pair
     */
    get fullId(): string;
}
