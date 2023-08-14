/**
 * Implements a fast fixed size circular buffer. This buffer has O(1)
 * reads and write. The fixed size is limited to n-1 values in the
 * buffer. The final value is used as a marker to indicate that the
 * buffer is full. This trades a small amount of space for performance
 * by not requiring maintenance of a counter.
 *
 * In benchmarks this performs ~50,000 ops/sec which is twice as fast
 * as the `double-ended-queue` library.
 */
export declare class CircularBuffer<T> {
    readonly size: number;
    buffer: T[];
    writePos: number;
    readPos: number;
    constructor(size: number);
    /**
     * Writes a value into the buffer. Returns `false` if the buffer is
     * full. Otherwise returns `true`.
     *
     * @remarks
     *
     * The `writePos` is incremented prior to writing. This allows the
     * `readPos` to chase the `writePos` and allows us to not require a
     * counter that needs to be maintained.
     */
    write(val: T): boolean;
    /**
     * Reads the next value from the circular buffer. Returns `undefined`
     * when there is no data in the buffer.
     *
     * @remarks
     *
     * The `readPos` will chase the `writePos` and we increment the
     * `readPos` prior to reading in the same way that we increment teh
     * `writePos` prior to writing.
     */
    read(): T;
}
