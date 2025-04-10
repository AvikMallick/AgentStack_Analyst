from sqlalchemy import inspect, Table, MetaData

from src.core.database import engine, Base, get_db
from src.models.database_connection import DatabaseConnection
from src.models.chat import Chat, chat_connections
from src.models.chat_message import ChatMessage
from src.models.table_details import TableDetails
from src.models.column_details import ColumnDetails


def reset_database():
    """Drop all tables and recreate them in the correct order"""
    inspector = inspect(engine)
    
    # Drop tables in the correct order based on dependencies
    
    # 1. First drop tables with no dependencies
    if inspector.has_table("chat_messages"):
        print("Dropping chat_messages table...")
        ChatMessage.__table__.drop(engine)
    
    if inspector.has_table("chat_connections"):
        print("Dropping chat_connections table...")
        chat_connections.drop(engine)
    
    if inspector.has_table("chats"):
        print("Dropping chats table...")
        Chat.__table__.drop(engine)
    
    # 2. Drop column_details which depends on table_details
    if inspector.has_table("column_details"):
        print("Dropping column_details table...")
        ColumnDetails.__table__.drop(engine)
    
    # 3. Drop table_details which depends on database_connections
    if inspector.has_table("table_details"):
        print("Dropping table_details table...")
        TableDetails.__table__.drop(engine)
    
    # 4. Finally drop database_connections
    if inspector.has_table("database_connections"):
        print("Dropping database_connections table...")
        DatabaseConnection.__table__.drop(engine)
    
    # Create all tables
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    print("Database reset complete!")


def initialize_database():
    """Initialize the database if tables don't exist"""
    inspector = inspect(engine)
    
    # Check if all required tables exist
    tables_exist = (
        inspector.has_table("database_connections") and
        inspector.has_table("table_details") and
        inspector.has_table("column_details") and
        inspector.has_table("chats") and
        inspector.has_table("chat_connections") and
        inspector.has_table("chat_messages")
    )
    
    if not tables_exist:
        print("Some tables are missing. Creating all tables...")
        Base.metadata.create_all(bind=engine)
        print("Database initialized!")
    else:
        print("All tables already exist.")


if __name__ == "__main__":
    # When run directly, reset the database
    reset_database()
