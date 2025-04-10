import logging
import os
import subprocess
import sys
import tempfile
from typing import Dict, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def execute_code_tool(code: str, prompt: Optional[str] = None, previous_error: Optional[str] = None,
                      retry_count: int = 0) -> Dict[str, Any]:
    """
    Execute the generated Python code and report results. Does not retry execution but provides information 
    for the LLM to generate new code if execution fails.
    
    Args:
        code: The Python code to execute
        prompt: The original prompt used to generate the code
        previous_error: Error from previous execution attempt
        retry_count: Number of previous generation attempts (0 for first try)
        
    Returns:
        Dict with execution result, containing:
        - success: Boolean indicating if execution was successful
        - output: STDOUT from the execution (if available)
        - error: Error message (if execution failed)
        - retry_count: Number of regeneration attempts so far
        - should_regenerate: Boolean indicating if code should be regenerated
    """
    max_retries = 3
    current_retry = retry_count

    # If this is a retry attempt, log the information
    if current_retry > 0:
        logger.info(f"Generation attempt {current_retry} of {max_retries}")
        if previous_error:
            logger.info(f"Previous error: {previous_error}")

    # Get the path to the src directory
    current_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    src_dir = current_dir  # We're in src/tools/code_executor

    # Create a temporary file with the code
    with tempfile.NamedTemporaryFile(suffix='.py', mode='w', delete=False) as f:
        # Add code to import sys and modify sys.path
        setup_code = f"""
import sys
import os

# Add the src directory to the Python path
src_dir = "{src_dir}"
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

"""
        f.write(setup_code + code)
        temp_file = f.name

    logger.info(f"Generated code saved to temporary file: {temp_file}")

    try:
        # Set up environment variables
        env = os.environ.copy()
        env["PYTHONPATH"] = src_dir + ":" + env.get("PYTHONPATH", "")

        # Execute the code in a subprocess
        logger.info("Executing generated code...")
        result = subprocess.run(
            [sys.executable, temp_file],
            capture_output=True,
            text=True,
            env=env
        )

        # Process was completed (even if it returned a non-zero code)
        stdout = result.stdout
        stderr = result.stderr

        if result.returncode == 0:
            # Successful execution
            return {
                "success": True,
                "output": stdout,
                "error": None,
                "retry_count": current_retry,
                "should_regenerate": False
            }
        else:
            # Process ran but returned an error
            error_message = f"Exit code: {result.returncode}\n{stderr}"

            # If we haven't reached max retries, suggest regeneration
            if current_retry < max_retries:
                return {
                    "success": False,
                    "output": stdout if stdout else None,
                    "error": error_message,
                    "retry_count": current_retry,
                    "should_regenerate": True,
                    "original_prompt": prompt
                }
            else:
                return {
                    "success": False,
                    "output": stdout if stdout else None,
                    "error": error_message,
                    "retry_count": current_retry,
                    "should_regenerate": False,
                    "max_retries_reached": True
                }

    except Exception as e:
        # Something went wrong with the subprocess itself
        error_message = str(e)

        # If we haven't reached max retries, suggest regeneration
        if current_retry < max_retries:
            return {
                "success": False,
                "output": None,
                "error": error_message,
                "retry_count": current_retry,
                "should_regenerate": True,
                "original_prompt": prompt
            }
        else:
            return {
                "success": False,
                "output": None,
                "error": error_message,
                "retry_count": current_retry,
                "should_regenerate": False,
                "max_retries_reached": True
            }
    finally:
        # Clean up the temporary file
        if os.path.exists(temp_file):
            os.unlink(temp_file)
