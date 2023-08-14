"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Level2Snapshot = void 0;
class Level2Snapshot {
    constructor(props) {
        for (const key in props) {
            this[key] = props[key];
        }
    }
    get marketId() {
        return `${this.base}/${this.quote}`;
    }
    /**
     * @deprecated use Market object (second argument to each event) to determine exchange and trade pair
     */
    get fullId() {
        return `${this.exchange}:${this.base}/${this.quote}`;
    }
}
exports.Level2Snapshot = Level2Snapshot;
//# sourceMappingURL=Level2Snapshots.js.map