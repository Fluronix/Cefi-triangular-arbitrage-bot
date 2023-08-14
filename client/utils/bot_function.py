import json, requests, math
import pandas as pd
import os

def open_file(path):
    try:
        with open(path, 'r') as file:
            return file.read()
    except Exception as err:
        print(f"Unable to open {path} file.", err)
        return None

def save_file(path, file):
    try:
        with open(path, "w") as fp:
            fp.write(file)
            return True
    except Exception as err:
        print(f"Unable to save {path} file.", err)
        return False


def fetch_url(url):
    return json.loads(requests.get(url).text)


def sendtelemes(message):
    telegram_api_key = "" #Paste your telegram API key

    df = pd.read_excel(r'bot_settings.xlsx', 'Configuration')["Input"]
    if not math.isnan(df[6]):
        return requests.get(f'https://api.telegram.org/bot{telegram_api_key}/sendmessage?chat_id={df[6]}&text={message}')



