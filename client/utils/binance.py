import json
import requests
from utils import bot_function as bot_func
from binance.spot import Spot as Binance
from datetime import datetime, timedelta
import sys,logging
import ccxt
import time
import os
import colorama
from colorama import Back, Fore, Style
colorama.init(autoreset=True)
os.system("")


logging.basicConfig(filename='event.log', encoding='utf-8', format='%(asctime)s - %(message)s')

"""
    Binance api url: https://api.binance.com/
    Binance wss url: wss://stream.binance.com:9443
"""

# API Fetcher function
def fetch_tickers(url, keys):
    try:
        binance_client = Binance(keys['key'], keys['secret'])
        trade_fee = binance_client.trade_fee()
        exchangeInfo = requests.get('https://api.binance.com/api/v3/exchangeInfo').text
        exchangeInfo = json.loads(exchangeInfo)['symbols']

        ticker_dict = {}
        req = requests.get(url)
        req = json.loads(req.text)

        for ticker in req:
            symbol = ticker['symbol']
            ticker_dict[symbol] = ticker

        for fee in trade_fee:
            ticker_dict[fee['symbol']
            ]['makerCommission'] = fee['makerCommission']
            ticker_dict[fee['symbol']
            ]['takerCommission'] = fee['takerCommission']

        for symbol in exchangeInfo:
            # baseAssetPrecision = symbol['baseAssetPrecision']
            # quotePrecision = symbol['quotePrecision']
            # ticker_dict[symbol['symbol']]['baseAssetPrecision'] = baseAssetPrecision
            # ticker_dict[symbol['symbol']]['quotePrecision'] = quotePrecision

            # print(symbol)
            try:
                step_size = symbol['filters'][2]['stepSize']
            except:
                step_size = symbol['filters'][1]['stepSize']

            ticker_dict[symbol['symbol']]['stepSize'] = step_size
            # print(step_size, symbol['symbol'])

        return ticker_dict

    except Exception as err:
        logging.warning(f"Unable to fetch Binance tickers. Error = {err}")
        print(Fore.RED+ "Unable to fetch Binance tickers. Error = ", err)
        input(Back.RED + "Hit enter to exit: ")
        sys.exit()


# Use the wss json to update the http json tickers
def update_tickers():
    binance_http_tickers_json = json.loads(bot_func.open_file("./utils/binance_http_tickers.json"))
    for retry in range(200):
        try:
            binance_wss_tickers_json = json.loads(
                bot_func.open_file("./utils/binance_wss_tickers.json"))
            break
        except:
            continue

    last_wss_mes_time = binance_wss_tickers_json['dateTime']

    # convert datetime from str to datetime type
    last_wss_mes_time = datetime.strptime(last_wss_mes_time, '%Y-%m-%d %H:%M:%S')
    # return False if they is no wss message received in 60 seconds

    if last_wss_mes_time + timedelta(seconds=60) < datetime.now():
        print(Fore.GREEN+ "Last stream datetime:", last_wss_mes_time,
              Fore.GREEN+ "Current datetime:", datetime.now())
        return False

    for message in binance_wss_tickers_json['tickers']:
        tickers = {
            'EventType': message['e'],
            'EventTime': message['E'],
            "Symbol": message['s'],
            'PriceChange': message['p'],
            'PriceChangePercent': message['P'],
            'WeightedAveragePrice': message['w'],
            'FirstTrade': message['x'],
            'LastPrice': message['c'],
            'LastQuantity': message['Q'],
            'BestBidPrice': message['b'],
            'BestBidQuantity': message['B'],
            'BestAskPrice': message['a'],
            'BestAskQuantity': message['A'],
            'OpenPrice': message['o'],
            'HighPrice': message['h'],
            'LowPrice': message['l'],
            'TotalTradedBaseAsetVolume': message['v'],
            'TotalTradedQuoteAssetVolume': message['q'],
            'StatisticsOpenTime': message['O'],
            'StatisticsCloseTime': message['C'],
            'FirstTradeID': message['F'],
            'LastTradeId': message['L'],
            'TotalNumberOfTrade': message['n']
        }

        symbol = tickers["Symbol"]

        binance_http_tickers_json[symbol]['priceChange'] = tickers['PriceChange']
        binance_http_tickers_json[symbol]['priceChangePercent'] = tickers['PriceChangePercent']
        binance_http_tickers_json[symbol]['weightedAvgPrice'] = tickers['WeightedAveragePrice']
        binance_http_tickers_json[symbol]['LastPrice'] = tickers['LastPrice']
        binance_http_tickers_json[symbol]['lastQty'] = tickers['LastQuantity']
        binance_http_tickers_json[symbol]['bidPrice'] = tickers['BestBidPrice']
        binance_http_tickers_json[symbol]['bidQty'] = tickers['BestBidQuantity']
        binance_http_tickers_json[symbol]['askPrice'] = tickers['BestAskPrice']
        binance_http_tickers_json[symbol]['askQty'] = tickers['BestAskQuantity']
        binance_http_tickers_json[symbol]['openPrice'] = tickers['OpenPrice']
        binance_http_tickers_json[symbol]['highPrice'] = tickers['HighPrice']
        binance_http_tickers_json[symbol]['LowPrice'] = tickers['LowPrice']
        binance_http_tickers_json[symbol]['quoteVolume'] = tickers['TotalTradedQuoteAssetVolume']
        binance_http_tickers_json[symbol]['openTime'] = tickers['StatisticsOpenTime']
        binance_http_tickers_json[symbol]['closeTime'] = tickers['StatisticsCloseTime']
        binance_http_tickers_json[symbol]['firstId'] = tickers['FirstTradeID']
        binance_http_tickers_json[symbol]['lastId'] = tickers['LastTradeId']
        binance_http_tickers_json[symbol]['count'] = tickers['TotalNumberOfTrade']

    bot_func.save_file('./utils/binance_http_tickers.json', json.dumps(binance_http_tickers_json))


