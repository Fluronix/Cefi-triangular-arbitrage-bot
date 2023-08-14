export declare class Auction {
    exchange: string;
    quote: string;
    base: string;
    tradeId: string;
    unix: number;
    price: string;
    high: string;
    low: string;
    amount: string;
    constructor({ exchange, base, quote, tradeId, unix, price, amount, high, low, }: Partial<Auction>);
    get marketId(): string;
    /**
     * @deprecated use Market object (second argument to each event) to determine exchange and trade pair
     */
    get fullId(): string;
}
