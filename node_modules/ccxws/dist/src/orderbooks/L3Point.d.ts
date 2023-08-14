/**
 * Level 3 order book point
 */
export declare class L3Point {
    orderId: string;
    price: number;
    size: number;
    timestamp: number;
    constructor(orderId: string, price: number, size: number, timestamp?: number);
}
