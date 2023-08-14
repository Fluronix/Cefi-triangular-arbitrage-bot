"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = __importDefault(require("sinon"));
const Throttle_1 = require("../../src/flowcontrol/Throttle");
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
describe("throttle", () => {
    it("all at once", async () => {
        const fn = sinon_1.default.stub();
        const sut = (0, Throttle_1.throttle)(fn, 10);
        sut(1);
        sut(2);
        sut(3);
        (0, chai_1.expect)(fn.callCount).to.equal(1);
        await wait(200);
        (0, chai_1.expect)(fn.callCount).to.equal(3);
        (0, chai_1.expect)(fn.args[0][0]).to.equal(1);
        (0, chai_1.expect)(fn.args[1][0]).to.equal(2);
        (0, chai_1.expect)(fn.args[2][0]).to.equal(3);
    });
    it("delayed", async () => {
        const fn = sinon_1.default.stub();
        const sut = (0, Throttle_1.throttle)(fn, 100);
        sut(1);
        (0, chai_1.expect)(fn.callCount).to.equal(1);
        await wait(10);
        sut(2);
        (0, chai_1.expect)(fn.callCount).to.equal(1);
        await wait(100);
        sut(3);
        await wait(300);
        (0, chai_1.expect)(fn.callCount).to.equal(3);
        (0, chai_1.expect)(fn.args[0][0]).to.equal(1);
        (0, chai_1.expect)(fn.args[1][0]).to.equal(2);
        (0, chai_1.expect)(fn.args[2][0]).to.equal(3);
    });
});
//# sourceMappingURL=Throttle.spec.js.map