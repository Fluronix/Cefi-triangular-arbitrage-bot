"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoloniexClient = exports.OkexClient = exports.LiquidClient = exports.LedgerXClient = exports.KrakenClient = exports.KucoinClient = exports.HuobiKoreaClient = exports.HuobiJapanClient = exports.HuobiSwapsClient = exports.HuobiFuturesClient = exports.HuobiClient = exports.HitBtcClient = exports.GeminiClient = exports.GateioClient = exports.FtxUsClient = exports.FtxClient = exports.ErisXClient = exports.DigifinexClient = exports.DeribitClient = exports.CoinexClient = exports.CoinbaseProClient = exports.CexClient = exports.BittrexClient = exports.BitstampClient = exports.BitmexClient = exports.BithumbClient = exports.BitflyerClient = exports.BitfinexClient = exports.BinanceUsClient = exports.BinanceJeClient = exports.BinanceFuturesUsdtmClient = exports.BinanceFuturesCoinmClient = exports.BinanceClient = exports.BiboxClient = exports.Trade = exports.Ticker = exports.Level3Update = exports.Level3Snapshot = exports.Level3Point = exports.Level2Update = exports.Level2Snapshot = exports.Level2Point = exports.CandlePeriod = exports.Candle = exports.BlockTrade = exports.Auction = exports.Watcher = exports.SmartWss = exports.BasicMultiClient = exports.BasicClient = void 0;
exports.ZbClient = exports.UpbitClient = void 0;
const BasicClient_1 = require("./BasicClient");
Object.defineProperty(exports, "BasicClient", { enumerable: true, get: function () { return BasicClient_1.BasicClient; } });
const BasicMultiClient_1 = require("./BasicMultiClient");
Object.defineProperty(exports, "BasicMultiClient", { enumerable: true, get: function () { return BasicMultiClient_1.BasicMultiClient; } });
const SmartWss_1 = require("./SmartWss");
Object.defineProperty(exports, "SmartWss", { enumerable: true, get: function () { return SmartWss_1.SmartWss; } });
const Watcher_1 = require("./Watcher");
Object.defineProperty(exports, "Watcher", { enumerable: true, get: function () { return Watcher_1.Watcher; } });
const Auction_1 = require("./Auction");
Object.defineProperty(exports, "Auction", { enumerable: true, get: function () { return Auction_1.Auction; } });
const BlockTrade_1 = require("./BlockTrade");
Object.defineProperty(exports, "BlockTrade", { enumerable: true, get: function () { return BlockTrade_1.BlockTrade; } });
const Candle_1 = require("./Candle");
Object.defineProperty(exports, "Candle", { enumerable: true, get: function () { return Candle_1.Candle; } });
const CandlePeriod_1 = require("./CandlePeriod");
Object.defineProperty(exports, "CandlePeriod", { enumerable: true, get: function () { return CandlePeriod_1.CandlePeriod; } });
const Level2Point_1 = require("./Level2Point");
Object.defineProperty(exports, "Level2Point", { enumerable: true, get: function () { return Level2Point_1.Level2Point; } });
const Level2Snapshots_1 = require("./Level2Snapshots");
Object.defineProperty(exports, "Level2Snapshot", { enumerable: true, get: function () { return Level2Snapshots_1.Level2Snapshot; } });
const Level2Update_1 = require("./Level2Update");
Object.defineProperty(exports, "Level2Update", { enumerable: true, get: function () { return Level2Update_1.Level2Update; } });
const Level3Point_1 = require("./Level3Point");
Object.defineProperty(exports, "Level3Point", { enumerable: true, get: function () { return Level3Point_1.Level3Point; } });
const Level3Snapshot_1 = require("./Level3Snapshot");
Object.defineProperty(exports, "Level3Snapshot", { enumerable: true, get: function () { return Level3Snapshot_1.Level3Snapshot; } });
const Level3Update_1 = require("./Level3Update");
Object.defineProperty(exports, "Level3Update", { enumerable: true, get: function () { return Level3Update_1.Level3Update; } });
const Ticker_1 = require("./Ticker");
Object.defineProperty(exports, "Ticker", { enumerable: true, get: function () { return Ticker_1.Ticker; } });
const Trade_1 = require("./Trade");
Object.defineProperty(exports, "Trade", { enumerable: true, get: function () { return Trade_1.Trade; } });
const BiboxClient_1 = require("./exchanges/BiboxClient");
Object.defineProperty(exports, "BiboxClient", { enumerable: true, get: function () { return BiboxClient_1.BiboxClient; } });
const BinanceClient_1 = require("./exchanges/BinanceClient");
Object.defineProperty(exports, "BinanceClient", { enumerable: true, get: function () { return BinanceClient_1.BinanceClient; } });
const BinanceFuturesCoinmClient_1 = require("./exchanges/BinanceFuturesCoinmClient");
Object.defineProperty(exports, "BinanceFuturesCoinmClient", { enumerable: true, get: function () { return BinanceFuturesCoinmClient_1.BinanceFuturesCoinmClient; } });
const BinanceFuturesUsdtmClient_1 = require("./exchanges/BinanceFuturesUsdtmClient");
Object.defineProperty(exports, "BinanceFuturesUsdtmClient", { enumerable: true, get: function () { return BinanceFuturesUsdtmClient_1.BinanceFuturesUsdtmClient; } });
const BinanceJeClient_1 = require("./exchanges/BinanceJeClient");
Object.defineProperty(exports, "BinanceJeClient", { enumerable: true, get: function () { return BinanceJeClient_1.BinanceJeClient; } });
const BinanceUsClient_1 = require("./exchanges/BinanceUsClient");
Object.defineProperty(exports, "BinanceUsClient", { enumerable: true, get: function () { return BinanceUsClient_1.BinanceUsClient; } });
const BitfinexClient_1 = require("./exchanges/BitfinexClient");
Object.defineProperty(exports, "BitfinexClient", { enumerable: true, get: function () { return BitfinexClient_1.BitfinexClient; } });
const BitflyerClient_1 = require("./exchanges/BitflyerClient");
Object.defineProperty(exports, "BitflyerClient", { enumerable: true, get: function () { return BitflyerClient_1.BitflyerClient; } });
const BithumbClient_1 = require("./exchanges/BithumbClient");
Object.defineProperty(exports, "BithumbClient", { enumerable: true, get: function () { return BithumbClient_1.BithumbClient; } });
const BitmexClient_1 = require("./exchanges/BitmexClient");
Object.defineProperty(exports, "BitmexClient", { enumerable: true, get: function () { return BitmexClient_1.BitmexClient; } });
const BitstampClient_1 = require("./exchanges/BitstampClient");
Object.defineProperty(exports, "BitstampClient", { enumerable: true, get: function () { return BitstampClient_1.BitstampClient; } });
const BittrexClient_1 = require("./exchanges/BittrexClient");
Object.defineProperty(exports, "BittrexClient", { enumerable: true, get: function () { return BittrexClient_1.BittrexClient; } });
const CexClient_1 = require("./exchanges/CexClient");
Object.defineProperty(exports, "CexClient", { enumerable: true, get: function () { return CexClient_1.CexClient; } });
const CoinbaseProClient_1 = require("./exchanges/CoinbaseProClient");
Object.defineProperty(exports, "CoinbaseProClient", { enumerable: true, get: function () { return CoinbaseProClient_1.CoinbaseProClient; } });
const CoinexClient_1 = require("./exchanges/CoinexClient");
Object.defineProperty(exports, "CoinexClient", { enumerable: true, get: function () { return CoinexClient_1.CoinexClient; } });
const DeribitClient_1 = require("./exchanges/DeribitClient");
Object.defineProperty(exports, "DeribitClient", { enumerable: true, get: function () { return DeribitClient_1.DeribitClient; } });
const DigifinexClient_1 = require("./exchanges/DigifinexClient");
Object.defineProperty(exports, "DigifinexClient", { enumerable: true, get: function () { return DigifinexClient_1.DigifinexClient; } });
const ErisxClient_1 = require("./exchanges/ErisxClient");
Object.defineProperty(exports, "ErisXClient", { enumerable: true, get: function () { return ErisxClient_1.ErisXClient; } });
const FtxClient_1 = require("./exchanges/FtxClient");
Object.defineProperty(exports, "FtxClient", { enumerable: true, get: function () { return FtxClient_1.FtxClient; } });
const FtxUsClient_1 = require("./exchanges/FtxUsClient");
Object.defineProperty(exports, "FtxUsClient", { enumerable: true, get: function () { return FtxUsClient_1.FtxUsClient; } });
const GateioClient_1 = require("./exchanges/GateioClient");
Object.defineProperty(exports, "GateioClient", { enumerable: true, get: function () { return GateioClient_1.GateioClient; } });
const Geminiclient_1 = require("./exchanges/Geminiclient");
Object.defineProperty(exports, "GeminiClient", { enumerable: true, get: function () { return Geminiclient_1.GeminiClient; } });
const HitBtcClient_1 = require("./exchanges/HitBtcClient");
Object.defineProperty(exports, "HitBtcClient", { enumerable: true, get: function () { return HitBtcClient_1.HitBtcClient; } });
const HuobiClient_1 = require("./exchanges/HuobiClient");
Object.defineProperty(exports, "HuobiClient", { enumerable: true, get: function () { return HuobiClient_1.HuobiClient; } });
const HuobiFuturesClient_1 = require("./exchanges/HuobiFuturesClient");
Object.defineProperty(exports, "HuobiFuturesClient", { enumerable: true, get: function () { return HuobiFuturesClient_1.HuobiFuturesClient; } });
const HuobiJapanClient_1 = require("./exchanges/HuobiJapanClient");
Object.defineProperty(exports, "HuobiJapanClient", { enumerable: true, get: function () { return HuobiJapanClient_1.HuobiJapanClient; } });
const HuobiKoreaClient_1 = require("./exchanges/HuobiKoreaClient");
Object.defineProperty(exports, "HuobiKoreaClient", { enumerable: true, get: function () { return HuobiKoreaClient_1.HuobiKoreaClient; } });
const HuobiSwapsClient_1 = require("./exchanges/HuobiSwapsClient");
Object.defineProperty(exports, "HuobiSwapsClient", { enumerable: true, get: function () { return HuobiSwapsClient_1.HuobiSwapsClient; } });
const KrakenClient_1 = require("./exchanges/KrakenClient");
Object.defineProperty(exports, "KrakenClient", { enumerable: true, get: function () { return KrakenClient_1.KrakenClient; } });
const KucoinClient_1 = require("./exchanges/KucoinClient");
Object.defineProperty(exports, "KucoinClient", { enumerable: true, get: function () { return KucoinClient_1.KucoinClient; } });
const LedgerXClient_1 = require("./exchanges/LedgerXClient");
Object.defineProperty(exports, "LedgerXClient", { enumerable: true, get: function () { return LedgerXClient_1.LedgerXClient; } });
const LiquidClient_1 = require("./exchanges/LiquidClient");
Object.defineProperty(exports, "LiquidClient", { enumerable: true, get: function () { return LiquidClient_1.LiquidClient; } });
const OkexClient_1 = require("./exchanges/OkexClient");
Object.defineProperty(exports, "OkexClient", { enumerable: true, get: function () { return OkexClient_1.OkexClient; } });
const PoloniexClient_1 = require("./exchanges/PoloniexClient");
Object.defineProperty(exports, "PoloniexClient", { enumerable: true, get: function () { return PoloniexClient_1.PoloniexClient; } });
const UpbitClient_1 = require("./exchanges/UpbitClient");
Object.defineProperty(exports, "UpbitClient", { enumerable: true, get: function () { return UpbitClient_1.UpbitClient; } });
const ZbClient_1 = require("./exchanges/ZbClient");
Object.defineProperty(exports, "ZbClient", { enumerable: true, get: function () { return ZbClient_1.ZbClient; } });
/**
 * @deprecated Use named imports instead of default import. Client
 * names have also changed and are now suffixed with `Client`. Deprecation
 * warning added in v0.46.0 and will be removed in a future version.
 */
