import { BinanceBase, BinanceClientOptions } from "./BinanceBase";
export declare class BinanceClient extends BinanceBase {
    constructor({ useAggTrades, requestSnapshot, socketBatchSize, socketThrottleMs, restThrottleMs, testNet, wssPath, restL2SnapshotPath, watcherMs, l2updateSpeed, l2snapshotSpeed, batchTickers, }?: BinanceClientOptions);
}
