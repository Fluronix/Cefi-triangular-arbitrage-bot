"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = __importDefault(require("sinon"));
const events_1 = require("events");
const Watcher_1 = require("../src/Watcher");
class MockClient extends events_1.EventEmitter {
    constructor() {
        super();
        this.reconnect = sinon_1.default.stub();
    }
}
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
describe("Watcher", () => {
    let sut;
    let client;
    before(() => {
        client = new MockClient();
        sut = new Watcher_1.Watcher(client, 100);
        sinon_1.default.spy(sut, "stop");
    });
    describe("start", () => {
        before(() => {
            sut.start();
        });
        it("should trigger a stop", () => {
            (0, chai_1.expect)(sut.stop.callCount).to.equal(1);
        });
        it("should start the interval", () => {
            (0, chai_1.expect)(sut._intervalHandle).to.not.be.undefined;
        });
    });
    describe("stop", () => {
        before(() => {
            sut.stop();
        });
        it("should clear the interval", () => {
            (0, chai_1.expect)(sut._intervalHandle).to.be.undefined;
        });
    });
    describe("on messages", () => {
        beforeEach(() => {
            sut._lastMessage = undefined;
        });
        it("other should not mark", () => {
            client.emit("other");
            (0, chai_1.expect)(sut._lastMessage).to.be.undefined;
        });
        it("ticker should mark", () => {
            client.emit("ticker");
            (0, chai_1.expect)(sut._lastMessage).to.not.be.undefined;
        });
        it("trade should mark", () => {
            client.emit("trade");
            (0, chai_1.expect)(sut._lastMessage).to.not.be.undefined;
        });
        it("l2snapshot should mark", () => {
            client.emit("l2snapshot");
            (0, chai_1.expect)(sut._lastMessage).to.not.be.undefined;
        });
        it("l2update should mark", () => {
            client.emit("l2update");
            (0, chai_1.expect)(sut._lastMessage).to.not.be.undefined;
        });
        it("l3snapshot should mark", () => {
            client.emit("l3snapshot");
            (0, chai_1.expect)(sut._lastMessage).to.not.be.undefined;
        });
        it("l3update should mark", () => {
            client.emit("l3update");
            (0, chai_1.expect)(sut._lastMessage).to.not.be.undefined;
        });
    });
    describe("on expire", () => {
        before(() => {
            sut.start();
        });
        it("it should call reconnect on the client", async () => {
            await wait(500);
            (0, chai_1.expect)(client.reconnect.callCount).to.be.gt(0);
        });
    });
}).retries(3);
//# sourceMappingURL=Watcher.spec.js.map