# Separate symbol. eg (from BTCUSDT to BTC/USDT) and return only tradeable symbols
def sep_symbol(tickers_json):  # (Internal)
    sep_symbols = []
    exchange_Info_url = "https://api.binance.com/api/v3/exchangeInfo"
    req = json.loads(requests.get(exchange_Info_url).text)

    for sym_key in tickers_json:
        joined_symbol = sym_key  # ticker['symbol']
        symbol_list = req['symbols']

        for i in range(len(symbol_list)):
            symbol_dict = symbol_list[i]
            if joined_symbol == symbol_dict['symbol']:
                base_quote = [symbol_dict['baseAsset'], symbol_dict['quoteAsset']]

                status = symbol_dict['status']
                isSpotTradingAllowed = symbol_dict["isSpotTradingAllowed"]

                if status == 'TRADING' and isSpotTradingAllowed:
                    symbol = base_quote[0] + "/" + base_quote[1]
                    sep_symbols.append(symbol)
    return sep_symbols


# Structure Arbitrage Triangular Pairs
def structure_triangular_pair(tickers_json):
    symbols_list = sep_symbol(tickers_json)
    # symbols_list = symbols_list[0:50]

    # Declare Variables
    triangular_pairs_list = [[str(datetime.now())], []]
    remove_duplicates_list = []

    # Get A pair
    for pair_a in symbols_list:
        pair_a_split = pair_a.split("/")
        a_base = pair_a_split[0]
        a_quote = pair_a_split[1]

        # Assign A to a Box
        a_pair_box = [a_base, a_quote]

        # Get Pair B
        for pair_b in symbols_list:
            pair_b_split = pair_b.split("/")
            b_base = pair_b_split[0]
            b_quote = pair_b_split[1]

            # Check Pair B
            if pair_b != pair_a:
                if b_base in a_pair_box or b_quote in a_pair_box:

                    # Get Pair C
                    for pair_c in symbols_list:
                        pair_c_split = pair_c.split("/")
                        c_base = pair_c_split[0]
                        c_quote = pair_c_split[1]

                        # Count the number of matching C items
                        if pair_c != pair_a and pair_c != pair_b:
                            combine_all = [pair_a, pair_b, pair_c]
                            pair_box = [a_base, a_quote, b_base,
                                        b_quote, c_base, c_quote]

                            counts_c_base = 0
                            for i in pair_box:
                                if i == c_base:
                                    counts_c_base += 1

                            counts_c_quote = 0
                            for i in pair_box:
                                if i == c_quote:
                                    counts_c_quote += 1

                            # Determining Triangular Match
                            if counts_c_base == 2 and counts_c_quote == 2 and c_base != c_quote:
                                combined = pair_a + "," + pair_b + "," + pair_c
                                unique_item = ''.join(sorted(combine_all))

                                if unique_item not in remove_duplicates_list:
                                    match_dict = {
                                        "a_base": a_base,
                                        "b_base": b_base,
                                        "c_base": c_base,
                                        "a_quote": a_quote,
                                        "b_quote": b_quote,
                                        "c_quote": c_quote,
                                        "pair_a": pair_a,
                                        "pair_b": pair_b,
                                        "pair_c": pair_c,
                                        "combined": combined
                                    }
                                    triangular_pairs_list[1].append(match_dict)
                                    remove_duplicates_list.append(unique_item)

    return triangular_pairs_list


