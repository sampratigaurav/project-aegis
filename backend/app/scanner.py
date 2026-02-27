import logging
import tempfile
import os
from modelscan.modelscan import ModelScan

logger = logging.getLogger(__name__)

def scan_model_file(file_content: bytes) -> bool:
    """
    Scans a model file for dangerous patterns using modelscan.
    Returns True if malicious (CRITICAL or HIGH severity findings), False if safe.
    """
    # Create a temporary file to scan
    fd, temp_path = tempfile.mkstemp(suffix=".bin")
    
    try:
        # Write bytes to temp file
        with os.fdopen(fd, 'wb') as f:
            f.write(file_content)
            
        # Initialize and run modelscan
        scanner = ModelScan()
        scan_result = scanner.scan(temp_path)
        
        # Check for CRITICAL or HIGH severity issues
        is_malicious = False
        issues = getattr(scan_result, 'issues', []) # Handle potential differences in modelscan API
        if hasattr(issues, 'all_issues'):
            issues = issues.all_issues
            
        for issue in issues:
            severity = getattr(issue, 'severity', 'UNKNOWN').upper()
            if severity in ['CRITICAL', 'HIGH']:
                logger.warning(f"Malicious model detected: {issue}")
                is_malicious = True
                
        if not is_malicious:
            logger.info("Modelscan completed: No critical or high severity issues found.")
            
        return is_malicious
        
    except Exception as e:
        logger.error(f"Error during modelscan: {e}", exc_info=True)
        # Default to True (malicious/unsafe) if scanning fails for safety
        return True
    finally:
        # Clean up temporary file
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception as cleanup_error:
            logger.error(f"Failed to delete temporary file {temp_path}: {cleanup_error}")

