import { CircularBuffer } from "./CircularBuffer";
/**
 * Implements a fast FIFO Queue using a circular buffer.
 */
export declare class Queue<T> {
    readonly bufferSize: number;
    buffer: CircularBuffer<T>;
    constructor(bufferSize?: number);
    shift(): T;
    push(val: T): void;
    protected _resize(): void;
}
