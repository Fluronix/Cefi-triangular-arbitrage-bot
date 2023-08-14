"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Level2Update = void 0;
class Level2Update {
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
exports.Level2Update = Level2Update;
//# sourceMappingURL=Level2Update.js.map