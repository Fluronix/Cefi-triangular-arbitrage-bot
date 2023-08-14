import semaphore = require("semaphore");
import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { Market } from "../Market";
/**
 * BistampClient v2 no longer uses Pusher. We can leverage the
 * BasicClient now instead of performing custom actions.
 *
 * Documentation for Version 2
 * https://www.bitstamp.net/websocket/v2/
 */
export declare class BitstampClient extends BasicClient {
    requestSnapshot: boolean;
    REST_REQUEST_DELAY_MS: number;
    protected _restSem: semaphore.Semaphore;
    protected _sendSubTicker: (...args: any[]) => any;
    protected _sendSubCandles: (...args: any[]) => any;
    protected _sendUnsubCandles: (...args: any[]) => any;
    protected _sendUnsubTicker: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    constructor({ wssPath, watcherMs }?: ClientOptions);
    protected _sendSubTrades(remote_id: any): void;
    protected _sendUnsubTrades(remote_id: any): void;
    protected _sendSubLevel2Snapshots(remote_id: any): void;
    protected _sendUnsubLevel2Snapshots(remote_id: any): void;
    protected _sendSubLevel2Updates(remote_id: any): void;
    protected _sendUnsubLevel2Updates(remote_id: any): void;
    protected _onMessage(raw: any): void;
    /**
   Process trade events
    {
      "data": {
        "microtimestamp": "1560180218394137",
        "amount": 0.0063150000000000003,
        "buy_order_id": 3486145418,
        "sell_order_id": 3486144483,
        "amount_str": "0.00631500",
        "price_str": "7917.13",
        "timestamp": "1560180218",
        "price": 7917.1300000000001,
        "type": 0,
        "id": 90350862
      },
      "event": "trade",
      "channel": "live_trades_btcusd"
    }

   */
    protected _onTrade(msg: any): void;
    /**
    Process level2 snapshot message
    {
      "data": {
        "timestamp": "1560181957",
        "microtimestamp": "1560181957623999",
        "bids": [
          ["7929.20", "1.10000000"],
          ["7927.07", "1.14028647"],
          ["7926.92", "0.02000000"],
          ["7926.31", "3.35799775"],
          ["7926.30", "0.10000000"]
        ],
        "asks": [
          ["7936.73", "0.50000000"],
          ["7937.10", "1.00000000"],
          ["7937.12", "0.02000000"],
          ["7937.13", "0.20101742"],
          ["7937.15", "0.06000000"]
        ]
      },
      "event": "data",
      "channel": "order_book_btcusd"
    }
   */
    protected _onLevel2Snapshot(msg: any): void;
    /**
    Process level2 update message

    {
      "data": {
        "timestamp": "1560182488",
        "microtimestamp": "1560182488522670",
        "bids": [
          ["7937.24", "0.00000000"],
          ["7937.10", "0.00000000"],
          ["7935.33", "3.14680000"],
          ["7935.01", "0.00000000"],
          ["7934.55", "0.00000000"]
        ],
        "asks": [
          ["7945.54", "0.10000000"],
          ["7945.64", "0.06000000"],
          ["7946.48", "4.00000000"],
          ["7947.75", "3.14700000"],
          ["7948.10", "0.00000000"]
        ]
      },
      "event": "data",
      "channel": "diff_order_book_btcusd"
    }
   */
    protected _onLevel2Update(msg: any): void;
    protected _requestLevel2Snapshots(): void;
    protected _requestLevel2Snapshot(market: Market): void;
}
