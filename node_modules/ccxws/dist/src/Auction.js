"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auction = void 0;
class Auction {
    constructor({ exchange, base, quote, tradeId, unix, price, amount, high, low, }) {
        this.exchange = exchange;
        this.quote = quote;
        this.base = base;
        this.tradeId = tradeId;
        this.unix = unix;
        this.price = price;
        this.high = high;
        this.low = low;
        this.amount = amount;
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
exports.Auction = Auction;
//# sourceMappingURL=Auction.js.map