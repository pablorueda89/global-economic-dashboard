"""
Global Economic Health Dashboard — ETL Pipeline
Runs: extract → transform → load (SQLite + JSON)
"""
import logging
import sys
from extract import extract_all
from transform import transform, build_summary
from load import load_to_sqlite, export_to_json

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler("pipeline.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger(__name__)


def run():
    logger.info("=" * 60)
    logger.info("STARTING ETL PIPELINE — Global Economic Health Dashboard")
    logger.info("=" * 60)

    # --- EXTRACT ---
    logger.info("PHASE 1: Extract")
    raw_records = extract_all()

    if not raw_records:
        logger.error("No data extracted. Aborting pipeline.")
        sys.exit(1)

    # --- TRANSFORM ---
    logger.info("PHASE 2: Transform")
    df = transform(raw_records)
    summary = build_summary(df)

    # --- LOAD ---
    logger.info("PHASE 3: Load")
    load_to_sqlite(df)
    export_to_json(df, summary)

    logger.info("=" * 60)
    logger.info("PIPELINE COMPLETE")
    logger.info(f"  Rows processed : {len(df)}")
    logger.info(f"  Countries      : {df['country_code'].nunique()}")
    logger.info(f"  Years          : {int(df['year'].min())}–{int(df['year'].max())}")
    logger.info("=" * 60)


if __name__ == "__main__":
    run()
