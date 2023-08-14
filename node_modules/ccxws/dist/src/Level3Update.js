"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Level3Update = void 0;
class Level3Update {
    constructor(props) {
        for (const key in props) {
            this[key] = props[key];
        }
    }
    /**
     * @deprecated use Market object (second argument to each event) to determine exchange and trade pair
     */
    get fullId() {
        return `${this.exchange}:${this.base}/${this.quote}`;
    }
}
exports.Level3Update = Level3Update;
//# sourceMappingURL=Level3Update.js.map