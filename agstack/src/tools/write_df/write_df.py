import logging
import pandas as pd
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

from src.modules.file_utils import write_df as file_write_df

logger = logging.getLogger(__name__)

class WriteDfInput(BaseModel):
    """Input parameters for the write_df_tool."""
    df: dict = Field(..., description="DataFrame data as a dictionary")
    filename: str = Field(..., description="Name for the CSV file (with or without .csv extension)")

class WriteDfOutput(BaseModel):
    """Output parameters for the write_df_tool."""
    success: bool = Field(..., description="Whether the file was written successfully")
    file_path: Optional[str] = Field(None, description="Path to the saved CSV file")
    error: Optional[str] = Field(None, description="Error message if file writing failed")

def write_df_tool(input: Dict[str, Any]) -> Dict[str, Any]:
    """
    Save a pandas DataFrame to a CSV file in src/csv_data/outputs with the given filename.
    
    Args:
        input: A dictionary containing 'df' and 'filename'
        
    Returns:
        A dictionary containing the save status and file path
    """
    try:
        # Parse input
        parsed_input = WriteDfInput.model_validate(input)
        
        # Convert dictionary to DataFrame
        df = pd.DataFrame(parsed_input.df)
        
        # Save DataFrame to CSV
        file_path = file_write_df(
            df=df, 
            filename=parsed_input.filename
        )
        
        # Return success result
        output = WriteDfOutput(
            success=True,
            file_path=file_path,
            error=None
        )
        return output.model_dump()
    
    except Exception as e:
        # Log the error
        error_msg = f"Error writing DataFrame to CSV: {str(e)}"
        logger.error(error_msg)
        
        # Return error result
        output = WriteDfOutput(
            success=False,
            file_path=None,
            error=error_msg
        )
        return output.model_dump() 