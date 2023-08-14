import { BinanceBase, BinanceClientOptions } from "./BinanceBase";
export declare class BinanceJeClient extends BinanceBase {
    constructor({ useAggTrades, requestSnapshot, socketBatchSize, socketThrottleMs, restThrottleMs, watcherMs, l2updateSpeed, l2snapshotSpeed, }?: BinanceClientOptions);
}
