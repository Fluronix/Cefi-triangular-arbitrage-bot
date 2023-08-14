import { BasicClient, MarketMap, SendFn } from "../BasicClient";
import { Market } from "../Market";
export declare enum BitfinexTradeMessageType {
    /**
     * Receive both execution events and updates
     */
    All = "all",
    /**
     * Receive trade events immediately at the time of execution. Events
     * do not include the database identifier, only the sequence identifier.
     */
    Execution = "te",
    /**
     * Receive trade events that have been written to the database. These
     * events include both the sequence identifier as well as the database
     * identifier. These events are delayed by 1-2 seconds after the
     * trade event.
     */
    Update = "tu"
}
export declare type BitfinexClientOptions = {
    wssPath?: string;
    watcherMs?: number;
    l2UpdateDepth?: number;
    throttleL2Snapshot?: number;
    /**
     * (optional, default false). If true, emits empty events for all
     * channels on heartbeat events which includes the sequenceId. This
     * allows sequenceId validation by always receiving sequenceId from
     * all heartbeat events on all channels while working w/the
     * existing trade/ticker/orderbook event types
     */
    enableEmptyHeartbeatEvents?: boolean;
    /**
     * (optional, defaults to "tu"). One of "tu", "te", or "all".
     * Determines whether to use trade channel events of type "te" or
     * "tu", or all trade events.
     * See https://blog.bitfinex.com/api/websocket-api-update/.
     *
     * If you're using sequenceIds to validate websocket messages you
     * will want to use "all" to receive every sequenceId.
     */
    tradeMessageType?: BitfinexTradeMessageType;
};
export declare class BitfinexClient extends BasicClient {
    l2UpdateDepth: number;
    enableEmptyHeartbeatEvents: boolean;
    tradeMessageType: BitfinexTradeMessageType;
    protected _channels: any;
    protected _sendSubCandles: (...args: any[]) => any;
    protected _sendSubLevel2Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubCandles: (...args: any[]) => Promise<any>;
    protected _sendUnsubLevel2Snapshots: (...args: any[]) => Promise<any>;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => Promise<any>;
    constructor({ wssPath, watcherMs, l2UpdateDepth, enableEmptyHeartbeatEvents, tradeMessageType, }?: BitfinexClientOptions);
    protected _onConnected(): void;
    /**
     * Override the default BasicClient _unsubscribe by deferring removal
     * of from the appropriate map until the unsubscribe event has been
     * received.
     *
     * If enableEmptyHeartbeatEvents (validating sequenceIds) we need to
     * keep receiving events from a channel after we sent the unsub event
     * until unsubscribe is confirmed. This is because every message's
     * sequenceId must be validated, and some may arrive between sending
     * unsub and it being confirmed. So we dont remove from the map and
     * will continue emitting events for this channel until they stop
     * arriving.
     */
    protected _unsubscribe(market: Market, map: MarketMap, sendFn: SendFn): void;
    protected _sendConfiguration(): void;
    protected _sendSubTicker(remote_id: string): void;
    protected _sendUnsubTicker(remote_id: string): void;
    protected _sendSubTrades(remote_id: string): void;
    protected _sendUnsubTrades(remote_id: string): void;
    protected _sendSubLevel2Updates(remote_id: string): void;
    protected _sendUnsubLevel2Updates(remote_id: string): void;
    protected _sendSubLevel3Updates(remote_id: string): void;
    protected _sendUnsubLevel3Updates(remote_id: string): void;
    protected _sendUnsubscribe(chanId: any): void;
    protected _findChannel(type: string, remote_id: string): string;
    /**
     * Handle heartbeat messages on each channel.
     */
    protected _onHeartbeatMessage(msg: any, channel: any): void;
    protected _onMessage(raw: string): void;
    protected _onUnsubscribeMessage(msg: any): void;
    /**
     * Handle heartbeat events in the ticker channel.
     */
    protected _onTickerHeartbeat(msg: any, market: Market): void;
    protected _onTicker(msg: any, market: Market): void;
    /**
     * Handle heartbeat events in the trades channel.
     */
    protected _onTradeMessageHeartbeat(msg: any, market: Market): void;
    /**
     * Handle the trade history payload received when initially subscribing, which includes recent trades history.
     * Each trade in history is emitted as its own trade event.
     */
    protected _onTradeHistoryMessage(msg: any, market: Market): void;
    protected _onTradeMessage(msg: any, market: Market): void;
    protected _onLevel2Snapshot(msg: any, market: Market): void;
    /**
     * Handle heartbeat events in the l2updatae channel
     */
    protected _onLevel2UpdateHeartbeat(msg: any, market: Market): void;
    protected _onLevel2Update(msg: any, market: any): void;
    protected _onLevel3Snapshot(msg: any, market: any): void;
    /**
     * Handle heartbeat events in the l3updatae channel
     */
    protected _onLevel3UpdateHeartbeat(msg: any, market: Market): void;
    protected _onLevel3Update(msg: any, market: any): void;
}
