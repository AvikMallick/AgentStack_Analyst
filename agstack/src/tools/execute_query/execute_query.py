import logging
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

from src.modules.db_utils import execute_query as db_execute_query

logger = logging.getLogger(__name__)

class ExecuteQueryInput(BaseModel):
    """Input parameters for the execute_query_tool."""
    query: str = Field(..., description="SQL query to execute")
    connection_name: str = Field(..., description="Name of the database connection to use")

class ExecuteQueryOutput(BaseModel):
    """Output parameters for the execute_query_tool."""
    success: bool = Field(..., description="Whether the query execution was successful")
    data: Optional[dict] = Field(None, description="Data returned by the query, if any")
    error: Optional[str] = Field(None, description="Error message if query execution failed")

def execute_query_tool(input: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes a SQL query on the specified database connection and returns the results.
    
    Args:
        input: A dictionary containing 'query' and 'connection_name'
        
    Returns:
        A dictionary containing execution status and results
    """
    try:
        # Parse input
        parsed_input = ExecuteQueryInput.model_validate(input)
        
        # Execute query
        df = db_execute_query(
            query=parsed_input.query, 
            connection_name=parsed_input.connection_name
        )
        
        # Convert DataFrame to dictionary
        data = df.to_dict(orient="records")
        
        # Return success result
        output = ExecuteQueryOutput(
            success=True,
            data=data,
            error=None
        )
        return output.model_dump()
    
    except Exception as e:
        # Log the error
        error_msg = f"Error executing query: {str(e)}"
        logger.error(error_msg)
        
        # Return error result
        output = ExecuteQueryOutput(
            success=False,
            data=None,
            error=error_msg
        )
        return output.model_dump() 