from pydantic import BaseModel
from typing import List, Optional, Any
from datetime import datetime

from src.schemas.database_connection import DatabaseConnectionResponse

class ChatBase(BaseModel):
    """Base schema for chat information"""
    title: str = "New Chat"

class ChatCreate(ChatBase):
    """Schema for creating a new chat"""
    connection_ids: List[int]

class ChatResponse(ChatBase):
    """Schema for chat responses"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ChatWithConnectionsResponse(ChatResponse):
    """Schema for chat responses with connection details"""
    connections: List[DatabaseConnectionResponse] = []

    class Config:
        from_attributes = True 