from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.schemas.database_connection import DatabaseConnectionCreate, ConnectionResultResponse, \
    DatabaseConnectionResponse
from src.services.connection_service import ConnectionService

router = APIRouter()

connection_service = ConnectionService()


@router.post("/connect", response_model=ConnectionResultResponse)
async def create_connection(request: DatabaseConnectionCreate, db: Session = Depends(get_db)):
    """
    Create a new database connection and fetch table/column information
    """
    success, message, tables = connection_service.create_connection(db, request)

    return ConnectionResultResponse(
        success=success,
        message=message,
        tables=tables
    )


@router.get("/all", response_model=List[DatabaseConnectionResponse])
async def get_all_connections(db: Session = Depends(get_db)):
    """
    Get all database connections
    """
    return connection_service.get_all_connections(db)


@router.delete("/{connection_id}", response_model=ConnectionResultResponse)
async def delete_connection(connection_id: int, db: Session = Depends(get_db)):
    """
    Delete a database connection by ID
    """
    success, message = connection_service.delete_connection(db, connection_id)

    return ConnectionResultResponse(
        success=success,
        message=message,
        tables=None
    )


@router.get("/{connection_id}/tables", response_model=ConnectionResultResponse)
async def get_connection_tables(connection_id: int, db: Session = Depends(get_db)):
    """
    Get tables for a specific connection
    """
    success, message, tables = connection_service.get_tables_for_connection(db, connection_id)

    return ConnectionResultResponse(
        success=success,
        message=message,
        tables=tables
    )


@router.get("/{connection_id}/tables/{table_name}/columns", response_model=List[str])
async def get_table_columns(connection_id: int, table_name: str, db: Session = Depends(get_db)):
    """
    Get columns for a specific table in a connection
    """
    return connection_service.get_columns_for_table(db, connection_id, table_name)
