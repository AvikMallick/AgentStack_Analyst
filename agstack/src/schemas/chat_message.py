from pydantic import BaseModel
from typing import List, Optional, Any, Dict, Union
from datetime import datetime

class ChatMessageBase(BaseModel):
    """Base schema for chat message information"""
    content: str
    role: str = "user"

class ChatMessageSend(ChatMessageBase):
    """Simplified schema for sending messages (frontend to backend)"""
    # Only requires content and role, chat_id comes from URL path

class ChatMessageCreate(ChatMessageBase):
    """Schema for creating a new chat message (internal use)"""
    chat_id: int
    connection_ids: List[int]

class ChatMessageResponse(ChatMessageBase):
    """Schema for chat message responses"""
    id: int
    chat_id: int
    message_index: int
    created_at: datetime
    status: str
    generated_code: Optional[str] = None
    result_content: Optional[Dict[str, Any]] = None
    agentops_session_url: Optional[str] = None
    
    class Config:
        from_attributes = True 