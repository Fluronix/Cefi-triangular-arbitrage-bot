"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartWss = void 0;
const events_1 = require("events");
const ws_1 = __importDefault(require("ws"));
const Util_1 = require("./Util");
class SmartWss extends events_1.EventEmitter {
    constructor(wssPath) {
        super();
        this.wssPath = wssPath;
        this._retryTimeoutMs = 15000;
        this._connected = false;
    }
    /**
     * Gets if the socket is currently connected
     */
    get isConnected() {
        return this._connected;
    }
    /**
     * Attempts to connect
     */
    async connect() {
        await this._attemptConnect();
    }
    /**
     * Closes the connection
     */
    close() {
        this.emit("closing");
        if (this._wss) {
            this._wss.removeAllListeners();
            this._wss.on("close", () => this.emit("closed"));
            this._wss.on("error", err => {
                if (err.message !== "WebSocket was closed before the connection was established")
                    return;
                this.emit("error", err);
            });
            this._wss.close();
        }
    }
    /**
     * Sends the data if the socket is currently connected.
     * Otherwise the consumer needs to retry to send the information
     * when the socket is connected.
     */
    send(data) {
        if (this._connected) {
            try {
                this._wss.send(data);
            }
            catch (e) {
                this.emit("error", e);
            }
        }
    }
    /////////////////////////
    /**
     * Attempts a connection and will either fail or timeout otherwise.
     */
    _attemptConnect() {
        return new Promise(resolve => {
            const wssPath = this.wssPath;
            this.emit("connecting");
            this._wss = new ws_1.default(wssPath, {
                perMessageDeflate: false,
                handshakeTimeout: 15000,
            });
            this._wss.on("open", () => {
                this._connected = true;
                this.emit("open"); // deprecated
                this.emit("connected");
                resolve();
            });
            this._wss.on("close", () => this._closeCallback());
            this._wss.on("error", err => this.emit("error", err));
            this._wss.on("message", msg => this.emit("message", msg));
        });
    }
    /**
     * Handles the closing event by reconnecting
     */
    _closeCallback() {
        this._connected = false;
        this._wss = null;
        this.emit("disconnected");
        void this._retryConnect();
    }
    /**
     * Perform reconnection after the timeout period
     * and will loop on hard failures
     */
    async _retryConnect() {
        // eslint-disable-next-line no-constant-condition
        while (true) {
            try {
                await (0, Util_1.wait)(this._retryTimeoutMs);
                await this._attemptConnect();
                return;
            }
            catch (ex) {
                this.emit("error", ex);
            }
        }
    }
}
exports.SmartWss = SmartWss;
//# sourceMappingURL=SmartWss.js.map