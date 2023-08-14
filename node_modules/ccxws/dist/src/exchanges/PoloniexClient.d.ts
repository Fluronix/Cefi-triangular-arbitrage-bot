import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { Level2Snapshot } from "../Level2Snapshots";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
export declare type PoloniexClientOptions = ClientOptions & {
    autoloadSymbolMaps?: boolean;
};
export declare class PoloniexClient extends BasicClient {
    protected _idMap: Map<any, any>;
    protected _subbedToTickers: boolean;
    protected TICKERS_ID: number;
    protected MARKET_IDS: Map<number, string>;
    protected _subCount: any;
    constructor({ wssPath, autoloadSymbolMaps, watcherMs, }?: PoloniexClientOptions);
    /**
    Poloniex uses numeric identifiers for its markets.
    A static map of these markets can be obtained from:
    https://docs.poloniex.com/#currency-pair-ids

    We can use the ticker REST API as a mechanism to obtain
    the identifiers and create an index of id to symbol.
   */
    loadSymbolMaps(): Promise<void>;
    protected _resetSubCount(): void;
    protected _sendSubTicker(): void;
    protected _sendUnsubTicker(): void;
    protected _sendSubTrades(remote_id: any): void;
    protected _sendUnsubTrades(remote_id: any): void;
    protected _sendSubLevel2Updates(remote_id: any): void;
    protected _sendUnsubLevel2Updates(remote_id: any): void;
    protected _sendSubCandles: (...args: any[]) => any;
    protected _sendUnsubCandles: (...args: any[]) => any;
    protected _sendSubLevel2Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel2Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    protected _sendSubscribe(remote_id: any): void;
    protected _sendUnsubscribe(remote_id: any): void;
    protected _onMessage(raw: any): void;
    protected _createTicker(update: any, market: any): Ticker;
    protected _constructTradeFromMessage(update: any, market: any): Trade;
    protected _constructoLevel2Snapshot(seq: any, update: any, market: any): Level2Snapshot;
}
