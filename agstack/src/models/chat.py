from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, ARRAY, event, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from src.core.database import Base

# Association table for many-to-many relationship between chats and connections
chat_connections = Table(
    'chat_connections',
    Base.metadata,
    Column('chat_id', Integer, ForeignKey('chats.id', ondelete="CASCADE")),
    Column('connection_id', Integer, ForeignKey('database_connections.id', ondelete="CASCADE")),
    extend_existing=True
)

class Chat(Base):
    """
    Model for storing chat sessions
    """
    __tablename__ = "chats"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, default="New Chat")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    messages = relationship("ChatMessage", back_populates="chat", cascade="all, delete-orphan")
    connections = relationship("DatabaseConnection", secondary=chat_connections, backref="chats")
