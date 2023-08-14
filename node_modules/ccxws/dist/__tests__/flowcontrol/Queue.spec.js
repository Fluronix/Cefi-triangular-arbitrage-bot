"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-sparse-arrays */
const Queue_1 = require("../../src/flowcontrol/Queue");
const chai_1 = require("chai");
describe("Queue", () => {
    it("empty returns undefined", () => {
        const sut = new Queue_1.Queue(4);
        (0, chai_1.expect)(sut.shift()).to.be.undefined;
    });
    it("pushes and shifts", () => {
        const sut = new Queue_1.Queue(4);
        sut.push(0);
        sut.push(1);
        (0, chai_1.expect)(sut.shift()).to.equal(0);
        (0, chai_1.expect)(sut.shift()).to.equal(1);
    });
    it("pushes and shifts without resize", () => {
        const sut = new Queue_1.Queue(4);
        sut.push(0);
        sut.push(1);
        sut.push(2);
        (0, chai_1.expect)(sut.buffer.buffer).to.deep.equal([undefined, 0, 1, 2]);
        (0, chai_1.expect)(sut.shift()).to.equal(0);
        (0, chai_1.expect)(sut.shift()).to.equal(1);
        (0, chai_1.expect)(sut.shift()).to.equal(2);
    });
    for (let iter = 0; iter < 3; iter++) {
        it(`resize iteration ${iter}`, () => {
            const sut = new Queue_1.Queue(4);
            for (let i = 0; i < iter; i++) {
                sut.push(0);
                sut.shift();
            }
            sut.push(1);
            sut.push(2);
            sut.push(3);
            sut.push(4); // causes resize
            (0, chai_1.expect)(sut.buffer.buffer).to.deep.equal([
                undefined,
                1,
                2,
                3,
                4,
                undefined,
                undefined,
                undefined,
            ]);
        });
    }
    it("resize many", () => {
        const sut = new Queue_1.Queue(2);
        for (let i = 0; i < 1024; i++) {
            sut.push(i);
        }
        for (let i = 0; i < 1024; i++) {
            (0, chai_1.expect)(sut.shift()).to.equal(i);
        }
    });
});
//# sourceMappingURL=Queue.spec.js.map