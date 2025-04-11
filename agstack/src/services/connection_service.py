import json
from typing import List, Tuple, Optional

from sqlalchemy.orm import Session

from src.models.column_details import ColumnDetails
from src.models.database_connection import DatabaseConnection
from src.models.table_details import TableDetails
from src.schemas.database_connection import DatabaseConnectionCreate
from src.services.database_service import DatabaseService
from src.services.db_utils import add_and_refresh, commit_changes, rollback_changes, CustomJSONEncoder


class ConnectionService:
    def __init__(self):
        self.db_service = DatabaseService()

    def check_existing_connection(self, db: Session, connection_name: str) -> Optional[DatabaseConnection]:
        """Check if a connection with the given name already exists"""
        return db.query(DatabaseConnection).filter(
            DatabaseConnection.connection_name == connection_name
        ).first()

    def test_connection(self, request: DatabaseConnectionCreate) -> Tuple[bool, str]:
        """Test if a connection can be established"""
        return self.db_service.connect(
            host=request.host,
            port=request.port,
            username=request.username,
            password=request.password,
            database_name=request.database_name
        )

    def check_schema_exists(self, request: DatabaseConnectionCreate) -> bool:
        """Check if the schema exists in the database"""
        return self.db_service.check_schema_exists(
            host=request.host,
            port=request.port,
            username=request.username,
            password=request.password,
            database_name=request.database_name,
            schema_name=request.schema_name
        )

    def get_tables(self, request: DatabaseConnectionCreate) -> List[str]:
        """Get all tables from the schema"""
        return self.db_service.get_tables_for_schema(
            host=request.host,
            port=request.port,
            username=request.username,
            password=request.password,
            database_name=request.database_name,
            schema_name=request.schema_name
        )

    def create_connection_record(self, db: Session, request: DatabaseConnectionCreate) -> DatabaseConnection:
        """Create a database connection record"""
        db_connection = DatabaseConnection(
            connection_name=request.connection_name,
            host=request.host,
            port=request.port,
            username=request.username,
            password=request.password,
            database_name=request.database_name,
            schema_name=request.schema_name
        )

        return add_and_refresh(db, db_connection)

    def process_table_and_columns(self, db: Session, connection_id: int, table_name: str,
                                  request: DatabaseConnectionCreate) -> Tuple[bool, str]:
        """Process a single table and its columns"""
        try:
            # Create TableDetails object
            table_details = TableDetails(
                connection_id=connection_id,
                table_name=table_name
            )

            table_details = add_and_refresh(db, table_details)

            # Get column details from the database
            columns = self.db_service.get_column_details(
                host=request.host,
                port=request.port,
                username=request.username,
                password=request.password,
                database_name=request.database_name,
                schema_name=request.schema_name,
                table_name=table_name
            )

            # Save each column
            for column in columns:
                # Convert sample values to JSON string
                sample_values_json = json.dumps(column.sample_values, cls=CustomJSONEncoder)

                column_details = ColumnDetails(
                    table_id=table_details.id,
                    column_name=column.column_name,
                    data_type=column.data_type,
                    is_nullable=column.is_nullable,
                    sample_values=sample_values_json
                )

                db.add(column_details)

            commit_changes(db)
            return True, ""

        except Exception as e:
            rollback_changes(db)
            return False, str(e)

    def create_connection(self, db: Session, request: DatabaseConnectionCreate) -> Tuple[bool, str, List[str]]:
        """Main function to handle database connection creation flow"""
        # Check for existing connection
        if self.check_existing_connection(db, request.connection_name):
            return False, f"Connection with name '{request.connection_name}' already exists", []

        # Test connection
        connection_success, connection_message = self.test_connection(request)
        if not connection_success:
            return False, f"Database connection failed: {connection_message}", []

        # Check schema exists
        if not self.check_schema_exists(request):
            return False, f"Schema '{request.schema_name}' does not exist", []

        # Get tables
        tables = self.get_tables(request)
        if not tables:
            return True, f"Connected successfully but no tables found in schema '{request.schema_name}'", []

        # Create connection record
        db_connection = self.create_connection_record(db, request)

        # Process tables and columns
        for table_name in tables:
            success, error = self.process_table_and_columns(db, db_connection.id, table_name, request)
            if not success:
                return False, f"Error processing table '{table_name}': {error}", []

        return True, "Connection successful and data saved", tables

    def get_all_connections(self, db: Session) -> List[DatabaseConnection]:
        """Get all database connections"""
        return db.query(DatabaseConnection).all()

    def delete_connection(self, db: Session, connection_id: int) -> Tuple[bool, str]:
        """Delete a database connection by ID"""
        try:
            # Find the connection
            connection = db.query(DatabaseConnection).filter(DatabaseConnection.id == connection_id).first()
            if not connection:
                return False, f"Connection with ID {connection_id} not found"

            # Find all related tables
            tables = db.query(TableDetails).filter(TableDetails.connection_id == connection_id).all()
            for table in tables:
                # Delete all columns for each table
                db.query(ColumnDetails).filter(ColumnDetails.table_id == table.id).delete()

            # Delete tables
            db.query(TableDetails).filter(TableDetails.connection_id == connection_id).delete()

            # Delete connection
            db.delete(connection)
            commit_changes(db)

            return True, f"Connection '{connection.connection_name}' successfully deleted"
        except Exception as e:
            rollback_changes(db)
            return False, f"Error deleting connection: {str(e)}"

    def get_tables_for_connection(self, db: Session, connection_id: int) -> Tuple[bool, str, List[str]]:
        """Get tables for a specific connection"""
        try:
            # Find the connection
            connection = db.query(DatabaseConnection).filter(DatabaseConnection.id == connection_id).first()
            if not connection:
                return False, f"Connection with ID {connection_id} not found", []

            # Get tables
            tables = db.query(TableDetails).filter(TableDetails.connection_id == connection_id).all()
            table_names = [table.table_name for table in tables]

            return True, "Tables retrieved successfully", table_names
        except Exception as e:
            return False, f"Error retrieving tables: {str(e)}", []

    def get_columns_for_table(self, db: Session, connection_id: int, table_name: str) -> List[str]:
        """Get columns for a specific table in a connection"""
        try:
            # Find the table
            table = db.query(TableDetails).filter(
                TableDetails.connection_id == connection_id,
                TableDetails.table_name == table_name
            ).first()

            if not table:
                return []

            # Get columns
            columns = db.query(ColumnDetails).filter(ColumnDetails.table_id == table.id).all()
            column_names = [column.column_name for column in columns]

            return column_names
        except Exception:
            return []
