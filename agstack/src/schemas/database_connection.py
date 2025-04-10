from pydantic import BaseModel
from typing import Optional, List

class DatabaseConnectionBase(BaseModel):
    """Base schema for database connection information"""
    connection_name: str
    host: str
    port: int
    username: str
    database_name: str
    schema_name: str

class DatabaseConnectionCreate(DatabaseConnectionBase):
    """Schema for creating a database connection (includes password)"""
    password: str

class DatabaseConnectionResponse(DatabaseConnectionBase):
    """Schema for API responses with connection information (no password)"""
    id: Optional[int] = None
    
    class Config:
        from_attributes = True

class ConnectionResultResponse(BaseModel):
    """Standard response format for connection operations"""
    success: bool
    message: str
    tables: Optional[List[str]] = None