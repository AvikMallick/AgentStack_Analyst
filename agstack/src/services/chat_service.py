import json
import logging
from datetime import datetime
from typing import List, Dict, Any, Optional, Tuple

import agentops
from sqlalchemy import func
from sqlalchemy.orm import Session

from src.crew import AgstackCrew
from src.models.chat import Chat
from src.models.chat_message import ChatMessage
from src.models.database_connection import DatabaseConnection
from src.modules.file_utils import read_csv_data, get_csv_path
from src.schemas.chat import ChatCreate
from src.schemas.chat_message import ChatMessageCreate
from src.services.db_utils import (
    add_and_refresh, commit_changes, get_chat_by_id, get_chat_messages,
    update_message_status, update_message_with_result
)


class ChatService:
    def __init__(self):
        pass

    def get_chat(self, db: Session, chat_id: int) -> Optional[Chat]:
        """Get a chat by ID"""
        return get_chat_by_id(db, chat_id)

    def get_chat_with_connections(self, db: Session, chat_id: int) -> Optional[Chat]:
        """Get a chat by ID with its connections populated"""
        chat = db.query(Chat).filter(Chat.id == chat_id).first()
        if chat:
            # Ensure connections are loaded
            _ = chat.connections
        return chat

    def get_all_chats(self, db: Session) -> List[Chat]:
        """Get all chats"""
        return db.query(Chat).order_by(Chat.updated_at.desc()).all()

    def get_all_chats_with_connections(self, db: Session) -> List[Chat]:
        """Get all chats with their connections"""
        chats = db.query(Chat).order_by(Chat.updated_at.desc()).all()
        # Ensure connections are loaded for each chat
        for chat in chats:
            _ = chat.connections
        return chats

    def create_chat(self, db: Session, chat_data: ChatCreate) -> Chat:
        """Create a new chat"""
        # Create a new chat record
        chat = Chat(title=chat_data.title)
        chat = add_and_refresh(db, chat)

        # Add connections to the chat
        if chat_data.connection_ids:
            connections = db.query(DatabaseConnection).filter(
                DatabaseConnection.id.in_(chat_data.connection_ids)
            ).all()

            chat.connections.extend(connections)
            commit_changes(db)

        return chat

    def create_message(self, db: Session, message_data: ChatMessageCreate) -> ChatMessage:
        """Create a new chat message"""
        # Get current max message index for this chat
        max_index = db.query(
            func.max(ChatMessage.message_index)
        ).filter(
            ChatMessage.chat_id == message_data.chat_id
        ).scalar() or -1

        # Create new message with incremented index
        message = ChatMessage(
            chat_id=message_data.chat_id,
            content=message_data.content,
            role=message_data.role,
            status="pending",
            message_index=max_index + 1
        )
        return add_and_refresh(db, message)

    def get_chat_messages(self, db: Session, chat_id: int) -> List[ChatMessage]:
        """Get all messages for a chat in order"""
        return get_chat_messages(db, chat_id)

    def process_message(self, db: Session, message_data: ChatMessageCreate) -> ChatMessage:
        """
        Process a chat message from start to finish synchronously.
        
        1. Create message record
        2. Get metadata for connections
        3. Process with AI
        4. Update with results
        5. Return final message
        """
        # Create the user message
        user_message = self.create_message(db, message_data)

        try:
            # Update status to processing
            update_message_status(db, user_message.id, "processing")

            # Create assistant's response message
            assistant_message = ChatMessage(
                chat_id=message_data.chat_id,
                content="",  # Will be populated after processing
                role="assistant",
                status="processing",
                message_index=user_message.message_index + 1
            )
            assistant_message = add_and_refresh(db, assistant_message)

            # Get metadata for connections
            available_tables = self.get_connection_metadata(db, message_data.connection_ids)

            # Use the first connection for now (can be enhanced to handle multiple)
            connection_name = None
            if available_tables:
                connection_name = list(available_tables.keys())[0]

            if not connection_name:
                # No valid connection or tables
                update_message_with_result(db=db, message_id=assistant_message.id, status="failed",
                                           result_content={"error": "No valid connection or tables found"})
                return assistant_message

            # Run the crew with the metadata
            csv_file_name, generated_code = self.run_crew_with_metadata(
                user_question=message_data.content,
                connection_name=connection_name,
                available_tables=available_tables[connection_name]
            )

            # Process results
            if csv_file_name and generated_code:
                # Parse CSV content
                csv_content = self.parse_csv_result(csv_file_name)

                # Set the assistant message content
                assistant_message.content = (
                    f"I've analyzed your query and here's what I found:\n\n"
                    f"I used the following Python:\n```python\n{generated_code}\n```\n\n"
                    f"The query returned {csv_content.get('row_count', 0)} results."
                )

                # Update message with results
                update_message_with_result(db=db, message_id=assistant_message.id, status="completed",
                                           generated_code=generated_code, result_content=csv_content)
            else:
                # Failed execution
                error_message = "I couldn't process your query. Please try rephrasing or check the database connection."
                assistant_message.content = error_message

                update_message_with_result(db=db, message_id=assistant_message.id, status="failed",
                                           result_content={"error": "Crew execution failed", "details": error_message})

            # Update chat's updated_at timestamp
            chat = get_chat_by_id(db, message_data.chat_id)
            if chat:
                chat.updated_at = datetime.utcnow()
                commit_changes(db)

            # Return the assistant message
            return assistant_message

        except Exception as e:
            # If anything fails, update the assistant message and return it
            if 'assistant_message' in locals():
                error_message = f"An error occurred: {str(e)}"
                assistant_message.content = error_message

                update_message_with_result(db=db, message_id=assistant_message.id, status="failed",
                                           result_content={"error": f"Error processing message: {str(e)}"})
                return assistant_message
            else:
                # If assistant message wasn't created yet, update user message and return it
                update_message_status(db, user_message.id, "failed")
                return user_message

    def get_connection_metadata(self, db: Session, connection_ids: List[int]) -> Dict[str, Dict[str, Any]]:
        """Get metadata for connections"""
        connections = db.query(DatabaseConnection).filter(
            DatabaseConnection.id.in_(connection_ids)
        ).all()

        metadata = {}

        for connection in connections:
            # Get tables for this connection
            table_metadata = {}
            for table in connection.table_details:
                columns_metadata = []
                for column in table.columns:
                    # Parse sample values from JSON string
                    sample_values = json.loads(column.sample_values) if column.sample_values else []

                    columns_metadata.append({
                        "name": column.column_name,
                        "type": column.data_type,
                        "sample": sample_values
                    })

                table_metadata[table.table_name] = {
                    "columns": columns_metadata,
                    "schema_name": connection.schema_name,
                }

            metadata[connection.connection_name] = table_metadata

        return metadata

    def run_crew_with_metadata(self, user_question: str, connection_name: str, available_tables: Dict[str, Any]) -> \
            Tuple[str, str]:
        """Run the AgstackCrew with the provided metadata"""
        # Initialize AgentOps session for this request
        session = agentops.start_session(tags=[f"crew:{user_question}"])

        try:
            # Convert complex types to strings for interpolation
            interpolated_inputs = {
                "user_question": user_question,
                "connection_name": connection_name,
                "available_tables_json": json.dumps(available_tables, indent=2)
            }

            # Create and run the crew
            instance = AgstackCrew().crew()
            result = instance.kickoff(inputs=interpolated_inputs)

            json_output = {}
            try:
                formatted_json_str = result.tasks_output[1].raw.replace("```json", "").replace("```", "").strip()
                json_output = json.loads(formatted_json_str)
            except Exception as e:
                logging.error(f"Error parsing JSON output: {str(e)}")

            csv_file_name = json_output.get("csv_file_name", None)
            generated_code = json_output.get("generated_code", None)

            return csv_file_name, generated_code
        except Exception as e:
            # Handle exceptions
            error_message = f"Error running crew: {str(e)}"
            # Log the error
            logging.error(error_message)
            raise e
        finally:
            session.end_session()

    def parse_csv_result(self, csv_file_name: str) -> Dict[str, Any]:
        """Parse CSV file content into a structured format for API response"""
        # Use the improved read_csv_data function from file_utils
        csv_path = get_csv_path(csv_file_name)
        return read_csv_data(csv_path)
