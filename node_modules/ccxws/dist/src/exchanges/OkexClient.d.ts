/// <reference types="node" />
import { BasicClient } from "../BasicClient";
import { Candle } from "../Candle";
import { CandlePeriod } from "../CandlePeriod";
import { ClientOptions } from "../ClientOptions";
import { CancelableFn } from "../flowcontrol/Fn";
import { Level2Snapshot } from "../Level2Snapshots";
import { Level2Update } from "../Level2Update";
import { Market } from "../Market";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
export declare type OkexClientOptions = ClientOptions & {
    sendThrottleMs?: number;
};
/**
 * Implements OKEx V3 WebSocket API as defined in
 * https://www.okex.com/docs/en/#spot_ws-general
 *
 * Limits:
 *    1 connection / second
 *    240 subscriptions / hour
 *
 * Connection will disconnect after 30 seconds of silence
 * it is recommended to send a ping message that contains the
 * message "ping".
 *
 * Order book depth includes maintenance of a checksum for the
 * first 25 values in the orderbook. Each update includes a crc32
 * checksum that can be run to validate that your order book
 * matches the server. If the order book does not match you should
 * issue a reconnect.
 *
 * Refer to: https://www.okex.com/docs/en/#spot_ws-checksum
 */
export declare class OkexClient extends BasicClient {
    candlePeriod: CandlePeriod;
    protected _sendMessage: CancelableFn;
    protected _pingInterval: NodeJS.Timeout;
    constructor({ wssPath, watcherMs, sendThrottleMs, }?: OkexClientOptions);
    protected _beforeClose(): void;
    protected _beforeConnect(): void;
    protected _startPing(): void;
    protected _stopPing(): void;
    protected _sendPing(): void;
    /**
     * Constructs a market argument in a backwards compatible manner where
     * the default is a spot market.
     */
    protected _marketArg(method: string, market: Market): string;
    /**
     * Gets the exchanges interpretation of the candle period
     */
    protected _candlePeriod(period: CandlePeriod): "60s" | "180s" | "300s" | "900s" | "1800s" | "3600s" | "7200s" | "14400s" | "21600s" | "43200s" | "86400s" | "604800s";
    protected __sendMessage(msg: any): void;
    protected _sendSubTicker(remote_id: any, market: any): void;
    protected _sendUnsubTicker(remote_id: any, market: any): void;
    protected _sendSubTrades(remote_id: any, market: any): void;
    protected _sendUnsubTrades(remote_id: any, market: any): void;
    protected _sendSubCandles(remote_id: any, market: any): void;
    protected _sendUnsubCandles(remote_id: any, market: any): void;
    protected _sendSubLevel2Snapshots(remote_id: any, market: any): void;
    protected _sendUnsubLevel2Snapshots(remote_id: any, market: any): void;
    protected _sendSubLevel2Updates(remote_id: any, market: any): void;
    protected _sendUnsubLevel2Updates(remote_id: any, market: any): void;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    protected _onMessage(compressed: any): void;
    protected _processsMessage(msg: any): void;
    /**
   * Process ticker messages in the format
    { table: 'spot/ticker',
      data:
      [ { instrument_id: 'ETH-BTC',
          last: '0.02181',
          best_bid: '0.0218',
          best_ask: '0.02181',
          open_24h: '0.02247',
          high_24h: '0.02262',
          low_24h: '0.02051',
          base_volume_24h: '379522.2418555',
          quote_volume_24h: '8243.729793336415',
          timestamp: '2019-07-15T17:10:55.671Z' } ] }
   */
    protected _processTicker(msg: any): void;
    /**
   * Processes trade messages in the format
    { table: 'spot/trade',
      data:
      [ { instrument_id: 'ETH-BTC',
          price: '0.0218',
          side: 'sell',
          size: '1.1',
          timestamp: '2019-07-15T17:10:56.047Z',
          trade_id: '776432498' } ] }
   */
    protected _processTrades(msg: any): void;
    /**
   * Processes a candle message
    {
      "table": "spot/candle60s",
      "data": [
        {
          "candle": [
            "2020-08-10T20:42:00.000Z",
            "0.03332",
            "0.03332",
            "0.03331",
            "0.03332",
            "44.058532"
          ],
          "instrument_id": "ETH-BTC"
        }
      ]
    }
   */
    protected _processCandles(msg: any): void;
    /**
   * Processes a level 2 snapshot message in the format:
      { table: 'spot/depth5',
        data: [{
            asks: [ ['0.02192', '1.204054', '3' ] ],
            bids: [ ['0.02191', '15.117671', '3' ] ],
            instrument_id: 'ETH-BTC',
            timestamp: '2019-07-15T16:54:42.301Z' } ] }
   */
    protected _processLevel2Snapshot(msg: any): void;
    /**
   * Processes a level 2 update message in one of two formats.
   * The first message received is the "partial" orderbook and contains
   * 200 records in it.
   *
    { table: 'spot/depth',
          action: 'partial',
          data:
            [ { instrument_id: 'ETH-BTC',
                asks: [Array],
                bids: [Array],
                timestamp: '2019-07-15T17:18:31.737Z',
                checksum: 723501244 } ] }
   *
   * Subsequent calls will include the updates stream for changes to
   * the order book:
   *
      { table: 'spot/depth',
      action: 'update',
      data:
        [ { instrument_id: 'ETH-BTC',
            asks: [Array],
            bids: [Array],
            timestamp: '2019-07-15T17:18:32.289Z',
            checksum: 680530848 } ] }
   */
    protected _processLevel2Update(msg: any): void;
    /**
   * Constructs a ticker from the datum in the format:
      { instrument_id: 'ETH-BTC',
        last: '0.02172',
        best_bid: '0.02172',
        best_ask: '0.02173',
        open_24h: '0.02254',
        high_24h: '0.02262',
        low_24h: '0.02051',
        base_volume_24h: '378400.064179',
        quote_volume_24h: '8226.4437921288',
        timestamp: '2019-07-15T16:10:40.193Z' }
   */
    protected _constructTicker(data: any, market: any): Ticker;
    /**
   * Constructs a trade from the message datum in format:
    { instrument_id: 'ETH-BTC',
      price: '0.02182',
      side: 'sell',
      size: '0.94',
      timestamp: '2019-07-15T16:38:02.169Z',
      trade_id: '776370532' }
    */
    protected _constructTrade(datum: any, market: any): Trade;
    /**
   * Constructs a candle for the market
      {
        "candle": [
          "2020-08-10T20:42:00.000Z",
          "0.03332",
          "0.03332",
          "0.03331",
          "0.03332",
          "44.058532"
        ],
        "instrument_id": "ETH-BTC"
      }
   * @param {*} datum
   */
    protected _constructCandle(datum: any): Candle;
    /**
   * Constructs a snapshot message from the datum in a
   * snapshot message data property. Datum in the format:
   *
      { instrument_id: 'ETH-BTC',
        asks: [ ['0.02192', '1.204054', '3' ] ],
        bids: [ ['0.02191', '15.117671', '3' ] ],
        timestamp: '2019-07-15T16:54:42.301Z' }
   *
   * The snapshot may also come from an update, in which case we need
   * to include the checksum
   *
      { instrument_id: 'ETH-BTC',
        asks: [ ['0.02192', '1.204054', '3' ] ],
        bids: [ ['0.02191', '15.117671', '3' ] ],
        timestamp: '2019-07-15T17:18:31.737Z',
        checksum: 723501244 }

   */
    protected _constructLevel2Snapshot(datum: any, market: any): Level2Snapshot;
    /**
   * Constructs an update message from the datum in the update
   * stream. Datum is in the format:
    { instrument_id: 'ETH-BTC',
      asks: [ ['0.02192', '1.204054', '3' ] ],
      bids: [ ['0.02191', '15.117671', '3' ] ],
      timestamp: '2019-07-15T17:18:32.289Z',
      checksum: 680530848 }
   */
    _constructLevel2Update(datum: any, market: any): Level2Update;
}
