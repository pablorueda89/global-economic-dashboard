WORLD_BANK_BASE_URL = "https://api.worldbank.org/v2"

G20_COUNTRIES = {
    "AR": "Argentina",
    "AU": "Australia",
    "BR": "Brazil",
    "CA": "Canada",
    "CN": "China",
    "FR": "France",
    "DE": "Germany",
    "IN": "India",
    "ID": "Indonesia",
    "IT": "Italy",
    "JP": "Japan",
    "MX": "Mexico",
    "RU": "Russia",
    "SA": "Saudi Arabia",
    "ZA": "South Africa",
    "KR": "South Korea",
    "TR": "Turkey",
    "GB": "United Kingdom",
    "US": "United States",
    "EU": "European Union",
}

INDICATORS = {
    "NY.GDP.MKTP.CD": "gdp_usd",
    "NY.GDP.PCAP.CD": "gdp_per_capita_usd",
    "FP.CPI.TOTL.ZG": "inflation_pct",
    "SL.UEM.TOTL.ZS": "unemployment_pct",
    "GC.DOD.TOTL.GD.ZS": "public_debt_pct_gdp",
    "NE.TRD.GNFS.ZS": "trade_pct_gdp",
}

START_YEAR = 2000
END_YEAR = 2023

DB_PATH = "../data/economic_data.db"
JSON_PATH = "../data/economic_data.json"
