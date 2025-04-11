import json
from datetime import date, datetime
from typing import TypeVar, Any, Dict, Optional

from sqlalchemy.orm import Session

from src.models.chat import Chat
from src.models.chat_message import ChatMessage

# Generic type for any SQLAlchemy model
T = TypeVar('T')


class CustomJSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (date, datetime)):
            return obj.isoformat()
        return super().default(obj)


def add_and_refresh(db: Session, obj: T) -> T:
    """
    Add an object to the database and refresh it to get generated IDs
    """
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


def commit_changes(db: Session) -> None:
    """
    Commit changes to the database
    """
    db.commit()


def rollback_changes(db: Session) -> None:
    """
    Rollback changes to the database
    """
    db.rollback()


def delete_object(db: Session, obj: Any) -> None:
    """
    Delete an object from the database
    """
    db.delete(obj)
    db.commit()


def get_chat_by_id(db: Session, chat_id: int) -> Optional[Chat]:
    """
    Get a chat by ID
    """
    return db.query(Chat).filter(Chat.id == chat_id).first()


def get_message_by_id(db: Session, message_id: int) -> Optional[ChatMessage]:
    """
    Get a message by ID
    """
    return db.query(ChatMessage).filter(ChatMessage.id == message_id).first()


def update_message_status(db: Session, message_id: int, status: str) -> Optional[ChatMessage]:
    """
    Update a message's status
    """
    message = get_message_by_id(db, message_id)
    if message:
        message.status = status
        commit_changes(db)
    return message


def update_message_with_result(db: Session, message_id: int, status: str, generated_code: Optional[str] = None,
                               result_content: Optional[Dict[str, Any]] = None) -> Optional[ChatMessage]:
    """
    Update a message with results
    """
    message = get_message_by_id(db, message_id)
    if message:
        message.status = status
        if generated_code is not None:
            message.generated_code = generated_code
        if result_content is not None:
            message.result_content = result_content
        commit_changes(db)
    return message
