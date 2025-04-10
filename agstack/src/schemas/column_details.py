from pydantic import BaseModel
from typing import List, Any, Optional, Union
from datetime import datetime

class ColumnDetailsBase(BaseModel):
    """Base schema for column information"""
    column_name: str
    data_type: str
    is_nullable: str
    sample_values: List[Any] = []

class ColumnDetailsCreate(ColumnDetailsBase):
    """Schema for creating column details in the database"""
    table_id: int

class ColumnDetailsResponse(ColumnDetailsBase):
    """Schema for API responses with column information"""
    id: Optional[int] = None
    
    class Config:
        from_attributes = True 