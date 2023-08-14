"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = __importDefault(require("sinon"));
const Debounce_1 = require("../../src/flowcontrol/Debounce");
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
describe("debounce", () => {
    let fn;
    let sut;
    beforeEach(() => {
        const debounceMs = 50;
        fn = sinon_1.default.stub();
        sut = (0, Debounce_1.debounce)(fn, debounceMs);
    });
    it("groups calls within timeout period", async () => {
        sut(1);
        await wait(10);
        sut(2);
        await wait(10);
        sut(3);
        await wait(100);
        (0, chai_1.expect)(fn.callCount).to.equal(1);
        (0, chai_1.expect)(fn.args[0][0]).to.deep.equal(3);
    });
    it("groups calls within debounce periods", async () => {
        sut(1);
        await wait(100);
        sut(2);
        await wait(100);
        sut(3);
        await wait(100);
        (0, chai_1.expect)(fn.callCount).to.equal(3);
        (0, chai_1.expect)(fn.args[0][0]).to.deep.equal(1);
        (0, chai_1.expect)(fn.args[1][0]).to.deep.equal(2);
        (0, chai_1.expect)(fn.args[2][0]).to.deep.equal(3);
    });
    it("can cancel pending executions", async () => {
        sut(1);
        sut.cancel();
        await wait(100);
        (0, chai_1.expect)(fn.callCount).to.equal(0);
    });
});
//# sourceMappingURL=Debounce.spec.js.map