# Extract Price Information for Given Pairs
def get_price_ABC_pairs(t_pair_dict, http_tickers_dict):
    # Extract Pair Info
    pair_a = t_pair_dict["pair_a"].replace("/", "")
    pair_b = t_pair_dict["pair_b"].replace("/", "")
    pair_c = t_pair_dict["pair_c"].replace("/", "")

    # get the price of each coin in pair_a for order volume calculation
    a_base = t_pair_dict["a_base"]
    a_quote = t_pair_dict["a_quote"]  # lastPrice

    a_base_usdt_price = 0
    a_base_busd_price = 0
    a_quote_usdt_price = 0
    a_quote_busd_price = 0
    try:
        if a_base != 'USDT' and a_base != 'BUSD':
            a_base_usdt_price = float(
                http_tickers_dict[a_base + 'USDT']["lastPrice"])
    except:
        None
    try:
        if a_base != 'BUSD' and a_base != 'USDT':
            a_base_busd_price = float(
                http_tickers_dict[a_base + 'BUSD']["lastPrice"])
    except:
        None
    try:
        if a_quote != 'USDT' and a_quote != 'BUSD':
            a_quote_usdt_price = float(
                http_tickers_dict[a_quote + 'USDT']["lastPrice"])
    except:
        None
    try:
        if a_quote != 'BUSD' and a_quote != 'USDT':
            a_quote_busd_price = float(
                http_tickers_dict[a_quote + 'BUSD']["lastPrice"])
    except:
        None

    # Extract Price Information for Given Pairs
    pair_a_ask = float(http_tickers_dict[pair_a]["askPrice"])
    pair_a_bid = float(http_tickers_dict[pair_a]["bidPrice"])
    pair_b_ask = float(http_tickers_dict[pair_b]["askPrice"])
    pair_b_bid = float(http_tickers_dict[pair_b]["bidPrice"])
    pair_c_ask = float(http_tickers_dict[pair_c]["askPrice"])
    pair_c_bid = float(http_tickers_dict[pair_c]["bidPrice"])

    # Output Dictionary
    return {
        "pair_a_ask": pair_a_ask,
        "pair_a_bid": pair_a_bid,
        "pair_b_ask": pair_b_ask,
        "pair_b_bid": pair_b_bid,
        "pair_c_ask": pair_c_ask,
        "pair_c_bid": pair_c_bid,
        "a_base_usdt_price": a_base_usdt_price,
        "a_base_busd_price": a_base_busd_price,
        "a_quote_usdt_price": a_quote_usdt_price,
        "a_quote_busd_price": a_quote_busd_price
    }


