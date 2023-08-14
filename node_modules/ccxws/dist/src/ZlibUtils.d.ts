/// <reference types="node" />
export declare type ZlibCallback = (err: Error, result: Buffer) => void;
/**
 * Serialized unzip using async zlib.unzip method. This function is a helper to
 * address issues with memory fragmentation issues as documented here:
 * https://nodejs.org/api/zlib.html#zlib_threadpool_usage_and_performance_considerations
 */
export declare function unzip(data: Buffer, cb: ZlibCallback): void;
/**
 * Serialized inflate using async zlib.inflate method. This function is a helper to
 * address issues with memory fragmentation issues as documented here:
 * https://nodejs.org/api/zlib.html#zlib_threadpool_usage_and_performance_considerations
 */
export declare function inflate(data: Buffer, cb: ZlibCallback): void;
/**
 * Serialized inflateRaw using async zlib.inflateRaw method. This function is a helper to
 * address issues with memory fragmentation issues as documented here:
 * https://nodejs.org/api/zlib.html#zlib_threadpool_usage_and_performance_considerations
 *
 */
export declare function inflateRaw(data: Buffer, cb: ZlibCallback): void;
