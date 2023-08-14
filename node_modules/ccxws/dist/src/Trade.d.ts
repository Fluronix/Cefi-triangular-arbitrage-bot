export declare class Trade {
    exchange: string;
    quote: string;
    base: string;
    tradeId: string;
    sequenceId: number;
    unix: number;
    side: string;
    price: string;
    amount: string;
    buyOrderId: string;
    sellOrderId: string;
    constructor(props: Partial<Trade> | any);
    get marketId(): string;
    /**
     * @deprecated use Market object (second argument to each event) to determine exchange and trade pair
     */
    get fullId(): string;
}
