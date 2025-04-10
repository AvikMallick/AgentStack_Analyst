import logging
from typing import Optional, Dict, Any

import pandas as pd
import psycopg2
from sqlalchemy import text

from src.core.database import SessionLocal
from src.models.database_connection import DatabaseConnection
# Import related models to ensure relationships are properly resolved
from src.models.table_details import TableDetails
from src.models.column_details import ColumnDetails


def get_db_connection_details(connection_name: str) -> Optional[Dict[str, Any]]:
    """
    Get database connection details by connection name from our application's database
    """
    db = SessionLocal()
    try:
        # Use a direct SQL query with text() to avoid relationship loading issues
        sql = text(f"SELECT host, port, username, password, database_name FROM database_connections WHERE connection_name = :conn_name")
        connection = db.execute(sql, {"conn_name": connection_name}).first()

        if not connection:
            logging.error(f"Connection '{connection_name}' not found")
            return None

        return {
            "host": connection.host,
            "port": connection.port,
            "user": connection.username,
            "password": connection.password,
            "dbname": connection.database_name
        }
    finally:
        db.close()


def execute_query(query: str, connection_name: str) -> pd.DataFrame:
    """
    Execute a SQL query against the EXTERNAL database specified by connection_name.
    
    This function:
    1. Gets connection details from our application database
    2. Connects to the EXTERNAL database using those details
    3. Executes the provided query on that EXTERNAL database
    4. Returns the results as a DataFrame
    
    Args:
        query: SQL query to execute
        connection_name: Name of the connection in our application database
        
    Returns:
        DataFrame containing query results
    """
    logging.info(f"Executing query on external database connection: {connection_name}")

    # Get connection details from our application database
    conn_details = get_db_connection_details(connection_name)
    if not conn_details:
        raise ValueError(f"Connection '{connection_name}' not found")

    try:
        # Connect to the EXTERNAL database
        logging.info(
            f"Connecting to external database: {conn_details['dbname']} on {conn_details['host']}:{conn_details['port']}")
        conn = psycopg2.connect(**conn_details)

        # Execute the query on the EXTERNAL database
        logging.info(f"Executing query on external database: {query}")
        df = pd.read_sql_query(query, conn)

        # Close the connection
        conn.close()

        logging.info(f"Query returned {len(df)} rows from external database")
        return df
    except Exception as e:
        logging.error(f"Error executing query on external database: {str(e)}")
        raise
