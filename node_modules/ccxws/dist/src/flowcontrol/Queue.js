"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Queue = void 0;
const CircularBuffer_1 = require("./CircularBuffer");
/**
 * Implements a fast FIFO Queue using a circular buffer.
 */
class Queue {
    constructor(bufferSize = 1 << 12) {
        this.bufferSize = bufferSize;
        this.buffer = new CircularBuffer_1.CircularBuffer(bufferSize);
    }
    shift() {
        return this.buffer.read();
    }
    push(val) {
        if (!this.buffer.write(val)) {
            this._resize();
            this.buffer.write(val);
        }
    }
    _resize() {
        // construct a new buffer
        const newBuf = new CircularBuffer_1.CircularBuffer(this.buffer.size * 2);
        // eslint-disable-next-line no-constant-condition
        while (true) {
            const val = this.buffer.read();
            if (val === undefined)
                break;
            newBuf.write(val);
        }
        this.buffer = newBuf;
    }
}
exports.Queue = Queue;
//# sourceMappingURL=Queue.js.map