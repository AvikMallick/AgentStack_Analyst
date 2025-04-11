import logging
from typing import List

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.models.chat_message import ChatMessage
from src.schemas.chat import ChatCreate, ChatResponse, ChatWithConnectionsResponse
from src.schemas.chat_message import ChatMessageCreate, ChatMessageResponse, ChatMessageSend
from src.services.chat_service import ChatService

router = APIRouter()
chat_service = ChatService()


@router.post("/chats", response_model=ChatResponse)
async def create_chat(chat_data: ChatCreate, db: Session = Depends(get_db)):
    """
    Create a new chat with connections.
    Requires:
    - title: string
    - connection_ids: list of connection IDs
    """
    if not chat_data.connection_ids:
        raise HTTPException(status_code=400, detail="At least one connection is required")
    
    return chat_service.create_chat(db, chat_data)


@router.get("/chats", response_model=List[ChatWithConnectionsResponse])
async def get_all_chats(db: Session = Depends(get_db)):
    """
    Get all chats with their associated connections
    """
    return chat_service.get_all_chats_with_connections(db)


@router.get("/chats/{chat_id}", response_model=ChatWithConnectionsResponse)
async def get_chat(chat_id: int, db: Session = Depends(get_db)):
    """
    Get chat details by ID, including associated connections
    """
    chat = chat_service.get_chat_with_connections(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail=f"Chat with ID {chat_id} not found")
    return chat


@router.get("/chats/{chat_id}/messages", response_model=List[ChatMessageResponse])
async def get_chat_messages(chat_id: int, db: Session = Depends(get_db)):
    """
    Get all messages for a chat, sorted by message_index
    """
    chat = chat_service.get_chat(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail=f"Chat with ID {chat_id} not found")
    
    return chat_service.get_chat_messages(db, chat_id)


@router.post("/chats/{chat_id}/messages", response_model=ChatMessageResponse)
async def send_message(
    chat_id: int,
    message_data: ChatMessageSend,
    db: Session = Depends(get_db)
):
    """
    Send a message to a chat and get the AI response.
    
    This endpoint:
    1. Verifies the chat exists
    2. Creates a message record
    3. Gets connections associated with the chat
    4. Processes the message with the AI
    5. Returns the complete message with results
    """
    # Check if the chat exists
    chat = chat_service.get_chat_with_connections(db, chat_id)
    if not chat:
        raise HTTPException(status_code=404, detail=f"Chat with ID {chat_id} not found")
    
    # Make sure chat has connections
    if not chat.connections:
        raise HTTPException(
            status_code=400, 
            detail="This chat has no database connections. Please add connections to the chat."
        )
    
    # Get connection IDs
    connection_ids = [conn.id for conn in chat.connections]
    
    # Create the complete message request
    chat_message = ChatMessageCreate(
        content=message_data.content,
        role=message_data.role,
        chat_id=chat_id,
        connection_ids=connection_ids
    )
    
    # Process message
    try:
        return chat_service.process_message(db, chat_message)
    except Exception as e:
        logging.error(f"Error processing message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing message: {str(e)}")


@router.get("/chats/messages/{message_id}", response_model=ChatMessageResponse)
async def get_message(message_id: int, db: Session = Depends(get_db)):
    """
    Get a specific chat message
    """
    message = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail=f"Message with ID {message_id} not found")
    
    return message
