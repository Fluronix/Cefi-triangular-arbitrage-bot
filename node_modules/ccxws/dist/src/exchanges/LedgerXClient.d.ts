import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { Trade } from "../Trade";
import { Level3Update } from "../Level3Update";
export declare type LedgerXClientOptions = ClientOptions & {
    apiKey?: string;
};
/**
 * LedgerX is defined in https://docs.ledgerx.com/reference#connecting
 * This socket uses a unified stream for ALL market data. So we will leverage
 * subscription filtering to only reply with values that of are of interest.
 */
export declare class LedgerXClient extends BasicClient {
    runId: number;
    apiKey: string;
    constructor({ wssPath, apiKey, watcherMs, }?: LedgerXClientOptions);
    protected _sendSubTrades(): void;
    protected _sendUnsubTrades(): void;
    protected _sendSubLevel3Updates(remote_id: any, market: any): void;
    protected _sendUnSubLevel3Updates(): void;
    protected _sendSubTicker: (...args: any[]) => any;
    protected _sendSubCandles: (...args: any[]) => any;
    protected _sendUnsubCandles: (...args: any[]) => any;
    protected _sendUnsubTicker: (...args: any[]) => any;
    protected _sendSubLevel2Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel2Snapshots: (...args: any[]) => any;
    protected _sendSubLevel2Updates: (...args: any[]) => any;
    protected _sendUnsubLevel2Updates: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    protected _onMessage(msg: string): void;
    /**
     * Obtains the orderbook via REST
     */
    protected _requestLevel3Snapshot(market: any): Promise<void>;
    /**
   {
      mid: 'f4c34b09de0b4064a33b7b46f8180022',
      filled_size: 5,
      size: 0,
      inserted_price: 0,
      updated_time: 1597173352257155800,
      inserted_size: 0,
      timestamp: 1597173352257176800,
      ticks: 78678024531551,
      price: 0,
      original_price: 16000,
      status_type: 201,
      order_type: 'customer_limit_order',
      status_reason: 52,
      filled_price: 16000,
      is_volatile: false,
      clock: 24823,
      vwap: 16000,
      is_ask: false,
      inserted_time: 1597173352257155800,
      type: 'action_report',
      original_size: 5,
      contract_id: 22204639
    }
    {
      mid: '885be81549974faf88e4430f6046513d',
      filled_size: 5,
      size: 0,
      inserted_price: 0,
      updated_time: 1597164994095326700,
      inserted_size: 0,
      timestamp: 1597173352258250800,
      ticks: 78678025605522,
      price: 0,
      original_price: 16000,
      status_type: 201,
      order_type: 'customer_limit_order',
      status_reason: 0,
      filled_price: 16000,
      is_volatile: false,
      clock: 24824,
      vwap: 16000,
      is_ask: true,
      inserted_time: 1597164994095326700,
      type: 'action_report',
      original_size: 10,
      contract_id: 22204639
    }
   */
    protected _constructTrade(msg: any, market: any): Trade;
    /**
   * 200 - A resting limit order of size inserted_size @ price
   * inserted_price was inserted into book depth.
   {
      inserted_time: 1597176131501325800,
      timestamp: 1597176131501343700,
      filled_size: 0,
      ticks: 81457268698527,
      size: 1000,
      contract_id: 22202469,
      filled_price: 0,
      inserted_price: 165100,
      inserted_size: 1000,
      vwap: 0,
      is_volatile: true,
      mid: 'eecd8297c1dc42f1985f67c909540631',
      original_price: 165100,
      order_type: 'customer_limit_order',
      updated_time: 1597176131501325800,
      original_size: 1000,
      status_type: 200,
      status_reason: 0,
      type: 'action_report',
      price: 165100,
      clock: 260,
      is_ask: false
    }
   */
    protected _constructL3Insert(msg: any, market: any): Level3Update;
    /**
   * 201 - A cross of size filled_size @ price filled_price occurred.
   * Subtract filled_size from the resting size for this order.
  {
      mid: '885be81549974faf88e4430f6046513d',
      filled_size: 5,
      size: 0,
      inserted_price: 0,
      updated_time: 1597164994095326700,
      inserted_size: 0,
      timestamp: 1597173352258250800,
      ticks: 78678025605522,
      price: 0,
      original_price: 16000,
      status_type: 201,
      order_type: 'customer_limit_order',
      status_reason: 0,
      filled_price: 16000,
      is_volatile: false,
      clock: 24824,
      vwap: 16000,
      is_ask: true,
      inserted_time: 1597164994095326700,
      type: 'action_report',
      original_size: 10,
      contract_id: 22204639
    }
  */
    protected _constructL3Trade(msg: any, market: any): Level3Update;
    /**
   * 203 - An order was cancelled. Remove this order from book depth.
   {
      inserted_time: 1597176853952381700,
      timestamp: 1597176857137740800,
      filled_size: 0,
      ticks: 82182905095242,
      size: 0,
      contract_id: 22204631,
      filled_price: 0,
      inserted_price: 0,
      inserted_size: 0,
      vwap: 0,
      is_volatile: true,
      mid: 'b623fdd6fae14fcbbcb9ab3b6b9b3771',
      original_price: 51300,
      order_type: 'customer_limit_order',
      updated_time: 1597176853952381700,
      original_size: 1,
      status_type: 203,
      status_reason: 0,
      type: 'action_report',
      price: 0,
      clock: 506,
      is_ask: false
    }
   */
    protected _constructL3Cancel(msg: any, market: any): Level3Update;
    /**
   * 204 - An order was cancelled and replaced. The new order retains the
   * existing mid, and can only reflect an update in size and not price.
   * Overwrite the resting order size with inserted_size.
   *
   {
    "status_type": 204,
    "inserted_size": 12,
    "original_price": 59000,
    "open_interest": 121,
    "filled_size": 0,
    "updated_time": 1623074768372895949,
    "clock": 40011,
    "size": 12,
    "timestamp": 1623074768372897897,
    "status_reason": 0,
    "vwap": 0,
    "inserted_time": 1623074764668677182,
    "price": 59000,
    "type": "action_report",
    "is_ask": true,
    "original_size": 12,
    "order_type": "customer_limit_order",
    "is_volatile": true,
    "ticks": 25980094140252686,
    "filled_price": 0,
    "mid": "c071baaa458a411db184cb6874e86d69",
    "inserted_price": 59000,
    "contract_id": 22216779
  }
   */
    protected _constructL3Replace(msg: any, market: any): Level3Update;
}
