"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const zlib = __importStar(require("../src/ZlibUtils"));
describe("unzip", () => {
    it("should process valid unzip operations in order", done => {
        const vals = [];
        const cb = (err, val) => {
            vals.push(val);
            if (vals.length === 5) {
                (0, chai_1.expect)(vals).to.deep.equal([
                    Buffer.from("1"),
                    Buffer.from("2"),
                    Buffer.from("3"),
                    Buffer.from("4"),
                    Buffer.from("5"),
                ]);
                done();
            }
        };
        zlib.unzip(Buffer.from("1f8b0800000000000013330400b7efdc8301000000", "hex"), cb);
        zlib.unzip(Buffer.from("1f8b08000000000000133302000dbed51a01000000", "hex"), cb);
        zlib.unzip(Buffer.from("1f8b08000000000000133306009b8ed26d01000000", "hex"), cb);
        zlib.unzip(Buffer.from("1f8b0800000000000013330100381bb6f301000000", "hex"), cb);
        zlib.unzip(Buffer.from("1f8b0800000000000013330500ae2bb18401000000", "hex"), cb);
    });
    it("should process invalid unzip operations in order", done => {
        const errs = [];
        const cb = err => {
            errs.push(err);
            if (errs.length === 3)
                done();
        };
        zlib.unzip(Buffer.from("1", "hex"), cb);
        zlib.unzip(Buffer.from("2", "hex"), cb);
        zlib.unzip(Buffer.from("3", "hex"), cb);
    });
    it("should process invalid and valid unzip operations in order", done => {
        const vals = [];
        const cb = (err, val) => {
            vals.push(err || val);
            if (vals.length === 3) {
                (0, chai_1.expect)(vals[0]).to.deep.equal(Buffer.from("1"));
                (0, chai_1.expect)(vals[1]).to.be.instanceOf(Error);
                (0, chai_1.expect)(vals[2]).to.deep.equal(Buffer.from("2"));
                done();
            }
        };
        zlib.unzip(Buffer.from("1f8b0800000000000013330400b7efdc8301000000", "hex"), cb);
        zlib.unzip(Buffer.from("2", "hex"), cb);
        zlib.unzip(Buffer.from("1f8b08000000000000133302000dbed51a01000000", "hex"), cb);
    });
});
describe("inflateRaw", () => {
    it("should process operations in order", done => {
        const vals = [];
        const cb = (err, val) => {
            vals.push(val);
            if (vals.length === 5) {
                (0, chai_1.expect)(vals).to.deep.equal([
                    Buffer.from("1"),
                    Buffer.from("2"),
                    Buffer.from("3"),
                    Buffer.from("4"),
                    Buffer.from("5"),
                ]);
                done();
            }
        };
        zlib.inflateRaw(Buffer.from("330400", "hex"), cb);
        zlib.inflateRaw(Buffer.from("330200", "hex"), cb);
        zlib.inflateRaw(Buffer.from("330600", "hex"), cb);
        zlib.inflateRaw(Buffer.from("330100", "hex"), cb);
        zlib.inflateRaw(Buffer.from("330500", "hex"), cb);
    });
});
//# sourceMappingURL=Zlib.spec.js.map