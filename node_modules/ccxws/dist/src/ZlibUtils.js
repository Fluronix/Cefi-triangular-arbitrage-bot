"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inflateRaw = exports.inflate = exports.unzip = void 0;
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
const zlib_1 = __importDefault(require("zlib"));
const Queue_1 = require("./flowcontrol/Queue");
const queue = new Queue_1.Queue();
let current;
/**
 * Serialized unzip using async zlib.unzip method. This function is a helper to
 * address issues with memory fragmentation issues as documented here:
 * https://nodejs.org/api/zlib.html#zlib_threadpool_usage_and_performance_considerations
 */
function unzip(data, cb) {
    queue.push(["unzip", data, cb]);
    serialExecute();
}
exports.unzip = unzip;
/**
 * Serialized inflate using async zlib.inflate method. This function is a helper to
 * address issues with memory fragmentation issues as documented here:
 * https://nodejs.org/api/zlib.html#zlib_threadpool_usage_and_performance_considerations
 */
function inflate(data, cb) {
    queue.push(["inflate", data, cb]);
    serialExecute();
}
exports.inflate = inflate;
/**
 * Serialized inflateRaw using async zlib.inflateRaw method. This function is a helper to
 * address issues with memory fragmentation issues as documented here:
 * https://nodejs.org/api/zlib.html#zlib_threadpool_usage_and_performance_considerations
 *
 */
function inflateRaw(data, cb) {
    queue.push(["inflateRaw", data, cb]);
    serialExecute();
}
exports.inflateRaw = inflateRaw;
function serialExecute() {
    // abort if already executng
    if (current)
        return;
    // remove first item and abort if nothing else to do
    current = queue.shift();
    if (!current)
        return;
    // perform unzip
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    zlib_1.default[current[0]](current[1], (err, res) => {
        // call supplied callback
        current[2](err, res);
        // reset the current status
        current = undefined;
        // immediate try next item
        serialExecute();
    });
}
//# sourceMappingURL=ZlibUtils.js.map