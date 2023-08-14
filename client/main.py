import time
import sys
import json
import os
import logging
import pandas as pd
from utils import bot_function as bot_func
from utils.exchange import Exchange
from datetime import datetime, timedelta
import colorama
from colorama import Back, Fore, Style
colorama.init(autoreset=True)
os.system("")


# exp_date = "2023-03-05 13:18:42.650926"

banner = f"""
 _    _ _       _        __                                                         _     _ _                          _           _   
| |  | (_)     | |      / _|                                                       | |   (_) |                        | |         | |  
| |__| |_  __ _| |__   | |_ _ __ ___  __ _ _   _  ___ _ __   ___ _   _    __ _ _ __| |__  _| |_ _ __ __ _  __ _  ___  | |__   ___ | |_ 
|  __  | |/ _` | '_ \  |  _| '__/ _ \/ _` | | | |/ _ \ '_ \ / __| | | |  / _` | '__| '_ \| | __| '__/ _` |/ _` |/ _ \ | '_ \ / _ \| __|
| |  | | | (_| | | | | | | | | |  __/ (_| | |_| |  __/ | | | (__| |_| | | (_| | |  | |_) | | |_| | | (_| | (_| |  __/ | |_) | (_) | |_ 
|_|  |_|_|\__, |_| |_| |_| |_|  \___|\__, |\__,_|\___|_| |_|\___|\__, |  \__,_|_|  |_.__/|_|\__|_|  \__,_|\__, |\___| |_.__/ \___/ \__|
           __/ |                        | |                       __/ |                                    __/ |                       
           |___/                        |_|                      |___/                                    |___/            """

print(Fore.YELLOW + banner)
print(Fore.MAGENTA + Style.BRIGHT +
      f"""----------------------------------------------------------------
Version: 1.0.0  
----------------------------------------------------------------

""")

# Read Excel sheet
df = pd.read_excel(r'bot_settings.xlsx', 'Configuration')
sheet_input_column = df["Input"]

mother_currency = sheet_input_column[1]
starting_amount = sheet_input_column[2]
threshold = sheet_input_column[3]
depth_threshold = sheet_input_column[4]
fetch_interval = sheet_input_column[5]

exchange_name = sheet_input_column[0].lower()


keys = {
    'key': sheet_input_column[15],
    'secret': sheet_input_column[16],
    'passphrase': sheet_input_column[17],
    'password': sheet_input_column[18]
}

if exchange_name not in ["binance"]:
    print(Fore.RED + exchange_name + " exchange is not  listed in bot yet")
    input(Back.RED + "Enter to exit")
    sys.exit()

# Exchange Instance
exchange = Exchange(exchange_name, keys)


# utils variables
last_time_structured = 0
tripairs_loop_count = 1


logging.basicConfig(filename='event.log', encoding='utf-8',
                    format='%(asctime)s - %(message)s')


# get the exchange tickers from http get request and structure the triangular pairs and save in json"""
def step_1(structure=True):
    global last_time_structured
    tickers = exchange.fetch_tickers()
    saved_tickers_json = bot_func.save_file(
        f"./utils/{exchange_name}_http_tickers.json", json.dumps(tickers))
    # print(saved_tickers_json)


    # structure and save triangular pairs for specific exchange"""
    if structure:
        print(Back.MAGENTA + f"""

Structuring {exchange_name} triangular pairs.
This might take up to 15 minutes depending on the total number of pairs in {exchange_name} exchange...""")

        structured_pairs_list = exchange.structure_triangular_pair(tickers)
        saved_tri_pair_json = bot_func.save_file(f"./utils/{exchange_name}_triangular_pairs.json",
                                                 json.dumps(structured_pairs_list))
        if saved_tri_pair_json:
            print(
                Fore.GREEN + f"{len(structured_pairs_list[1])} Triangular pairs successfully saved")
            last_time_structured = datetime.now()


try:
    step_1(False)
except Exception as err:
    print(Fore.RED + "An error occured. Please make sure you input your correct exchange api keys in setting sheet.", err)
    input(Back.RED + "Hit enter key to exit:")
    sys.exit()


def main():
    global tripairs_loop_count
    # global exp_date
    # exp_date = datetime.strptime(str(exp_date), '%Y-%m-%d %H:%M:%S.%f')
    # if datetime.now() > exp_date:
    #     bot_func.sendtelemes("Your arbitrage bot is expired ❌")
    #     input("Bot Expired")
    #     sys.exit()

    try:
        try:
            t_pairs_list = json.loads(bot_func.open_file(f"./utils/{exchange_name}_triangular_pairs.json"))
        except:
            step_1()
            t_pairs_list = json.loads(bot_func.open_file(f"./utils/{exchange_name}_triangular_pairs.json"))

        last_time_structured = datetime.strptime( t_pairs_list[0][0], '%Y-%m-%d %H:%M:%S.%f')
        if last_time_structured + timedelta(days=fetch_interval) < datetime.now():
            step_1()

        # update price http_tickers.json with wss_tickers.json
        updated = exchange.update_tickers()
        if updated == False:
            alert = f"Stream file is not streaming {exchange_name} ticker prices. Run stream file and then hit Enter key to continue"
            logging.warning(alert)
            bot_func.sendtelemes(alert)
            input(
                Fore.RED + f"Stream file is not streaming {exchange_name} ticker prices. Run stream file and then hit {Fore.GREEN}Enter key to continue:")

            print(Back.GREEN + Fore.BLACK + "Continuning...")

        http_tickers_dict = json.loads(bot_func.open_file(f"./utils/{exchange_name}_http_tickers.json"))

    except Exception as err:
        print(Fore.RED + "An error occured,❌  retrying again... Error = ", err)

    print(Fore.GREEN + "Finding Arbitrage...", tripairs_loop_count)

    for t_pair_dict in t_pairs_list[1]:
        t_price_dict = exchange.get_price_ABC_pairs(t_pair_dict, http_tickers_dict)
        surface_arb = exchange.calc_arb_surface_rate(t_pair_dict, t_price_dict, starting_amount, threshold)

        if len(surface_arb) > 0:
            print(Fore.YELLOW + 'Surface arbitrage found')
            real_rate_arb = exchange.get_depth_from_orderbook(depth_threshold, surface_arb, mother_currency)
            # print(real_rate_arb)
    tripairs_loop_count += 1


if __name__ == "__main__":
    # main()
    while True:
        try:
            main()
        except Exception as err:
            print(Fore.RED + "Error on while loop", err)
            logging.warning("Error on while loop" + str(err))
            time.sleep(2)
#
