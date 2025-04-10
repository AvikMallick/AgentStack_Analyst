from sqlalchemy import Column, Integer, String, ForeignKey, Text
from sqlalchemy.orm import relationship

from src.core.database import Base
class TableDetails(Base):
    """
    Model for storing details about tables synced from user databases
    """
    __tablename__ = "table_details"

    id = Column(Integer, primary_key=True, index=True)
    connection_id = Column(Integer, ForeignKey("database_connections.id", ondelete="CASCADE"))
    table_name = Column(String)
    
    # Relationships
    connection = relationship("DatabaseConnection", back_populates="table_details")
    columns = relationship("ColumnDetails", back_populates="table", cascade="all, delete-orphan") 