# Calculate Surface Rate Arbitrage Opportunity
def calc_arb_surface_rate(t_pair_dict, t_price_dict, starting_amount, threshold):
    # Set Variables
    surface_dict = {}
    contract_2 = ""
    contract_3 = ""
    direction_trade_1 = ""
    direction_trade_2 = ""
    direction_trade_3 = ""
    acquired_coin_t2 = 0
    acquired_coin_t3 = 0

    # Extract Pair Variables
    a_base = t_pair_dict["a_base"]
    a_quote = t_pair_dict["a_quote"]
    b_base = t_pair_dict["b_base"]
    b_quote = t_pair_dict["b_quote"]
    c_base = t_pair_dict["c_base"]
    c_quote = t_pair_dict["c_quote"]
    pair_a = t_pair_dict["pair_a"]
    pair_b = t_pair_dict["pair_b"]
    pair_c = t_pair_dict["pair_c"]

    # Extract Price Information
    a_ask = t_price_dict["pair_a_ask"]
    a_bid = t_price_dict["pair_a_bid"]
    b_ask = t_price_dict["pair_b_ask"]
    b_bid = t_price_dict["pair_b_bid"]
    c_ask = t_price_dict["pair_c_ask"]
    c_bid = t_price_dict["pair_c_bid"]
    a_base_usdt_price = t_price_dict["a_base_usdt_price"]
    a_base_busd_price = t_price_dict["a_base_busd_price"]
    a_quote_usdt_price = t_price_dict["a_quote_usdt_price"]
    a_quote_busd_price = t_price_dict["a_quote_busd_price"]

    # Set directions and loop through
    direction_list = ["forward", "reverse"]
    for direction in direction_list:

        # Set additional variables for swap information
        swap_1 = ""
        swap_2 = ""
        swap_3 = ""
        swap_1_rate = 0
        swap_2_rate = 0
        swap_3_rate = 0

        """
            Binance Rules !!
            If we are swapping the coin on the left (Base) to the right (Quote) then * Bid 
            If we are swapping the coin on the right (Quote) to the left (Base) then * (1 / Ask)
            (BTC/USDT)
        """
        # Assume starting with a_base and swapping for a_quote
        if direction == "forward":  # ------------------------------------------------------------------------------------FORWARD
            calculated = False
            swap_1 = a_base
            swap_2 = a_quote
            swap_1_rate = a_bid
            direction_trade_1 = "base_to_quote"
            starting_amount_in_asset = 0

            # convert starting_amount from USD value to swap_1 amount
            if a_base_usdt_price != 0:
                starting_amount_in_asset = starting_amount / a_base_usdt_price
            elif a_base_busd_price != 0:
                starting_amount_in_asset = starting_amount / a_base_busd_price
            elif swap_1 == 'USDT' or swap_1 == 'BUSD':
                starting_amount_in_asset = starting_amount
            else:
                # print(f"""Direction: {direction} -> {swap_1} in {pair_a} doesn't have a pair with USDT or BUSD for amount calculation.
                #  Don't worry your bot will trade the other direction.""")
                continue

            # Place first trade
            contract_1 = pair_a
            acquired_coin_t1 = starting_amount_in_asset * swap_1_rate

            # SCENARIO 1 Check if a_quote (acquired_coin) matches b_quote--------------------------||
            if a_quote == b_quote and calculated == False:
                swap_2_rate = 1 / b_ask
                acquired_coin_t2 = acquired_coin_t1 * swap_2_rate
                direction_trade_2 = "quote_to_base"
                contract_2 = pair_b

                # If b_base (acquired coin) matches c_base
                if b_base == c_base:
                    swap_3 = c_base
                    swap_3_rate = c_bid
                    direction_trade_3 = "base_to_quote"
                    contract_3 = pair_c

                # If b_base (acquired coin) matches c_quote
                if b_base == c_quote:
                    swap_3 = c_quote
                    swap_3_rate = 1 / c_ask
                    direction_trade_3 = "quote_to_base"
                    contract_3 = pair_c

                acquired_coin_t3 = acquired_coin_t2 * swap_3_rate
                calculated = True

            # SCENARIO 2 Check if a_quote (acquired_coin) matches b_base----------------------------||
            if a_quote == b_base and calculated == False:
                swap_2_rate = b_bid
                acquired_coin_t2 = acquired_coin_t1 * swap_2_rate
                direction_trade_2 = "base_to_quote"
                contract_2 = pair_b

                # If b_quote (acquired coin) matches c_base
                if b_quote == c_base:
                    swap_3 = c_base
                    swap_3_rate = c_bid
                    direction_trade_3 = "base_to_quote"
                    contract_3 = pair_c

                # If b_quote (acquired coin) matches c_quote
                if b_quote == c_quote:
                    swap_3 = c_quote
                    swap_3_rate = 1 / c_ask
                    direction_trade_3 = "quote_to_base"
                    contract_3 = pair_c

                acquired_coin_t3 = acquired_coin_t2 * swap_3_rate
                calculated = True

            # SCENARIO 3 Check if a_quote (acquired_coin) matches c_quote----------------------------||
            if a_quote == c_quote and calculated == False:
                swap_2_rate = 1 / c_ask
                acquired_coin_t2 = acquired_coin_t1 * swap_2_rate
                direction_trade_2 = "quote_to_base"
                contract_2 = pair_c

                # If c_base (acquired coin) matches b_base
                if c_base == b_base:
                    swap_3 = b_base
                    swap_3_rate = b_bid
                    direction_trade_3 = "base_to_quote"
                    contract_3 = pair_b

                # If c_base (acquired coin) matches b_quote
                if c_base == b_quote:
                    swap_3 = b_quote
                    swap_3_rate = 1 / b_ask
                    direction_trade_3 = "quote_to_base"
                    contract_3 = pair_b

                acquired_coin_t3 = acquired_coin_t2 * swap_3_rate
                calculated = True

            # SCENARIO 4 Check if a_quote (acquired_coin) matches c_base----------------------------||
            if a_quote == c_base and calculated == False:
                swap_2_rate = c_bid
                acquired_coin_t2 = acquired_coin_t1 * swap_2_rate
                direction_trade_2 = "base_to_quote"
                contract_2 = pair_c

                # If c_quote (acquired coin) matches b_base
                if c_quote == b_base:
                    swap_3 = b_base
                    swap_3_rate = b_bid
                    direction_trade_3 = "base_to_quote"
                    contract_3 = pair_b

                # If c_quote (acquired coin) matches b_quote
                if c_quote == b_quote:
                    swap_3 = b_quote
                    swap_3_rate = 1 / b_ask
                    direction_trade_3 = "quote_to_base"
                    contract_3 = pair_b

                acquired_coin_t3 = acquired_coin_t2 * swap_3_rate
                calculated = True

        elif direction == "reverse":  # ----------------------------------------------------------------------------------REVERSE
            calculated = False

            swap_1 = a_quote
            swap_2 = a_base
            swap_1_rate = 1 / a_ask
            direction_trade_1 = "quote_to_base"
            starting_amount_in_asset = 0

            # convert starting_amount from USD value to swap_1 amount
            if a_quote_usdt_price != 0:
                starting_amount_in_asset = starting_amount / a_quote_usdt_price
            elif a_quote_busd_price != 0:
                starting_amount_in_asset = starting_amount / a_quote_busd_price
            elif swap_1 == 'USDT' or swap_1 == 'BUSD':
                starting_amount_in_asset = starting_amount
            else:
                # print(f"""Direction: {direction} -> {swap_1} in {pair_a} doesn't have a pair with USDT or BUSD for amount calculation.
                #  Don't worry your bot will trade the other direction.""")
                continue

            # Place first trade
            contract_1 = pair_a
            acquired_coin_t1 = starting_amount_in_asset * swap_1_rate

            # SCENARIO 1 Check if a_base (acquired_coin) matches b_quote----------------------------||
            if a_base == b_quote and calculated == False:
                swap_2_rate = 1 / b_ask
                acquired_coin_t2 = acquired_coin_t1 * swap_2_rate
                direction_trade_2 = "quote_to_base"
                contract_2 = pair_b

                # If b_base (acquired coin) matches c_base
                if b_base == c_base:
                    swap_3 = c_base
                    swap_3_rate = c_bid
                    direction_trade_3 = "base_to_quote"
                    contract_3 = pair_c

                # If b_base (acquired coin) matches c_quote
                if b_base == c_quote:
                    swap_3 = c_quote
                    swap_3_rate = 1 / c_ask
                    direction_trade_3 = "quote_to_base"
                    contract_3 = pair_c

                acquired_coin_t3 = acquired_coin_t2 * swap_3_rate
                calculated = True

            # SCENARIO 2 Check if a_base (acquired_coin) matches b_base----------------------------||
            if a_base == b_base and calculated == False:
                swap_2_rate = b_bid
                acquired_coin_t2 = acquired_coin_t1 * swap_2_rate
                direction_trade_2 = "base_to_quote"
                contract_2 = pair_b

                # If b_quote (acquired coin) matches c_base
                if b_quote == c_base:
                    swap_3 = c_base
                    swap_3_rate = c_bid
                    direction_trade_3 = "base_to_quote"
                    contract_3 = pair_c

                # If b_quote (acquired coin) matches c_quote
                if b_quote == c_quote:
                    swap_3 = c_quote
                    swap_3_rate = 1 / c_ask
                    direction_trade_3 = "quote_to_base"
                    contract_3 = pair_c

                acquired_coin_t3 = acquired_coin_t2 * swap_3_rate
                calculated = True

            # SCENARIO 3 Check if a_base (acquired_coin) matches c_quote----------------------------||
            if a_base == c_quote and calculated == False:
                swap_2_rate = 1 / c_ask
                acquired_coin_t2 = acquired_coin_t1 * swap_2_rate
                direction_trade_2 = "quote_to_base"
                contract_2 = pair_c

                # If c_base (acquired coin) matches b_base
                if c_base == b_base:
                    swap_3 = b_base
                    swap_3_rate = b_bid
                    direction_trade_3 = "base_to_quote"
                    contract_3 = pair_b

                # If c_base (acquired coin) matches b_quote
                if c_base == b_quote:
                    swap_3 = b_quote
                    swap_3_rate = 1 / b_ask
                    direction_trade_3 = "quote_to_base"
                    contract_3 = pair_b

                acquired_coin_t3 = acquired_coin_t2 * swap_3_rate
                calculated = True

            # SCENARIO 4 Check if a_base (acquired_coin) matches c_base----------------------------||
            if a_base == c_base and calculated == False:
                swap_2_rate = c_bid
                acquired_coin_t2 = acquired_coin_t1 * swap_2_rate
                direction_trade_2 = "base_to_quote"
                contract_2 = pair_c

                # If c_quote (acquired coin) matches b_base
                if c_quote == b_base:
                    swap_3 = b_base
                    swap_3_rate = b_bid
                    direction_trade_3 = "base_to_quote"
                    contract_3 = pair_b

                # If c_quote (acquired coin) matches b_quote
                if c_quote == b_quote:
                    swap_3 = b_quote
                    swap_3_rate = 1 / b_ask
                    direction_trade_3 = "quote_to_base"
                    contract_3 = pair_b

                acquired_coin_t3 = acquired_coin_t2 * swap_3_rate
                calculated = True

        """ PROFIT LOSS OUTPUT """
        # Profit and Loss Calculations
        profit = acquired_coin_t3 - starting_amount_in_asset
        profit_perc = (profit / starting_amount_in_asset) * 100 if profit != 0 else 0

        # Trade Descriptions
        trade_description_1 = f"Start with {swap_1} of {starting_amount_in_asset}. Swap at {swap_1_rate} for {swap_2} acquiring {acquired_coin_t1}."
        trade_description_2 = f"Swap {acquired_coin_t1} of {swap_2} at {swap_2_rate} for {swap_3} acquiring {acquired_coin_t2}."
        trade_description_3 = f"Swap {acquired_coin_t2} of {swap_3} at {swap_3_rate} for {swap_1} acquiring {acquired_coin_t3}."

        if profit_perc > threshold:
            surface_dict = {
                "swap_1": swap_1,
                "swap_2": swap_2,
                "swap_3": swap_3,
                "contract_1": contract_1,
                "contract_2": contract_2,
                "contract_3": contract_3,
                "direction_trade_1": direction_trade_1,
                "direction_trade_2": direction_trade_2,
                "direction_trade_3": direction_trade_3,
                "starting_amount_in_asset": starting_amount_in_asset,
                "acquired_coin_t1": acquired_coin_t1,
                "acquired_coin_t2": acquired_coin_t2,
                "acquired_coin_t3": acquired_coin_t3,
                "swap_1_rate": swap_1_rate,
                "swap_2_rate": swap_2_rate,
                "swap_3_rate": swap_3_rate,
                "profit": profit,
                "profit_perc": profit_perc,
                "direction": direction,
                "trade_description_1": trade_description_1,
                "trade_description_2": trade_description_2,
                "trade_description_3": trade_description_3,
                "triangular_pairs": t_pair_dict['combined']
            }
            return surface_dict
    return surface_dict


