import requests
import time
import logging
from config import WORLD_BANK_BASE_URL, G20_COUNTRIES, INDICATORS, START_YEAR, END_YEAR

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def fetch_indicator(indicator_code: str, country_code: str):
    """Fetch all pages for a given indicator and country from the World Bank API."""
    url = (
        f"{WORLD_BANK_BASE_URL}/country/{country_code}/indicator/{indicator_code}"
        f"?format=json&date={START_YEAR}:{END_YEAR}&per_page=100"
    )

    records = []
    page = 1

    while True:
        try:
            response = requests.get(f"{url}&page={page}", timeout=15)
            response.raise_for_status()
            payload = response.json()

            # World Bank returns [metadata, data]
            if not isinstance(payload, list) or len(payload) < 2:
                logger.warning(f"Unexpected response structure for {indicator_code}/{country_code}")
                break

            metadata = payload[0]
            data = payload[1]

            if not data:
                break

            records.extend(data)

            total_pages = metadata.get("pages", 1)
            if page >= total_pages:
                break
            page += 1
            time.sleep(0.3)  # polite rate limiting

        except requests.RequestException as e:
            logger.error(f"Request failed for {indicator_code}/{country_code} page {page}: {e}")
            break

    return records


def extract_all():
    """Extract all indicators for all G20 countries."""
    all_records = []
    total = len(INDICATORS) * len(G20_COUNTRIES)
    done = 0

    for indicator_code, column_name in INDICATORS.items():
        for country_code, country_name in G20_COUNTRIES.items():
            done += 1
            logger.info(f"[{done}/{total}] Fetching {column_name} for {country_name}")

            raw_records = fetch_indicator(indicator_code, country_code)

            for record in raw_records:
                all_records.append({
                    "country_code": country_code,
                    "country_name": country_name,
                    "indicator_code": indicator_code,
                    "indicator_column": column_name,
                    "year": record.get("date"),
                    "value": record.get("value"),
                })

    logger.info(f"Extraction complete. Total raw records: {len(all_records)}")
    return all_records
