from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, JSON, event
from sqlalchemy.orm import relationship
from sqlalchemy.sql import text

from src.core.database import Base


class ChatMessage(Base):
    """
    Model for storing chat messages
    """
    __tablename__ = "chat_messages"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    chat_id = Column(Integer, ForeignKey("chats.id", ondelete="CASCADE"), index=True)
    message_index = Column(Integer, index=True, default=0)  # Added to ensure correct ordering
    content = Column(Text, nullable=False)
    role = Column(String, default="user")  # 'user' or 'assistant'
    created_at = Column(DateTime, default=datetime.utcnow)

    # Fields for storing crew execution results
    status = Column(String, default="pending")  # pending, processing, completed, failed
    generated_code = Column(Text, nullable=True)
    result_content = Column(JSON, nullable=True)  # Actual content of the result for direct API responses

    # Relationship
    chat = relationship("Chat", back_populates="messages")


@event.listens_for(ChatMessage, "before_insert")
def set_message_index(mapper, connection, target):
    """
    Automatically set message_index to the next available index for this chat
    """
    if target.chat_id is not None:
        # Get the current max index for this chat
        stmt = text(f"SELECT COALESCE(MAX(message_index) + 1, 0) FROM chat_messages WHERE chat_id = {target.chat_id}")
        next_index = connection.execute(stmt).scalar()
        target.message_index = next_index
