"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trade = void 0;
class Trade {
    constructor(props) {
        this.exchange = props.exchange;
        this.quote = props.quote;
        this.base = props.base;
        this.tradeId = props.tradeId;
        this.sequenceId = props.sequenceId;
        this.unix = props.unix;
        this.side = props.side;
        this.price = props.price;
        this.amount = props.amount;
        this.buyOrderId = props.buyOrderId;
        this.sellOrderId = props.sellOrderId;
        // attach any extra props
        for (const key in props) {
            if (!this[key])
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
exports.Trade = Trade;
//# sourceMappingURL=Trade.js.map