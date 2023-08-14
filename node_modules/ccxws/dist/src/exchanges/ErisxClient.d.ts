import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { Level2Snapshot } from "../Level2Snapshots";
import { Level3Snapshot } from "../Level3Snapshot";
import { Level3Update } from "../Level3Update";
import { Trade } from "../Trade";
export declare type ErisXClientOptions = ClientOptions & {
    apiKey?: string;
    apiSecret?: string;
    l2depth?: number;
};
/**
 * ErisX has limited market data and presently only supports trades and
 * level3 order books. It requires authenticating with a token to view
 * the market data, which is performed on initial connection. ErisX also
 * requires a unique "correlationId" for each request sent to the server.
 * Requests are limited to 40 per second.
 */
export declare class ErisXClient extends BasicClient {
    apiKey: string;
    apiSecret: string;
    l2depth: number;
    protected _messageId: number;
    constructor({ wssPath, watcherMs, apiKey, apiSecret, l2depth, }?: ErisXClientOptions);
    fetchSecurities(): void;
    protected _onConnected(): void;
    protected _sendAuthentication(): void;
    protected _nextId(): string;
    protected _createToken(): string;
    protected _sendSubTrades(remote_id: any): void;
    protected _sendUnsubTrades(remote_id: any): void;
    protected _sendSubLevel2Snapshots(remote_id: any): void;
    protected _sendUnsubLevel2Snapshots(remote_id: any): void;
    protected _sendSubLevel3Updates(remote_id: any): void;
    protected _sendUnsubLevel3Snapshots(remote_id: any): void;
    protected _sendSubTicker: (...args: any[]) => any;
    protected _sendSubCandles: (...args: any[]) => any;
    protected _sendUnsubCandles: (...args: any[]) => any;
    protected _sendUnsubTicker: (...args: any[]) => any;
    protected _sendSubLevel2Updates: (...args: any[]) => any;
    protected _sendUnsubLevel2Updates: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    protected _onMessage(raw: any): void;
    /**
   {
      "correlation": "15978410832102",
      "type": "MarketDataIncrementalRefreshTrade",
      "symbol": "LTC/USD",
      "sendingTime": "20200819-12:44:50.896",
      "trades": [{
        "updateAction": "NEW",
        "price": 64.2,
        "currency": "LTC",
        "tickerType": "PAID",
        "transactTime": "20200819-12:44:50.872994129",
        "size": 2.0,
        "symbol": "LTC/USD",
        "numberOfOrders": 1
      }],
      "endFlag":  "END_OF_TRADE"
    }
   */
    protected _constructTrades(msg: any, market: any): any;
    /**
   {
      "updateAction": "NEW",
      "price": 64.2,
      "currency": "LTC",
      "tickerType": "PAID",
      "transactTime": "20200819-12:44:50.872994129",
      "size": 2.0,
      "symbol": "LTC/USD",
      "numberOfOrders": 1
   }
   */
    protected _constructTrade(msg: any, market: any): Trade;
    /**
   {
    "correlation": "15978412650812",
    "type": "TopOfBookMarketData",
    "bids": [
        {
            "action": "NEW",
            "count": 1,
            "totalVolume": 1.0,
            "price": 413.2,
            "lastUpdate": "20200819-12:47:49.975"
        },
        {
            "action": "UPDATE",
            "count": 2,
            "totalVolume": 2.00,
            "price": 412.9,
            "lastUpdate": "20200819-12:47:39.984"
        }
    ],
    "offers": [
        {
            "action": "NO CHANGE",
            "count": 1,
            "totalVolume": 1.00,
            "price": 413.3,
            "lastUpdate": "20200819-12:47:40.166"
        },
        {
            "action": "NO CHANGE",
            "count": 1,
            "totalVolume": 1.56,
            "price": 413.4,
            "lastUpdate": "20200819-12:47:20.196"
        }
    ],
    "symbol": "ETH/USD"
    }
   */
    protected _constructLevel2Snapshot(msg: any, market: any): Level2Snapshot;
    /**
   {
      "correlation": "4",
      "type": "MarketDataIncrementalRefresh",
      "symbol": "BTC/USD",
      "sendingTime": "20201007-17:37:40.588",
      "bids": [
          {
              "id": "1000000fd05b8",
              "updateAction": "NEW",
              "price": 10632.2,
              "amount": 1.6,
              "symbol": "BTC/USD"
          },
          {
              "id": "1000000fd05a0",
              "updateAction": "NEW",
              "price": 10629.4,
              "amount": 1.6,
              "symbol": "BTC/USD"
          },
          {
              "id": "1000000fc7402",
              "updateAction": "NEW",
              "price": 10623.4,
              "amount": 0.99,
              "symbol": "BTC/USD"
          }
      ],
      "offers": [
          {
              "id": "1000000fd0522",
              "updateAction": "NEW",
              "price": 10633.5,
              "amount": 1.6,
              "symbol": "BTC/USD"
          },
          {
              "id": "1000000fd05b7",
              "updateAction": "NEW",
              "price": 10637,
              "amount": 1.6,
              "symbol": "BTC/USD"
          },
          {
              "id": "1000000fc7403",
              "updateAction": "NEW",
              "price": 10638.4,
              "amount": 0.99,
              "symbol": "BTC/USD"
          }
      ],
      "transactTime": "20201007-17:37:40.587917127",
      "endFlag": null
    }
   */
    protected _constructLevel3Snapshot(msg: any, market: any): Level3Snapshot;
    /**
   {
      "correlation": "4",
      "type": "MarketDataIncrementalRefresh",
      "symbol": "BTC/USD",
      "sendingTime": "20201007-17:37:42.931",
      "bids": [
          {
              "id": "1000000fc7402",
              "updateAction": "NEW",
              "price": 10625,
              "amount": 0.99,
              "symbol": "BTC/USD"
          }
      ],
      "offers": [],
      "transactTime": "20201007-17:37:42.930970367",
      "endFlag": "END_OF_EVENT"
    }
   */
    protected _constructLevel3Update(msg: any, market: any): Level3Update;
}