# Reformat Order Book for Depth Calculation
def reformat_orderbook(prices, direction):
    main_price_list = []
    if direction == "quote_to_base":
        for p in prices['asks']:
            ask_price = float(p[0])
            adj_price = 1 / ask_price if ask_price != 0 else 0
            adj_quantity = float(p[1]) * ask_price
            main_price_list.append([adj_price, adj_quantity])
    elif direction == "base_to_quote":
        for p in prices['bids']:
            bid_price = float(p[0])
            adj_price = bid_price if bid_price != 0 else 0
            adj_quantity = float(p[1])
            main_price_list.append([adj_price, adj_quantity])
    return main_price_list


# Get Acquired Coin Also Known As Depth Calculation
def calculate_amount_out(amount_in, orderbook):
    """
        CHALLENGES
        Full amount of starting amount can be eaten on the first level (level 0)
        Some of the amount in can be eaten up by multiple levels
        Some coins may not have enough liquidity on the orderbook!
    """
    # Initialise Variables
    trading_balance = amount_in
    quantity_bought = 0
    acquired_coin = 0
    counts = 0

    for level in orderbook:
        # Extract the level price and quantity
        level_price = level[0]
        level_available_quantity = level[1]

        # Amount In is <= first level total amount
        if trading_balance <= level_available_quantity:
            quantity_bought = trading_balance
            trading_balance = 0
            amount_bought = quantity_bought * level_price

        # Amount In is > a given level total amount
        elif trading_balance > level_available_quantity:
            quantity_bought = level_available_quantity
            trading_balance -= quantity_bought
            amount_bought = quantity_bought * level_price

        # Accumulate Acquired Coin
        acquired_coin = acquired_coin + amount_bought

        # Exit Trade
        if trading_balance == 0:
            return acquired_coin

        # Exit if not enough order book levels
        counts += 1
        if counts == len(orderbook):
            return 0


