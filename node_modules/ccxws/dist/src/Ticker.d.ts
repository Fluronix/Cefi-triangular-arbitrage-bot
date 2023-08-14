export declare class Ticker {
    exchange: string;
    base: string;
    quote: string;
    timestamp: number;
    sequenceId: number;
    last: string;
    open: string;
    high: string;
    low: string;
    volume: string;
    quoteVolume: string;
    change: string;
    changePercent: string;
    bid: string;
    bidVolume: string;
    ask: string;
    askVolume: string;
    constructor({ exchange, base, quote, timestamp, sequenceId, last, open, high, low, volume, quoteVolume, change, changePercent, bid, bidVolume, ask, askVolume, }: Partial<Ticker>);
    /**
     * @deprecated use Market object (second argument to each event) to determine exchange and trade pair
     */
    get fullId(): string;
}
