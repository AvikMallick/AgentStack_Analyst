from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from src.core.database import Base

class DatabaseConnection(Base):
    """
    Model for storing database connection details
    """
    __tablename__ = "database_connections"

    id = Column(Integer, primary_key=True, index=True)
    connection_name = Column(String, unique=True, index=True)
    host = Column(String)
    port = Column(Integer)
    username = Column(String)
    password = Column(String)
    database_name = Column(String)
    schema_name = Column(String, default="public")  # Default to public schema

    # Add relationship with cascade delete - use table_details instead of tables
    table_details = relationship("TableDetails", back_populates="connection", cascade="all, delete-orphan") 
