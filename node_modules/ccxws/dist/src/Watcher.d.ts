/**
 * Watcher subscribes to a client's messages and
 * will trigger a restart of the client if no
 * information has been transmitted in the checking interval
 */
export declare class Watcher {
    readonly client: any;
    readonly intervalMs: number;
    private _intervalHandle;
    private _lastMessage;
    constructor(client: any, intervalMs?: number);
    /**
     * Starts an interval to check if a reconnction is required
     */
    start(): void;
    /**
     * Stops an interval to check if a reconnection is required
     */
    stop(): void;
    /**
     * Marks that a message was received
     */
    markAlive(): void;
    /**
     * Checks if a reconnecton is required by comparing the current
     * date to the last receieved message date
     */
    private _onCheck;
    /**
     * Logic to perform a reconnection event of the client
     */
    private _reconnect;
}
