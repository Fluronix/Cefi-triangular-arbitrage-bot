export declare class BlockTrade {
    exchange: string;
    quote: string;
    base: string;
    tradeId: string;
    unix: string;
    price: string;
    amount: string;
    constructor({ exchange, base, quote, tradeId, unix, price, amount }: Partial<BlockTrade>);
    get marketId(): string;
    /**
     * @deprecated use Market object (second argument to each event) to determine exchange and trade pair
     */
    get fullId(): string;
}
