import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
import { CancelableFn } from "../flowcontrol/Fn";
import { Level2Update } from "../Level2Update";
import { Market } from "../Market";
import { Ticker } from "../Ticker";
import { Trade } from "../Trade";
export declare class BithumbClient extends BasicClient {
    remoteIdMap: Map<string, string>;
    restThrottleMs: number;
    protected _restL2SnapshotPath: string;
    protected _requestLevel2Snapshot: CancelableFn;
    protected _sendSubTicker: (...args: any[]) => any;
    protected _sendSubCandles: (...args: any[]) => any;
    protected _sendUnsubCandles: (...args: any[]) => any;
    protected _sendSubTrades: (...args: any[]) => any;
    protected _sendSubLevel2Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel2Snapshots: (...args: any[]) => any;
    protected _sendSubLevel2Updates: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    constructor({ wssPath, watcherMs }?: ClientOptions);
    protected __sendSubTicker(): void;
    protected _sendUnsubTicker(): void;
    protected __sendSubTrades(): void;
    protected _sendUnsubTrades(): void;
    protected __sendSubLevel2Updates(): void;
    protected _sendUnsubLevel2Updates(): void;
    protected _onMessage(raw: string): void;
    /**
    {
      "type":"ticker",
      "content":{
        "tickType":"24H",
        "date":"20200814",
        "time":"063809",
        "openPrice":"13637000",
        "closePrice":"13714000",
        "lowPrice":"13360000",
        "highPrice":"13779000",
        "value":"63252021221.2101",
        "volume":"4647.44384349",
        "sellVolume":"2372.30829641",
        "buyVolume":"2275.03363265",
        "prevClosePrice":"13601000",
        "chgRate":"0.56",
        "chgAmt":"77000",
        "volumePower":"95.89",
        "symbol":"BTC_KRW"
      }
    }
   */
    protected _constructTicker(data: any, market: Market): Ticker;
    /**
   {
     "type":"transaction",
     "content":
     {
       "list":
       [
         {
          "buySellGb":"1",
          "contPrice":"485900",
          "contQty":"0.196",
          "contAmt":"95236.400",
          "contDtm":"2020-08-14 06:28:41.621909",
          "updn":"dn",
          "symbol":"ETH_KRW"
        },
        {
          "buySellGb":"2",
          "contPrice":"486400",
          "contQty":"5.4277",
          "contAmt":"2640033.2800",
          "contDtm":"2020-08-14 06:28:42.453539",
          "updn":"up",
          "symbol":"ETH_KRW"
        }
      ]
    }
  }
   */
    protected _constructTrade(datum: any, market: Market): Trade;
    /**
   {
      "type": "orderbookdepth",
      "content": {
        "list": [
          {
            "symbol": "BTC_KRW",
            "orderType": "ask",
            "price": "13811000",
            "quantity": "0",
            "total": "0"
          },
          {
            "symbol": "BTC_KRW",
            "orderType": "ask",
            "price": "13733000",
            "quantity": "0.0213",
            "total": "1"
          },
          {
            "symbol": "BTC_KRW",
            "orderType": "bid",
            "price": "6558000",
            "quantity": "0",
            "total": "0"
          },
          {
            "symbol": "BTC_KRW",
            "orderType": "bid",
            "price": "13728000",
            "quantity": "0.0185",
            "total": "1"
          }
        ],
        "datetime": "1597355189967132"
      }
    }
   */
    protected _constructL2Update(msg: any, market: any): Level2Update;
    protected __requestLevel2Snapshot(market: Market): Promise<void>;
}