exports.default = {
    Bibox: BiboxClient_1.BiboxClient,
    Binance: BinanceClient_1.BinanceClient,
    BinanceFuturesCoinM: BinanceFuturesCoinmClient_1.BinanceFuturesCoinmClient,
    BinanceFuturesUsdtM: BinanceFuturesUsdtmClient_1.BinanceFuturesUsdtmClient,
    BinanceJe: BinanceJeClient_1.BinanceJeClient,
    BinanceUs: BinanceUsClient_1.BinanceUsClient,
    Bitfinex: BitfinexClient_1.BitfinexClient,
    Bitflyer: BitflyerClient_1.BitflyerClient,
    Bithumb: BithumbClient_1.BithumbClient,
    BitMEX: BitmexClient_1.BitmexClient,
    Bitstamp: BitstampClient_1.BitstampClient,
    Bittrex: BittrexClient_1.BittrexClient,
    Cex: CexClient_1.CexClient,
    CoinbasePro: CoinbaseProClient_1.CoinbaseProClient,
    Coinex: CoinexClient_1.CoinexClient,
    Deribit: DeribitClient_1.DeribitClient,
    Digifinex: DigifinexClient_1.DigifinexClient,
    ErisX: ErisxClient_1.ErisXClient,
    Ftx: FtxClient_1.FtxClient,
    FtxUs: FtxUsClient_1.FtxUsClient,
    Gateio: GateioClient_1.GateioClient,
    Gemini: Geminiclient_1.GeminiClient,
    HitBTC: HitBtcClient_1.HitBtcClient,
    Huobi: HuobiClient_1.HuobiClient,
    HuobiFutures: HuobiFuturesClient_1.HuobiFuturesClient,
    HuobiSwaps: HuobiSwapsClient_1.HuobiSwapsClient,
    HuobiJapan: HuobiJapanClient_1.HuobiJapanClient,
    HuobiKorea: HuobiKoreaClient_1.HuobiKoreaClient,
    Kucoin: KucoinClient_1.KucoinClient,
    Kraken: KrakenClient_1.KrakenClient,
    LedgerX: LedgerXClient_1.LedgerXClient,
    Liquid: LiquidClient_1.LiquidClient,
    OKEx: OkexClient_1.OkexClient,
    Poloniex: PoloniexClient_1.PoloniexClient,
    Upbit: UpbitClient_1.UpbitClient,
    Zb: ZbClient_1.ZbClient,
};
//# sourceMappingURL=index.js.map