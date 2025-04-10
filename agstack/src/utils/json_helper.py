"""
Utility functions for handling JSON in agent outputs.
"""
import json
import re
import logging

logger = logging.getLogger(__name__)

def extract_json_from_text(text: str) -> dict:
    """
    Extract a JSON object from text that might contain additional content.
    
    Args:
        text (str): Text that might contain a JSON object
        
    Returns:
        dict: Extracted JSON object or empty dict if extraction fails
    """
    try:
        # First try to parse the entire text as JSON
        return json.loads(text)
    except json.JSONDecodeError:
        # If that fails, look for JSON-like patterns
        try:
            # Find text that looks like a JSON object
            json_pattern = r'({[\s\S]*})'
            match = re.search(json_pattern, text)
            if match:
                json_str = match.group(1)
                return json.loads(json_str)
            
            # Try looking for code blocks with JSON
            code_block_pattern = r'```(?:json)?\s*([\s\S]*?)\s*```'
            match = re.search(code_block_pattern, text)
            if match:
                json_str = match.group(1)
                return json.loads(json_str)
            
            logger.warning("Could not extract JSON from text.")
            return {}
        except Exception as e:
            logger.error(f"Error extracting JSON: {str(e)}")
            return {}

def validate_task_output(output: str) -> dict:
    """
    Validate and extract JSON from a task output.
    
    Args:
        output (str): The raw output from a task
        
    Returns:
        dict: Valid JSON output or error information
    """
    try:
        json_data = extract_json_from_text(output)
        
        # Check if we have the required keys for AgstackCrew output
        if not json_data:
            return {
                "error": "No JSON data found in output",
                "raw_output": output
            }
        
        # For code generation task, check for required fields
        if "csv_file_name" not in json_data or "generated_code" not in json_data:
            return {
                "error": "Missing required fields in JSON output",
                "available_fields": list(json_data.keys()),
                "required_fields": ["csv_file_name", "generated_code"],
                "raw_output": output
            }
        
        return json_data
    except Exception as e:
        return {
            "error": f"Error validating task output: {str(e)}",
            "raw_output": output
        } 