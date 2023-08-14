/// <reference types="node" />
import { BasicClient } from "../BasicClient";
import { CandlePeriod } from "../CandlePeriod";
import { ClientOptions } from "../ClientOptions";
import { CancelableFn } from "../flowcontrol/Fn";
import { Market } from "../Market";
export declare type KucoinClientOptions = ClientOptions & {
    sendThrottleMs?: number;
    restThrottleMs?: number;
};
/**
 * Kucoin client has a hard limit of 100 subscriptions per socket connection.
 * When more than 100 subscriptions are made on a single socket it will generate
 * an error that says "509: exceed max subscription count limitation of 100 per session".
 * To work around this will require creating multiple clients if you makem ore than 100
 * subscriptions.
 */
export declare class KucoinClient extends BasicClient {
    candlePeriod: CandlePeriod;
    readonly restThrottleMs: number;
    readonly connectInitTimeoutMs: number;
    protected _pingIntervalTime: number;
    protected _connectId: string;
    protected _sendMessage: CancelableFn;
    protected _requestLevel2Snapshot: CancelableFn;
    protected _requestLevel3Snapshot: CancelableFn;
    protected _pingInterval: NodeJS.Timeout;
    constructor({ wssPath, watcherMs, sendThrottleMs, restThrottleMs, }?: KucoinClientOptions);
    protected _beforeClose(): void;
    protected _beforeConnect(): void;
    protected _startPing(): void;
    protected _stopPing(): void;
    protected _sendPing(): void;
    /**
     * Kucoin requires a token that is obtained from a REST endpoint. We make the synchronous
     * _connect method create a temporary _wss instance so that subsequent calls to _connect
     * are idempotent and only a single socket connection is created. Then the _connectAsync
     * call is performed that does the REST token fetching and the connection.
     */
    protected _connect(): void;
    protected _connectAsync(): Promise<void>;
    protected __sendMessage(msg: any): void;
    protected _sendSubTicker(remote_id: string): void;
    protected _sendUnsubTicker(remote_id: string): void;
    protected _sendSubTrades(remote_id: string): void;
    protected _sendUnsubTrades(remote_id: string): void;
    protected _sendSubCandles(remote_id: string): void;
    protected _sendUnsubCandles(remote_id: string): void;
    protected _sendSubLevel2Updates(remote_id: string): void;
    protected _sendUnsubLevel2Updates(remote_id: string): void;
    protected _sendSubLevel3Updates(remote_id: string): void;
    protected _sendUnsubLevel3Updates(remote_id: string): void;
    protected _sendSubLevel2Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel2Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _onMessage(raw: string): void;
    protected _processMessage(msg: any): void;
    protected _processTrades(msg: any): void;
    /**
    {
        "type":"message",
        "topic":"/market/candles:BTC-USDT_1hour",
        "subject":"trade.candles.update",
        "data":{

            "symbol":"BTC-USDT",    // symbol
            "candles":[

                "1589968800",   // Start time of the candle cycle
                "9786.9",       // open price
                "9740.8",       // close price
                "9806.1",       // high price
                "9732",         // low price
                "27.45649579",  // Transaction volume
                "268280.09830877"   // Transaction amount
            ],
            "time":1589970010253893337  // now（us）
        }
    }
   */
    protected _processCandles(msg: any): void;
    protected _processTicker(msg: any): void;
    /**
    {
      "data":{
        "sequenceStart":"1584724386150",
        "symbol":"BTC-USDT",
        "changes":{
          "asks":[
            ["9642.7","0.386","1584724386150"]
          ],
          "bids":[]
        },
        "sequenceEnd":"1584724386150"
      },
      "subject":"trade.l2update",
      "topic":"/market/level2:BTC-USDT",
      "type":"message"
    }
   */
    protected _processL2Update(msg: any): void;
    /**
   {
      "code": "200000",
      "data": {
        "sequence": "1584724519811",
        "asks": [
          [
            "9631.9",
            "1.62256573"
          ],
          [
            "9632",
            "0.00000001"
          ]
        ],
        "bids": [
          [
            "9631.8",
            "0.19411805"
          ],
          [
            "9631.6",
            "0.00094623"
          ]
        ],
        "time": 1591469595966
      }
    }
   */
    protected __requestLevel2Snapshot(market: Market): Promise<void>;
    /**
   RECEIVED - This message type is really for informational purposes and
   does not include a side or price. Similar to the done message below
   we will include a psuedo-point with zeroedp price and amount to
   maintain consistency with other implementations.
   {
      "data": {
        "symbol": "BTC-USDT",
        "sequence": "1594781753800",
        "orderId": "5f3aa0c724d57500070d36e7",
        "clientOid": "cef1156e5f928d0e046a67891cdb780d",
        "ts": "1597677767948119917"
      },
      "subject": "received",
      "topic": "/spotMarket/level3:BTC-USDT",
      "type": "message"
    }
  */
    protected _processL3UpdateReceived(msg: any): void;
    /**
    OPEN
    {
      "data": {
        "symbol": "BTC-USDT",
        "sequence": "1594781800484",
        "side": "buy",
        "orderTime": "1597678002842139731",
        "size": "0.65898942",
        "orderId": "5f3aa1b2b6aeb200072bd6d8",
        "price": "12139.8",
        "ts": "1597678002842139731"
      },
      "subject": "open",
      "topic": "/spotMarket/level3:BTC-USDT",
      "type": "message"
    }
   */
    protected _processL3UpdateOpen(msg: any): void;
    /**
    DONE - because done does not include price,size, or side of book,
    we will create a zeroed point on both sides of the book. This keeps
    consistency with other order books that always have a point.

    {
      "data": {
        "symbol": "BTC-USDT",
        "reason": "canceled",
        "sequence": "1594781816444",
        "orderId": "5f3aa1f3b640150007baf5d6",
        "ts": "1597678072795057282"
      },
      "subject": "done",
      "topic": "/spotMarket/level3:BTC-USDT",
      "type": "message"
    }
   */
    protected _processL3UpdateDone(msg: any): void;
    /**
   MATCH - for the sake of the update, we will follow with the
   information that is updated in the orderbook, that is the maker. In
   this case, the remainSize is the value that should be adjusted
   for the maker's order.
   {
      "data": {
        "symbol": "BTC-USDT",
        "sequence": "1594781824886",
        "side": "sell",
        "size": "0.04541835",
        "price": "12161.1",
        "takerOrderId": "5f3aa220be5dd1000815506e",
        "makerOrderId": "5f3aa21db6aeb200072ce502",
        "tradeId": "5f3aa22078577835017d3de2",
        "remainSize": "1.44964657",
        "ts": "1597678112828040864"
      },
      "subject": "match",
      "topic": "/spotMarket/level3:BTC-USDT",
      "type": "message"
    }
   */
    protected _processL3UpdateMatch(msg: any): void;
    /**
   CHANGE - because change does not include the side, we again duplicate
   points in the asks and bids. The price is also not inclued and is
   zeroed to maintain consistency with the remainder of the library
   {
      "data": {
        "symbol": "BTC-USDT",
        "sequence": "1594781878279",
        "size": "0.0087306",
        "orderId": "5f3aa2d2d5f3da0007802966",
        "ts": "1597678290249785626"
      },
      "subject": "update",
      "topic": "/spotMarket/level3:BTC-USDT",
      "type": "message"
    }
   */
    protected _processL3UpdateUpdate(msg: any): void;
    protected __requestLevel3Snapshot(market: Market): Promise<void>;
}
