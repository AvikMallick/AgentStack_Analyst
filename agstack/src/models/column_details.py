from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship

from src.core.database import Base


class ColumnDetails(Base):
    """
    Model for storing details about columns in synced tables
    """
    __tablename__ = "column_details"

    id = Column(Integer, primary_key=True, index=True)
    table_id = Column(Integer, ForeignKey("table_details.id"))
    column_name = Column(String)
    data_type = Column(String)
    is_nullable = Column(String)  # "YES" or "NO" as returned by information_schema
    sample_values = Column(Text)  # JSON string
    
    # Relationships
    table = relationship("TableDetails", back_populates="columns") 
    