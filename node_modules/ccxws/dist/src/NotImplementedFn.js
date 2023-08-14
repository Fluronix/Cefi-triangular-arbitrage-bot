"use strict";
/* eslint-disable @typescript-eslint/require-await */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotImplementedAsyncFn = exports.NotImplementedFn = void 0;
const NotImplementedFn = () => new Error("Not implemented");
exports.NotImplementedFn = NotImplementedFn;
const NotImplementedAsyncFn = async () => new Error("Not implemented");
exports.NotImplementedAsyncFn = NotImplementedAsyncFn;
//# sourceMappingURL=NotImplementedFn.js.map