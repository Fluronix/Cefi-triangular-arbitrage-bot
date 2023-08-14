"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = __importDefault(require("sinon"));
const Batch_1 = require("../../src/flowcontrol/Batch");
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
describe("batch", () => {
    describe("small batch size", () => {
        let fn;
        let sut;
        beforeEach(() => {
            const batchSize = 2;
            const delayMs = 50;
            fn = sinon_1.default.stub();
            sut = (0, Batch_1.batch)(fn, batchSize, delayMs);
        });
        it("groups calls within timeout period", async () => {
            sut(1);
            await wait(10);
            sut(2);
            await wait(10);
            sut(3);
            await wait(100);
            (0, chai_1.expect)(fn.callCount).to.equal(2);
            (0, chai_1.expect)(fn.args[0][0]).to.deep.equal([[1], [2]]);
            (0, chai_1.expect)(fn.args[1][0]).to.deep.equal([[3]]);
        });
        it("groups calls within debounce periods", async () => {
            sut(1);
            await wait(100);
            sut(2);
            await wait(100);
            sut(3);
            await wait(100);
            (0, chai_1.expect)(fn.callCount).to.equal(3);
            (0, chai_1.expect)(fn.args[0][0]).to.deep.equal([[1]]);
            (0, chai_1.expect)(fn.args[1][0]).to.deep.equal([[2]]);
            (0, chai_1.expect)(fn.args[2][0]).to.deep.equal([[3]]);
        });
        it("can reset pending executions", async () => {
            sut(1);
            sut.cancel();
            await wait(100);
            (0, chai_1.expect)(fn.callCount).to.equal(0);
        });
    });
    describe("large batch size", () => {
        let fn;
        let sut;
        beforeEach(() => {
            const batchSize = 100;
            const delayMs = 50;
            fn = sinon_1.default.stub();
            sut = (0, Batch_1.batch)(fn, batchSize, delayMs);
        });
        it("groups calls within timeout period", async () => {
            sut(1);
            await wait(10);
            sut(2);
            await wait(10);
            sut(3);
            await wait(100);
            (0, chai_1.expect)(fn.callCount).to.equal(1);
            (0, chai_1.expect)(fn.args[0][0]).to.deep.equal([[1], [2], [3]]);
        });
        it("groups calls within debounce periods", async () => {
            sut(1);
            await wait(100);
            sut(2);
            await wait(100);
            sut(3);
            await wait(100);
            (0, chai_1.expect)(fn.callCount).to.equal(3);
            (0, chai_1.expect)(fn.args[0][0]).to.deep.equal([[1]]);
            (0, chai_1.expect)(fn.args[1][0]).to.deep.equal([[2]]);
            (0, chai_1.expect)(fn.args[2][0]).to.deep.equal([[3]]);
        });
        it("can reset pending executions", async () => {
            sut(1);
            sut.cancel();
            await wait(100);
            (0, chai_1.expect)(fn.callCount).to.equal(0);
        });
    });
});
//# sourceMappingURL=Batch.spec.js.map