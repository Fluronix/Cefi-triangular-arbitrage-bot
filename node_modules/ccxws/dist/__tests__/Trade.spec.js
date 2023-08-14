"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Trade_1 = require("../src/Trade");
describe("Trade", () => {
    it("marketId should be base + quote", () => {
        const t = new Trade_1.Trade({ base: "BTC", quote: "USD" });
        (0, chai_1.expect)(t.marketId).to.equal("BTC/USD");
    });
    it("fullId should be exchange + base + quote", () => {
        const t = new Trade_1.Trade({ exchange: "GDAX", base: "BTC", quote: "USD" });
        (0, chai_1.expect)(t.fullId).to.equal("GDAX:BTC/USD");
    });
});
//# sourceMappingURL=Trade.spec.js.map