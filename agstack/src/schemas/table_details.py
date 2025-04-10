from pydantic import BaseModel
from typing import List, Optional
from src.schemas.column_details import ColumnDetailsResponse

class TableDetailsBase(BaseModel):
    """Base schema for table information"""
    table_name: str

class TableDetailsCreate(TableDetailsBase):
    """Schema for creating table details"""
    connection_id: int

class TableDetailsResponse(TableDetailsBase):
    """Schema for API responses with table information"""
    id: Optional[int] = None
    columns: Optional[List[ColumnDetailsResponse]] = []
    
    class Config:
        from_attributes = True 