/// <reference types="node" />
import { CancelableFn, Fn } from "./Fn";
export declare class Debounce {
    readonly fn: Fn;
    readonly waitMs: number;
    protected _handle: NodeJS.Timeout;
    protected _last: any;
    constructor(fn: Fn, waitMs?: number);
    add(...args: any[]): void;
    cancel(): void;
    protected _unschedule(): void;
    protected _schedule(): void;
    protected _process(): void;
}
/**
 * Debounce allows repeated calls to a function but will delay execution of the
 * function until a a timeout period expires. Upon expiration, the function is
 * called with the last value that was provided
 *
 * @example
 * const debounceMs = 100;
 * const fn = n => console.log(n, new Date());
 * const debouncedFn = debounce(fn, debounceMs);
 * debouncedFn('h');
 * debouncedFn('he');
 * debouncedFn('hel');
 * debouncedFn('hell');
 * debouncedFn('hello');
 */
export declare function debounce(fn: Fn, debounceMs?: number): CancelableFn;
