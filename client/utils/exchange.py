from utils import binance


class Exchange:
    def __init__(self, _name, _keys={}):
        self.name = _name.lower()
        self.keys = _keys

    def fetch_tickers(self):
        if self.name == "binance":  # ------------------------------Binance
            return binance.fetch_tickers("https://api.binance.com/api/v3/ticker/24hr", self.keys)

    def structure_triangular_pair(self, tickers_json):
        if self.name == "binance":  # ------------------------------Binance
            return binance.structure_triangular_pair(tickers_json)

    def get_price_ABC_pairs(self, t_pair_dict, http_tickers_dict):
        if self.name == "binance":  # ------------------------------Binance
            return binance.get_price_ABC_pairs(t_pair_dict, http_tickers_dict)

    def calc_arb_surface_rate(self, t_pair_dict, t_price_dict, starting_amount, threshold):
        if self.name == "binance":  # ------------------------------Binance
            return binance.calc_arb_surface_rate(t_pair_dict, t_price_dict, starting_amount, threshold)

    def get_depth_from_orderbook(self, threshold, surface_arb, mother_currency):
        if self.name == "binance":  # ------------------------------Binance
            return binance.get_depth_from_orderbook(threshold, surface_arb, mother_currency, self.keys)

    def update_tickers(self):
        if self.name == "binance":  # ------------------------------Binance
            return binance.update_tickers()


