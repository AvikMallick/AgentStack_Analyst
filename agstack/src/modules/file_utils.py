import logging
import os
from datetime import datetime
from typing import Optional, Dict, Any

import pandas as pd

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create output directory if it doesn't exist
CSV_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "src", "csv_data", "outputs")
os.makedirs(CSV_DIR, exist_ok=True)

# Keep results directory for backward compatibility
RESULTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "results")
os.makedirs(RESULTS_DIR, exist_ok=True)


def write_df(df: pd.DataFrame, filename: Optional[str] = None) -> str:
    """
    Write a DataFrame to a CSV file in the src/csv_data/outputs directory.
    Will overwrite the file if it already exists.
    
    Args:
        df: DataFrame to write
        filename: Optional filename (timestamp will be used if not provided)
        
    Returns:
        Path to the created CSV file
    """
    if filename is None:
        # Generate a filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"result_{timestamp}.csv"

    # Ensure filename has .csv extension
    if not filename.endswith('.csv'):
        filename += '.csv'

    # Create full path - using the new CSV_DIR
    filepath = os.path.join(CSV_DIR, filename)

    # Write DataFrame to CSV, mode='w' ensures overwriting
    logger.info(f"Writing DataFrame with {len(df)} rows to {filepath}")
    df.to_csv(filepath, index=False, mode='w')

    return filepath


def read_csv_data(filepath: str) -> Dict[str, Any]:
    """
    Read a CSV file and return its contents in a format suitable for API responses.
    
    Args:
        filepath: Path to the CSV file
        
    Returns:
        Dictionary with columns, data, and row_count
    """
    if not os.path.exists(filepath):
        logger.error(f"CSV file not found: {filepath}")
        return {"error": f"File not found: {filepath}"}

    try:
        df = pd.read_csv(filepath)

        # Convert DataFrame to a format suitable for API response
        columns = df.columns.tolist()
        data = df.to_dict(orient="records")

        return {
            "columns": columns,
            "data": data,
            "row_count": len(data)
        }
    except Exception as e:
        logger.error(f"Error reading CSV: {str(e)}")
        return {"error": f"Error reading CSV: {str(e)}"}


def get_csv_path(filename: str) -> str:
    """
    Get the full path for a CSV file in the outputs directory
    
    Args:
        filename: The CSV filename
        
    Returns:
        Full path to the file
    """
    # Ensure filename has .csv extension
    if not filename.endswith('.csv'):
        filename += '.csv'

    return os.path.join(CSV_DIR, filename)
