"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.post = exports.getResponse = exports.get = void 0;
const https_1 = __importDefault(require("https"));
const url_1 = __importDefault(require("url"));
/**
 * Maks an HTTPS GET request to the specified URI and returns the parsed JSON
 * body data.
 */
async function get(uri) {
    const result = await getResponse(uri);
    return result.data;
}
exports.get = get;
/**
 * Make an HTTPS GET request to the specified URI and returns the parsed JSON
 * body data as well as the full response.
 */
async function getResponse(uri) {
    return new Promise((resolve, reject) => {
        const req = https_1.default.get(url_1.default.parse(uri), res => {
            const results = [];
            res.on("error", reject);
            res.on("data", (data) => results.push(data));
            res.on("end", () => {
                const finalResults = Buffer.concat(results).toString();
                if (res.statusCode !== 200) {
                    return reject(new Error(results.toString()));
                }
                else {
                    const resultsParsed = JSON.parse(finalResults);
                    return resolve({
                        data: resultsParsed,
                        response: res,
                    });
                }
            });
        });
        req.on("error", reject);
        req.end();
    });
}
exports.getResponse = getResponse;
async function post(uri, postData = "") {
    return new Promise((resolve, reject) => {
        const { hostname, port, pathname } = url_1.default.parse(uri);
        const req = https_1.default.request({
            host: hostname,
            port,
            path: pathname,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": postData.length,
            },
        }, res => {
            const results = [];
            res.on("error", reject);
            res.on("data", data => results.push(data));
            res.on("end", () => {
                const finalResults = Buffer.concat(results).toString();
                if (res.statusCode !== 200) {
                    return reject(results.toString());
                }
                else {
                    return resolve(JSON.parse(finalResults));
                }
            });
        });
        req.on("error", reject);
        req.write(postData);
        req.end();
    });
}
exports.post = post;
//# sourceMappingURL=Https.js.map