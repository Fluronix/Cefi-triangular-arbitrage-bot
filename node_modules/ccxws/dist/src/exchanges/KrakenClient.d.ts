/// <reference types="node" />
import { BasicClient, MarketMap } from "../BasicClient";
import { Candle } from "../Candle";
import { CandlePeriod } from "../CandlePeriod";
import { ClientOptions } from "../ClientOptions";
import { Level2Snapshot } from "../Level2Snapshots";
import { Level2Update } from "../Level2Update";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
export declare type KrakenClientOptions = ClientOptions & {
    autoloadSymbolMaps?: boolean;
};
/**
    Kraken's API documentation is availble at:
    https://www.kraken.com/features/websocket-api

    Once the socket is open you can subscribe to a channel by sending
    a subscribe request message.

    Ping is initiated by the client, not the server. This means
    we do not need to listen for pings events or respond appropriately.

    Requests take an array of pairs to subscribe to an event. This means
    when we subscribe or unsubscribe we need to send the COMPLETE list
    of active markets. BasicClient maintains the list of active markets
    in the various maps: _tickerSubs, _tradeSubs, _level2UpdateSubs.

    This client will retrieve the market keys from those maps to
    determine the remoteIds to send to the server on all sub/unsub requests.
  */
export declare class KrakenClient extends BasicClient {
    candlePeriod: CandlePeriod;
    bookDepth: number;
    debounceWait: number;
    protected debouceTimeoutHandles: Map<string, NodeJS.Timeout>;
    protected subscriptionLog: Map<number, any>;
    protected fromRestMap: Map<string, string>;
    protected fromWsMap: Map<string, string>;
    constructor({ wssPath, autoloadSymbolMaps, watcherMs, }?: KrakenClientOptions);
    /**
    Kraken made the websocket symbols different
    than the REST symbols. Because CCXT uses the REST symbols,
    we're going to default to receiving REST symbols and mapping them
    to the corresponding WS symbol.

    In order to do this, we'll need to retrieve the list of symbols from
    the REST API. The constructor executes this.
   */
    loadSymbolMaps(): Promise<void>;
    /**
    Helper that retrieves the list of ws symbols from the supplied
    subscription map. The BasicClient manages the subscription maps
    when subscribe<Trade|Ticker|etc> is called and adds the records.
    This helper will take the values in a subscription map and
    convert them into the websocket symbols, ensuring that markets
    that are not mapped do not get included in the list.

    @param map subscription map such as _tickerSubs or _tradeSubs
   */
    protected _wsSymbolsFromSubMap(map: MarketMap): string[];
    /**
    Debounce is used to throttle a function that is repeatedly called. This
    is applicable when many calls to subscribe or unsubscribe are executed
    in quick succession by the calling application.
   */
    protected _debounce(type: string, fn: () => void): void;
    /**
    This method is called by each of the _send* methods.  It uses
    a debounce function on a given key so we can batch send the request
    with the active symbols. We also need to convert the rest symbols
    provided by the caller into websocket symbols used by the Kraken
    ws server.

    @param debounceKey unique key for the caller so each call
    is debounced with related calls
    @param subMap subscription map storing the current subs
    for the type, such as _tickerSubs, _tradeSubs, etc.
    @param subscribe true for subscribe, false for unsubscribe
    @param subscription the subscription name passed to the
    JSON-RPC call
   */
    protected _debounceSend(debounceKey: string, subMap: MarketMap, subscribe: boolean, subscription: {
        name: string;
        [x: string]: any;
    }): void;
    /**
    Constructs a request that looks like:
    {
      "event": "subscribe",
      "pair": ["XBT/USD","BCH/USD"]
      "subscription": {
        "name": "ticker"
      }
    }
   */
    protected _sendSubTicker(): void;
    /**
    Constructs a request that looks like:
    {
      "event": "unsubscribe",
      "pair": ["XBT/USD","BCH/USD"]
      "subscription": {
        "name": "ticker"
      }
    }
   */
    protected _sendUnsubTicker(): void;
    /**
    Constructs a request that looks like:
    {
      "event": "subscribe",
      "pair": ["XBT/USD","BCH/USD"]
      "subscription": {
        "name": "trade"
      }
    }
   */
    protected _sendSubTrades(): void;
    /**
    Constructs a request that looks like:
    {
      "event": "unsubscribe",
      "pair": ["XBT/USD","BCH/USD"]
      "subscription": {
        "name": "trade"
      }
    }
   */
    protected _sendUnsubTrades(): void;
    /**
   * Constructs a request that looks like:
    {
      "event": "unsubscribe",
      "pair": ["XBT/USD","BCH/USD"]
      "subscription": {
        "name": "ohlc"
        "interval": 1
      }
    }
   */
    protected _sendSubCandles(): void;
    /**
   * Constructs a request that looks like:
    {
      "event": "unsubscribe",
      "pair": ["XBT/USD","BCH/USD"]
      "subscription": {
        "name": "ohlc"
        "interval": 1
      }
    }
   */
    protected _sendUnsubCandles(): void;
    /**
    Constructs a request that looks like:
    {
      "event": "subscribe",
      "pair": ["XBT/USD","BCH/USD"]
      "subscription": {
        "name": "book"
      }
    }
   */
    protected _sendSubLevel2Updates(): void;
    /**
    Constructs a request that looks like:
    {
      "event": "unsubscribe",
      "pair": ["XBT/USD","BCH/USD"]
      "subscription": {
        "name": "trade"
      }
    }
   */
    protected _sendUnsubLevel2Updates(): void;
    /**
    Handle for incoming messages
    @param raw
   */
    protected _onMessage(raw: string): void;
    protected _sendSubLevel2Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel2Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    /**
    When a subscription is initiated, a subscriptionStatus event is sent.
    This message will be cached in the subscriptionLog for look up later.
    When messages arrive, they only contain the subscription id.  The
    id is used to look up the subscription details in the subscriptionLog
    to determine what the message means.
   */
    protected _processsMessage(msg: any): void;
    /**
    Refer to https://www.kraken.com/en-us/features/websocket-api#message-ticker
   */
    protected _constructTicker(msg: any, market: any): Ticker;
    /**
    Refer to https://www.kraken.com/en-us/features/websocket-api#message-trade

    Since Kraken doesn't send a trade Id we create a surrogate from
    the time stamp. This can result in duplicate trade Ids being generated.
    Additionaly mechanism will need to be put into place by the consumer to
    dedupe them.
   */
    protected _constructTrade(datum: any, market: any): Trade;
    /**
    Refer to https://www.kraken.com/en-us/features/websocket-api#message-ohlc
   */
    protected _constructCandle(msg: any): Candle;
    /**
     * Refer to https://www.kraken.com/en-us/features/websocket-api#message-book
     * Values will look like:
     * [
     *    270,
     *    {"b":[["11260.50000","0.00000000","1596221402.104952"],["11228.70000","2.60111463","1596221103.546084","r"]],"c":"1281654047"},
     *    "book-100",
     *    "XBT/USD"
     * ]
     *
     * [
     *    270,
     *    {"a":[["11277.30000","1.01949833","1596221402.163693"]]},
     *    {"b":[["11275.30000","0.17300000","1596221402.163680"]],"c":"1036980588"},
     *    "book-100",
     *    "XBT/USD"
     * ]
     */
    protected _constructLevel2Update(msg: any, market: any): Level2Update;
    /**
     * Refer to https://www.kraken.com/en-us/features/websocket-api#message-book
     *
     *   {
     *     as: [
     *       [ '3361.30000', '25.57512297', '1551438550.367822' ],
     *       [ '3363.80000', '15.81228000', '1551438539.149525' ]
     *     ],
     *     bs: [
     *       [ '3361.20000', '0.07234101', '1551438547.041624' ],
     *       [ '3357.60000', '1.75000000', '1551438516.825218' ]
     *     ]
     *   }
     */
    protected _constructLevel2Snapshot(datum: any, market: any): Level2Snapshot;
    /**
    Since Kraken doesn't send a trade id, we need to come up with a way
    to generate one on our own. The REST API include the last trade id
    which gives us the clue that it is the second timestamp + 9 sub-second
    digits.

    The WS will provide timestamps with up to 6 decimals of precision.
    The REST API only has timestamps with 4 decimal of precision.

    To maintain consistency, we're going to use the following formula:
      <integer part of unix timestamp> +
      <first 4 digits of fractional part of unix timestamp> +
      00000


    We're using the ROUND_HALF_UP method. From testing, this resulted
    in the best rounding results. Ids are in picoseconds, the websocket
    is broadcast in microsecond, and the REST results are truncated to
    4 decimals.

    This mean it is impossible to determine the rounding algorithm or
    the proper rounding to go from 6 to 4 decimals as the 6 decimals
    are being rounded from 9 which causes issues as the half
    point for 4 digit rounding
      .222950 rounds up to .2230 if the pico_ms value is > .222295000
      .222950 rounds down to .2229 if the pico_ms value is < .222295000

    Consumer code will need to account for collisions and id mismatch.
   */
    protected _createTradeId(unix: string): string;
}