# Get the depth from  the Order Book
def get_depth_from_orderbook(threshold, surface_arb, mother_currency, keys):
    binance_client = Binance(keys['key'], keys['secret'])
    binance_ccxt = ccxt.binance({'apiKey': keys['key'], 'secret': keys['secret']})

    tickers_price = json.loads(bot_func.open_file('./utils/binance_http_tickers.json'))
    starting_amount_in_asset = surface_arb['starting_amount_in_asset']

    # Define all pairs (A, B and C)
    contract_1 = surface_arb["contract_1"].replace("/", "")
    contract_2 = surface_arb["contract_2"].replace("/", "")
    contract_3 = surface_arb["contract_3"].replace("/", "")

    # Define the fee of each pair
    contract_1_taker_fee = float(tickers_price[contract_1]['takerCommission'])
    contract_2_taker_fee = float(tickers_price[contract_2]['takerCommission'])
    contract_3_taker_fee = float(tickers_price[contract_3]['takerCommission'])

    # get the price of each pair
    contract_1_price = float(tickers_price[contract_1]['lastPrice'])
    contract_2_price = float(tickers_price[contract_2]['lastPrice'])
    contract_3_price = float(tickers_price[contract_3]['lastPrice'])

    # Define direction for trades
    contract_1_direction = surface_arb["direction_trade_1"]
    contract_2_direction = surface_arb["direction_trade_2"]
    contract_3_direction = surface_arb["direction_trade_3"]

    # Get Order Book for First Trade Assessment
    depth_1_prices = bot_func.fetch_url(
        f"https://api.binance.com/api/v3/depth?symbol={contract_1}&limit=20")
    depth_1_reformatted_prices = reformat_orderbook(
        depth_1_prices, contract_1_direction)

    # Get Order Book for Second Trade Assessment
    depth_2_prices = bot_func.fetch_url(
        f"https://api.binance.com/api/v3/depth?symbol={contract_2}&limit=20")
    depth_2_reformatted_prices = reformat_orderbook(
        depth_2_prices, contract_2_direction)

    # Get Order Book for Third Trade Assessment
    depth_3_prices = bot_func.fetch_url(
        f"https://api.binance.com/api/v3/depth?symbol={contract_3}&limit=20")
    depth_3_reformatted_prices = reformat_orderbook(
        depth_3_prices, contract_3_direction)

    # Get Acquired Coins trade 1--------------------------------------------------------------------------||
    acquired_coin_t1 = calculate_amount_out(
        starting_amount_in_asset, depth_1_reformatted_prices)

    # calculate trade 1 fee___________________
    if contract_1_direction == "quote_to_base":
        buy_amount_in_base = starting_amount_in_asset / contract_1_price
        base_fee = buy_amount_in_base * contract_1_taker_fee
        acquired_coin_t1 = acquired_coin_t1 - base_fee
    elif contract_1_direction == "base_to_quote":
        buy_amount_in_quote = starting_amount_in_asset * contract_1_price
        quote_fee = buy_amount_in_quote * contract_1_taker_fee
        acquired_coin_t1 = acquired_coin_t1 - quote_fee

    # Get Acquired Coins trade 2--------------------------------------------------------------------------||
    acquired_coin_t2 = calculate_amount_out(
        acquired_coin_t1, depth_2_reformatted_prices)

    # calculate trade 2 fee____________________
    if contract_2_direction == "quote_to_base":
        buy_amount_in_base = acquired_coin_t1 / contract_2_price
        base_fee = buy_amount_in_base * contract_2_taker_fee
        acquired_coin_t2 = acquired_coin_t2 - base_fee
    elif contract_2_direction == "base_to_quote":
        buy_amount_in_quote = acquired_coin_t1 * contract_2_price
        quote_fee = buy_amount_in_quote * contract_2_taker_fee
        acquired_coin_t2 = acquired_coin_t2 - quote_fee

    # Get Acquired Coins trade 3--------------------------------------------------------------------------||
    acquired_coin_t3 = calculate_amount_out(
        acquired_coin_t2, depth_3_reformatted_prices)

    # calculate trade 3 fee____________________
    if contract_3_direction == "quote_to_base":
        buy_amount_in_base = acquired_coin_t2 / contract_3_price
        base_fee = buy_amount_in_base * contract_3_taker_fee
        acquired_coin_t3 = acquired_coin_t3 - base_fee
    elif contract_3_direction == "base_to_quote":
        buy_amount_in_quote = acquired_coin_t2 * contract_3_price
        quote_fee = buy_amount_in_quote * contract_3_taker_fee
        acquired_coin_t3 = acquired_coin_t3 - quote_fee

    # Calculate Profit Loss Also Known As Real Rate
    profit = acquired_coin_t3 - starting_amount_in_asset
    real_rate_perc = (profit / starting_amount_in_asset) * 100 if profit != 0 else 0

    dis_corlor = Fore.GREEN if real_rate_perc > 0 else Fore.RED
    print("Profit Threshold = ", dis_corlor + str(round(real_rate_perc, 3)), dis_corlor+"%")
    if real_rate_perc > threshold:

        # print({
        #     "profit": profit,
        #     "real_rate_perc": real_rate_perc,
        #     "contract_1": surface_arb["contract_1"],
        #     "contract_2": surface_arb["contract_2"],
        #     "contract_3": surface_arb["contract_3"],
        #     "contract_1_direction": contract_1_direction,
        #     "contract_2_direction": contract_2_direction,
        #     "contract_3_direction": contract_3_direction
        # })

        order1_id = 0
        order2_id = 0
        order3_id = 0

        # Place trade------|<>|
        try:
            # check if starting coin is the mother currency, if not true then convert mother currency to starting currency||
            starting_coin = surface_arb['swap_1']
            if starting_coin != mother_currency:
                # convert coin
                buy_starting_coin = binance_ccxt.create_order(symbol=starting_coin + mother_currency, type="market",
                                                              side="BUY", amount=starting_amount_in_asset, params={
                        "newClientOrderId": "Fluronix_Triabot_Convert"})

                starting_amount_in_asset = float(buy_starting_coin['info']['executedQty'])
                print("Converting to starting coin fulfilled")
                bot_func.sendtelemes("Converting to starting coin fulfilled ✅")
                logging.warning("Converting to starting coin fulfilled ✅")

            # FIRST TRADE___________________________________________________________________________________________|<>|
            contract_1_symbol = surface_arb["contract_1"].split('/')

            if contract_1_direction == "quote_to_base":
                trade_side = "BUY"
                acquired_coin_t1_symbol = contract_1_symbol[0]
            else:
                trade_side = "SELL"
                acquired_coin_t1_symbol = contract_1_symbol[1]
            contract_1_params = {"newClientOrderId": "Fluronix_Triabot_Trade1"}

            # check if starting coin is not the base asset in triangular trade 1 pair, if true then specify the buy
            # quantity in quote asset
            if starting_coin != contract_1_symbol[0]:
                contract_1_params["quoteOrderQty"] = starting_amount_in_asset

            # catching the insufficient fund error base on binance returning the received amount with fee through the api
            try:
                acquired_coin_t1 = binance_ccxt.create_order(symbol=contract_1, type="market", side=trade_side,
                                                             amount=starting_amount_in_asset, params=contract_1_params)
            except:
                curr_code = contract_1_symbol[1] if trade_side == "BUY" else contract_1_symbol[0]
                starting_amount_in_asset = binance_client.user_asset(asset=curr_code, recvWindow=6000)[0]['free']

                acquired_coin_t1 = binance_ccxt.create_order(symbol=contract_1, type="market", side=trade_side,
                                                             amount=float(starting_amount_in_asset),
                                                             params=contract_1_params)

            order1_id = acquired_coin_t1['info']['orderId']

            acquired_coin_t1 = float(
                acquired_coin_t1['info']['executedQty']) if contract_1_direction == "quote_to_base" else float(
                acquired_coin_t1['info']['cummulativeQuoteQty'])

            print(
                Fore.GREEN + f"Trade 1 fulfilled {surface_arb['contract_1']} {contract_1_direction} {acquired_coin_t1}")
            alert = f"Trade 1 fulfilled {surface_arb['contract_1']} {contract_1_direction} {acquired_coin_t1} ✅"
            bot_func.sendtelemes(alert)
            logging.warning(alert)

            # SECOND TRADE__________________________________________________________________________________________|<>|
            contract_2_symbol = surface_arb["contract_2"].split('/')

            if contract_2_direction == "quote_to_base":
                trade_side = "BUY"
                acquired_coin_t2_symbol = contract_2_symbol[0]
            else:
                trade_side = "SELL"
                acquired_coin_t2_symbol = contract_2_symbol[1]
            contract_2_params = {"newClientOrderId": 'Fluronix_Triabot_Trade2'}

            # check if acquired_coin_t1_symbol(starting coin) is the base asset in triangular trade 2 pair, if true then
            # specify the buy quantity in base asset else specify the the quantity in quote asset

            if acquired_coin_t1_symbol != contract_2_symbol[0]:
                contract_2_params["quoteOrderQty"] = acquired_coin_t1

            # catching the insufficient fund error base on binance returning the received amount with fee through the api
            try:
                acquired_coin_t2 = binance_ccxt.create_order(symbol=contract_2, type="market", side=trade_side,
                                                             amount=acquired_coin_t1, params=contract_2_params)
            except:
                curr_code = contract_2_symbol[1] if trade_side == "BUY" else contract_2_symbol[0]
                acquired_coin_t1 = binance_client.user_asset(asset=curr_code, recvWindow=6000)[0]['free']

                acquired_coin_t2 = binance_ccxt.create_order(symbol=contract_2, type="market", side=trade_side,
                                                             amount=float(acquired_coin_t1), params=contract_2_params)

            order2_id = acquired_coin_t2['info']['orderId']

            acquired_coin_t2 = float(
                acquired_coin_t2['info']['executedQty']) if contract_2_direction == "quote_to_base" else float(
                acquired_coin_t2['info']['cummulativeQuoteQty'])

            print(
                Fore.GREEN+ f"Trade 2 fulfilled {surface_arb['contract_2']} {contract_2_direction} {acquired_coin_t2}")
            alert = f"Trade 2 fulfilled {surface_arb['contract_2']} {contract_2_direction} {acquired_coin_t2} ✅"
            bot_func.sendtelemes(alert)
            logging.warning(alert)

            # THIRD TRADE___________________________________________________________________________________________|<>|
            contract_3_symbol = surface_arb["contract_3"].split('/')
            trade_side = "BUY" if contract_3_direction == "quote_to_base" else "SELL"
            contract_3_params = {"newClientOrderId": 'Fluronix_Triabot_Trade3'}

            # check if acquired_coin_t2_symbol(starting coin) is not the base asset in triangular trade 3 pair, if true
            # then specify the quantity in quote asset

            if acquired_coin_t2_symbol != contract_3_symbol[0]:
                contract_3_params["quoteOrderQty"] = acquired_coin_t2

            # catching the insufficient fund error base on binance returning the received amount with fee through the api
            try:
                acquired_coin_t3 = binance_ccxt.create_order(symbol=contract_3, type="market", side=trade_side,
                                                             amount=acquired_coin_t2, params=contract_3_params)
            except:
                curr_code = contract_3_symbol[1] if trade_side == "BUY" else contract_3_symbol[0]
                acquired_coin_t2 = binance_client.user_asset(asset=curr_code, recvWindow=6000)[0]['free']

                acquired_coin_t3 = binance_ccxt.create_order(symbol=contract_3, type="market", side=trade_side,
                                                             amount=float(acquired_coin_t2), params=contract_3_params)

            order3_id = acquired_coin_t3['info']['orderId']

            acquired_coin_t3 = float(
                acquired_coin_t3['info']['executedQty']) if contract_3_direction == "quote_to_base" else float(
                acquired_coin_t3['info']['cummulativeQuoteQty'])

            print(
                Fore.GREEN + f"Trade 3 fulfilled {surface_arb['contract_3']} {contract_3_direction} {acquired_coin_t3}")
            alert = f"Trade 3 fulfilled {surface_arb['contract_3']} {contract_3_direction} {acquired_coin_t3} ✅"
            bot_func.sendtelemes(alert)
            logging.warning(alert)

            # __________________________________________________________________________________________________________

            profit = acquired_coin_t3 - starting_amount_in_asset
            real_rate_perc = (profit / starting_amount_in_asset) * 100 if profit != 0 else 0

            # Trade Descriptions
            trade_description_1 = f"Traded {starting_amount_in_asset} {starting_coin} to {surface_arb['swap_2']} and received {acquired_coin_t1} {surface_arb['swap_2']}."
            trade_description_2 = f"Traded {acquired_coin_t1} {surface_arb['swap_2']} to {surface_arb['swap_3']} and received {acquired_coin_t2} {surface_arb['swap_3']}."
            trade_description_3 = f"Traded {acquired_coin_t2} {surface_arb['swap_3']} to {surface_arb['swap_1']} and received {acquired_coin_t3} {surface_arb['swap_1']}."

            trade_mes = f"""
🦾Binance Bot Arbitrage History...

🧭Arbitrage Direction: {surface_arb["direction"]}

🛞Starting amount: {starting_amount_in_asset} {starting_coin}
🔚Ending amount: {acquired_coin_t3} {starting_coin}
____________________________________
🤑Profit: {profit} {starting_coin} 
💹Profit Percent: {round(real_rate_perc, 3)} %
____________________________________
Triangular Pairs: {surface_arb['triangular_pairs']}

Trade1: {surface_arb["contract_1"]}, direction = {contract_1_direction}, ID: {order1_id}.
Trade2: {surface_arb["contract_2"]}, direction = {contract_2_direction}, ID: {order2_id}.
Trade3: {surface_arb["contract_3"]}, direction = {contract_3_direction}, ID: {order3_id}.
___________________________________
Trade1 Description: {trade_description_1}

Trade2 Description: {trade_description_2}

Trade3 Description: {trade_description_3}"""

            print(trade_mes)
            bot_func.sendtelemes(trade_mes)
            logging.warning(trade_mes)
            return trade_mes
        except Exception as err:
            print(Fore.RED+ "They is an Error on one of your triangular trade ❌: Error message = ",
                  err)
            alert = "They is an Error on one of your triangular trade ❌: Error message = "+str(err)
            bot_func.sendtelemes(alert)
            logging.warning(alert)

    else:
        return {}
