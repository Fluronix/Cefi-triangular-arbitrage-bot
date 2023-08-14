import { BasicClient } from "../BasicClient";
import { Candle } from "../Candle";
import { CandlePeriod } from "../CandlePeriod";
import { ClientOptions } from "../ClientOptions";
import { Level2Snapshot } from "../Level2Snapshots";
import { Level2Update } from "../Level2Update";
import { Market } from "../Market";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
export declare class BitmexClient extends BasicClient {
    candlePeriod: CandlePeriod;
    constructL2Price: boolean;
    protected l2PriceMap: Map<string, string>;
    protected tickerMap: Map<string, Ticker>;
    protected _sendSubLevel2Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel2Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    /**
    Documentation:
    https://www.bitmex.com/app/wsAPI
   */
    constructor({ wssPath, watcherMs }?: ClientOptions);
    protected _sendSubTicker(remote_id: any): void;
    protected _sendUnsubTicker(remote_id: any): void;
    protected _sendSubQuote(remote_id: any): void;
    protected _sendUnsubQuote(remote_id: any): void;
    protected _sendSubTrades(remote_id: any): void;
    protected _sendUnsubTrades(remote_id: any): void;
    protected _sendSubCandles(remote_id: any): void;
    protected _sendUnsubCandles(remote_id: any): void;
    protected _sendSubLevel2Updates(remote_id: any): void;
    protected _sendUnsubLevel2Updates(remote_id: any): void;
    protected _onMessage(msgs: any): void;
    protected _constructTrades(datum: any, market: Market): Trade;
    /**
   {
      table: 'tradeBin1m',
      action: 'insert',
      data: [
        {
          timestamp: '2020-08-12T20:33:00.000Z',
          symbol: 'XBTUSD',
          open: 11563,
          high: 11563,
          low: 11560,
          close: 11560.5,
          trades: 158,
          volume: 157334,
          vwap: 11562.0303,
          lastSize: 4000,
          turnover: 1360824337,
          homeNotional: 13.60824337,
          foreignNotional: 157334
        }
      ]
    }
   */
    protected _constructCandle(datum: any): Candle;
    /**
    Snapshot message are sent when an l2orderbook is subscribed to.
    This part is necessary to maintain a proper orderbook because
    BitMEX sends updates with a unique price key and does not
    include a price value. This code will maintain the price map
    so that update messages can be constructed with a price.
   */
    protected _constructLevel2Snapshot(data: any, market: Market): Level2Snapshot;
    /**
    Update messages will arrive as either insert, update, or delete
    messages. The data payload appears to be uniform for a market.
    This code will do the heavy lifting on remapping the pricing
    structure. BitMEX sends hte updates without a price and instead
    include a unique identifer for the asset and the price.

    Insert:
      {
        table: 'orderbookL2'
        action: 'insert'
        data: [{ symbol: 'XBTUSD', id: 8799198150, side: 'Sell', size: 1, price: 8018.5 }]
      }

    Update:
      {
        table: 'orderBookL2',
        action: 'update',
        data: [ { symbol: 'XBTUSD', id: 8799595600, side: 'Sell', size: 258136 } ]
      }

    Delete:
      {
        table: 'orderBookL2',
        action: 'delete',
        data: [ { symbol: 'XBTUSD', id: 8799198650, side: 'Sell' } ]
      }

    We will standardize these to the CCXWS format:
      - Insert and update will have price and size
      - Delete will have a size of 0.
   */
    protected _constructLevel2Update(msg: any, market: any): Level2Update;
    /**
   * Updates a ticker for a quote update. From
   * testing, quote broadcasts are sorted from oldest to newest and are
   * for a single market. The parent message looks like below and
   * the last object in the array is provided to this method.
   * {
        table: 'quote',
        action: 'insert',
        data: [
          {
            timestamp: '2020-04-17T16:05:57.560Z',
            symbol: 'XBTUSD',
            bidSize: 689279,
            bidPrice: 7055,
            askPrice: 7055.5,
            askSize: 927374
          },
          {
            timestamp: '2020-04-17T16:05:58.016Z',
            symbol: 'XBTUSD',
            bidSize: 684279,
            bidPrice: 7055,
            askPrice: 7055.5,
            askSize: 927374
          }
        ]
      }
   */
    protected _onQuoteMessage(msg: any): void;
    /**
   * Constructs a ticker from a single quote data
    {
      timestamp: '2020-04-17T16:05:58.016Z',
      symbol: 'XBTUSD',
      bidSize: 684279,
      bidPrice: 7055,
      askPrice: 7055.5,
      askSize: 927374
    }
   */
    protected _constructTickerForQuote(datum: any, market: Market): Ticker;
    /**
   * Updates a ticker for the market based on the trade informatio
      {
        timestamp: '2020-04-17T16:39:53.324Z',
        symbol: 'XBTUSD',
        side: 'Buy',
        size: 20,
        price: 7062,
        tickDirection: 'ZeroPlusTick',
        trdMatchID: 'e6101cc7-844e-25d2-e4a5-7e71d04439e3',
        grossValue: 283200,
        homeNotional: 0.002832,
        foreignNotional: 20
      }
   */
    protected _constructTickerForTrade(data: any, market: Market): Ticker;
    /**
     * Creates a blank ticker for the specified market. The Ticker class is optimized
     * to maintain a consistent shape to prevent shape transitions and reduce garbage.
     * @param {*} market
     */
    protected _createTicker(market: Market): Ticker;
    /**
     * Retrieves a ticker for the market or constructs one if it doesn't exist
     * @param {string} market
     */
    protected _getTicker(market: Market): Ticker;
    /**
     * Deletes cached ticker data after unsubbing from ticker.
     */
    protected _deleteTicker(remote_id: string): void;
    /**
     * Returns true when all required information is available
     * in the ticker. Because the ticker is built from multiple stream
     * testing will break if a ticker is prematurely emitted that does
     * not contain all of the required data.
     */
    protected _isTickerReady(ticker: Ticker): boolean;
}
