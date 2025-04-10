import json
import logging
from typing import Dict, List, Any, Tuple, Optional

import psycopg2
from src.models.column_details import ColumnDetails
from src.models.table_details import TableDetails
from src.schemas.column_details import ColumnDetailsBase

class DatabaseService:
    """
    Service for interacting with user-provided PostgreSQL databases
    """
    
    def connect(self, host: str, port: int, username: str, password: str, database_name: str) -> Tuple[bool, str]:
        """
        Connect to a PostgreSQL database and return connection status
        """
        try:
            conn = psycopg2.connect(
                host=host,
                port=port,
                user=username,
                password=password,
                dbname=database_name
            )
            conn.close()
            return True, "Connection successful"
        except Exception as e:
            logging.error(f"Database connection error: {str(e)}")
            return False, str(e)
    
    def check_schema_exists(self, host: str, port: int, username: str, password: str, database_name: str, schema_name: str) -> bool:
        """
        Check if a schema exists in the database
        """
        try:
            conn = psycopg2.connect(
                host=host,
                port=port,
                user=username,
                password=password,
                dbname=database_name
            )
            cursor = conn.cursor()
            
            # Check if schema exists
            cursor.execute("""
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name = %s
            """, (schema_name,))
            
            schema_exists = cursor.fetchone() is not None
            
            cursor.close()
            conn.close()
            
            logging.info(f"Schema {schema_name} exists: {schema_exists}")
            return schema_exists
        except Exception as e:
            logging.error(f"Error checking schema: {str(e)}")
            return False
    
    def get_tables_for_schema(self, host: str, port: int, username: str, password: str, database_name: str, schema_name: str) -> List[str]:
        """
        Get all tables for a specific schema
        """
        try:
            conn = psycopg2.connect(
                host=host,
                port=port,
                user=username,
                password=password,
                dbname=database_name
            )
            cursor = conn.cursor()
            
            # Get tables for the schema
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = %s 
                AND table_type = 'BASE TABLE'
            """, (schema_name,))
            
            tables = [row[0] for row in cursor.fetchall()]
            
            cursor.close()
            conn.close()
            
            return tables
        except Exception as e:
            logging.error(f"Error getting tables for schema: {str(e)}")
            return []
    
    def get_schemas_and_tables(self, host: str, port: int, username: str, password: str, database_name: str) -> Dict[str, List[str]]:
        """
        Get all schemas and tables in the database
        """
        result = {}
        try:
            conn = psycopg2.connect(
                host=host,
                port=port,
                user=username,
                password=password,
                dbname=database_name
            )
            cursor = conn.cursor()
            
            # Get all schemas
            cursor.execute("""
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
            """)
            
            schemas = [row[0] for row in cursor.fetchall()]
            
            # Get tables for each schema
            for schema in schemas:
                cursor.execute("""
                    SELECT table_name 
                    FROM information_schema.tables 
                    WHERE table_schema = %s 
                    AND table_type = 'BASE TABLE'
                """, (schema,))
                
                tables = [row[0] for row in cursor.fetchall()]
                result[schema] = tables
            
            cursor.close()
            conn.close()
            
            return result
        except Exception as e:
            logging.error(f"Error getting schemas and tables: {str(e)}")
            return {}
    
    def get_column_details(self, host: str, port: int, username: str, password: str, database_name: str, 
                         schema_name: str, table_name: str) -> List[ColumnDetailsBase]:
        """
        Get details for a table's column information and sample data of each column
        """
        columns: List[ColumnDetailsBase] = []
        try:
            conn = psycopg2.connect(
                host=host,
                port=port,
                user=username,
                password=password,
                dbname=database_name
            )
            cursor = conn.cursor()
            
            # Get column information
            cursor.execute("""
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_schema = %s
                AND table_name = %s
                ORDER BY ordinal_position
            """, (schema_name, table_name))
            
            for row in cursor.fetchall():
                column_name, data_type, nullable = row

                # Get 10 sample values for the column
                sample_values = self.get_sample_values(host, port, username, password, database_name, schema_name, table_name, column_name)
                
                # Create a ColumnDetailsBase object using Pydantic
                column = ColumnDetailsBase(
                    column_name=column_name,
                    data_type=data_type,
                    is_nullable=nullable,
                    sample_values=sample_values
                )
                columns.append(column)
                
            cursor.close()
            conn.close()
            
        except Exception as e:
            logging.error(f"Error getting table details: {str(e)}")
            raise e
        
        return columns
    
    def get_sample_values(
            self, host: str, port: int, username: str, password: str, database_name: str, 
            schema_name: str, table_name: str, column_name: str
    ) -> List[Any]:
        """
        Get 10 sample values for a specific column
        """
        try:
            conn = psycopg2.connect(
                host=host,
                port=port,
                user=username,
                password=password,
                dbname=database_name
            )
            cursor = conn.cursor()
            
            # Using parameterized query would be better but table/column names can't be parameterized
            # Escape identifiers properly to prevent SQL injection
            # This is still safer than direct f-string interpolation
            query = f"""
            SELECT "{column_name}"
            FROM "{schema_name}"."{table_name}"
            LIMIT 10
            """
            
            cursor.execute(query)
            sample_values = [row[0] for row in cursor.fetchall()]
            
            cursor.close()
            conn.close()
            
            return sample_values
        except Exception as e:
            logging.error(f"Error getting sample values: {str(e)}")
            return []
        