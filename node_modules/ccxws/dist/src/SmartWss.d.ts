/// <reference types="node" />
import { EventEmitter } from "events";
export declare class SmartWss extends EventEmitter {
    readonly wssPath: string;
    private _retryTimeoutMs;
    private _connected;
    private _wss;
    constructor(wssPath: string);
    /**
     * Gets if the socket is currently connected
     */
    get isConnected(): boolean;
    /**
     * Attempts to connect
     */
    connect(): Promise<void>;
    /**
     * Closes the connection
     */
    close(): void;
    /**
     * Sends the data if the socket is currently connected.
     * Otherwise the consumer needs to retry to send the information
     * when the socket is connected.
     */
    send(data: string): void;
    /**
     * Attempts a connection and will either fail or timeout otherwise.
     */
    private _attemptConnect;
    /**
     * Handles the closing event by reconnecting
     */
    private _closeCallback;
    /**
     * Perform reconnection after the timeout period
     * and will loop on hard failures
     */
    private _retryConnect;
}
