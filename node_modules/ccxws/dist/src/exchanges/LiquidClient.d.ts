/// <reference types="node" />
import { BasicClient } from "../BasicClient";
import { ClientOptions } from "../ClientOptions";
export declare type LiquidClientOptions = ClientOptions & {
    autoloadSymbolMaps?: boolean;
    requestSnapshot?: boolean;
};
/**
 * Liquid client as implemented by:
 * https://developers.liquid.com/#public-channels
 */
export declare class LiquidClient extends BasicClient {
    requestSnapshot: boolean;
    protected productIdMap: Map<string, string>;
    protected _pingInterval: NodeJS.Timeout;
    constructor({ wssPath, autoloadSymbolMaps, requestSnapshot, watcherMs, }?: LiquidClientOptions);
    protected _beforeConnect(): void;
    protected _startPing(): void;
    protected _stopPing(): void;
    protected _sendPing(): void;
    /**
   * Liquid endpoints brilliantly/s require you to include the product id
   * in addition to the market symbol. So we need a way to reference this.
   * Results from the products API look like:
   * {
      "id": 5,
      "product_type": "CurrencyPair",
      "code": "CASH",
      "name": "CASH Trading",
      "market_ask": "48203.05",
      "market_bid": "48188.15",
      "indicator": -1,
      "currency": "JPY",
      "currency_pair_code": "BTCJPY",
      "symbol": "¥",
      "fiat_minimum_withdraw": "1500.0",
      "pusher_channel": "product_cash_btcjpy_5",
      "taker_fee": "0.0",
      "maker_fee": "0.0",
      "low_market_bid": "47630.99",
      "high_market_ask": "48396.71",
      "volume_24h": "2915.627366519999999998",
      "last_price_24h": "48217.2",
      "last_traded_price": "48203.05",
      "last_traded_quantity": "1.0",
      "quoted_currency": "JPY",
      "base_currency": "BTC",
      "exchange_rate": "0.009398151671149725",
      "timestamp": "1576739219.195353100"
    },
   */
    protected loadSymbolMaps(): Promise<void>;
    protected _sendSubTicker(remote_id: string): void;
    protected _sendUnsubTicker(remote_id: string): void;
    protected _sendSubTrades(remote_id: string): void;
    protected _sendUnsubTrades(remote_id: string): void;
    protected _sendSubLevel2Updates(remote_id: string): void;
    protected _sendUnsubLevel2Updates(remote_id: string): void;
    protected _sendSubCandles: (...args: any[]) => any;
    protected _sendUnsubCandles: (...args: any[]) => any;
    protected _sendSubLevel2Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel2Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Snapshots: (...args: any[]) => any;
    protected _sendUnsubLevel3Snapshots: (...args: any[]) => any;
    protected _sendSubLevel3Updates: (...args: any[]) => any;
    protected _sendUnsubLevel3Updates: (...args: any[]) => any;
    protected _onMessage(raw: string): void;
    /**
     * Ticker message in the format:
     * {
     *   channel: 'product_cash_btcjpy_5',
     *   data: '{"base_currency":"BTC","btc_minimum_withdraw":null,"cfd_enabled":false,"code":"CASH","currency":"JPY","currency_pair_code":"BTCJPY","disabled":false,"fiat_minimum_withdraw":null,"high_market_ask":"772267.0","id":"5","indicator":-1,"last_event_timestamp":"1587066660.016599696","last_price_24h":"725777.0","last_traded_price":"764242.0","last_traded_quantity":"0.05805448","low_market_bid":"698763.0","margin_enabled":false,"market_ask":"764291.0","market_bid":"764242.0","name":" CASH Trading","perpetual_enabled":false,"product_type":"CurrencyPair","pusher_channel":"product_cash_btcjpy_5","quoted_currency":"JPY","symbol":"¥","tick_size":"1.0","timestamp":"1587066660.016599696","volume_24h":"20739.2916905799999999"}',
     *   event: 'updated'
     * }
     */
    protected _onTicker(msg: any): void;
    /**
     * Trade message in the format:
     * {
     *   channel: 'executions_cash_btcjpy',
     *   data: '{"created_at":1587056568,"id":297058474,"price":757584.0,"quantity":0.178,"taker_side":"sell"}',
     *   event: 'created'
     * }
     */
    protected _onTrade(msg: any): void;
    /**
   * {
        channel: 'price_ladders_cash_btcjpy_buy',
        data: '[["755089.00000","0.03319269"],["755087.00000","0.00593314"],["755068.00000","0.00150000"],["755060.00000","0.00100000"],["755059.00000","0.03244832"],["755050.00000","0.03244969"],["755044.00000","0.47500000"],["754978.00000","0.47500000"],["754941.00000","0.00100000"],["754929.00000","0.00100000"],["754913.00000","0.05409938"],["754891.00000","0.37872763"],["754890.00000","0.03974826"],["754869.00000","0.04059000"],["754850.00000","0.05000000"],["754835.00000","0.03300000"],["754834.00000","0.25000000"],["754776.00000","0.03000000"],["754738.00000","0.00960000"],["754715.00000","0.00500000"],["754713.00000","0.05000000"],["754701.00000","0.03244949"],["754698.00000","0.00100000"],["754695.00000","0.03245118"],["754685.00000","0.48000000"],["754674.00000","0.00900000"],["754625.00000","0.50000013"],["754611.00000","0.10000000"],["754604.00000","0.05000000"],["754602.00000","0.05000000"],["754601.00000","0.03000000"],["754593.00000","0.01000000"],["754581.00000","0.01000000"],["754578.00000","0.01020000"],["754479.00000","0.01840000"],["754469.00000","1.00000013"],["754401.00000","0.02500000"],["754400.00000","0.01000000"],["754398.00000","0.03000000"],["754390.00000","0.25000000"]]',
        event: 'updated'
      }
   */
    protected _onOrderBook(msg: any): void;
}
