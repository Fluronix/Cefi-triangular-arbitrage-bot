/// <reference types="node" />
import { CancelableFn, Fn } from "./Fn";
export declare class Batch {
    readonly fn: Fn;
    readonly batchSize: number;
    readonly collectMs: number;
    protected _handle: NodeJS.Timeout;
    protected _args: any[];
    constructor(fn: Fn, batchSize: number, collectMs?: number);
    add(...args: any[]): void;
    cancel(): void;
    protected _unschedule(): void;
    protected _schedule(): void;
    protected _process(): void;
}
/**
 * Batcher allows repeated calls to a function but will delay execution of the
 * until the next tick or a timeout expires. Upon expiration, the function is
 * called with the arguments of the calls batched by the batch size
 *
 * @example
 * const fn = n => console.log(n);
 * const batchFn = batch(fn, debounceMs);
 * batchFn(1);
 * batchFn(2);
 * batchFn(3);
 * // [[1],[2],[3]]
 */
export declare function batch(fn: Fn, batchSize?: number, collectMs?: number): CancelableFn;
