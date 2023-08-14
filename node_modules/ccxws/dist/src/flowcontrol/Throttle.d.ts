import { CancelableFn, Fn } from "./Fn";
export declare class Throttle {
    readonly fn: Fn;
    readonly delayMs: number;
    private _calls;
    private _handle;
    constructor(fn: Fn, delayMs: number);
    add(...args: any[]): void;
    cancel(): void;
    private _unschedule;
    private _schedule;
    private _process;
}
/**
 * Throttles the function execution to the rate limit specified. This can be
 * used "enqueue" a bunch of function executes and limit the rate at which they
 * will be called.
 *
 * @example
 * ```javascript
 * const fn = n => console.log(n, new Date());
 * const delayMs = 1000;
 * const throttledFn = throttle(fn, delayMs);
 * throttledFn(1);
 * throttledFn(2);
 * throttledFn(3);
 * ```
 */
export declare function throttle(fn: Fn, delayMs: number): CancelableFn;
