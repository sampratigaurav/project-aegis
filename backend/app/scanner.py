import codecs
import logging

logger = logging.getLogger(__name__)

# List of dangerous strings to look out for in pickle files based on requirements
DANGEROUS_PATTERNS = [
    b"reduce",
    b"os.system",
    b"subprocess",
    b"eval",
    b"exec",
    b"__import__",
    b"globals",
    b"locals"
]

def scan_model_file(file_content: bytes) -> bool:
    """
    Scans a model file (e.g. .pkl or .pt) for dangerous patterns.
    Returns True if malicious, False if safe.
    """
    try:
        for pattern in DANGEROUS_PATTERNS:
            if pattern in file_content:
                logger.warning(f"Malicious pattern {pattern} detected in plain bytes")
                return True
                
            hex_pattern = codecs.encode(pattern, 'hex')
            if hex_pattern in file_content:
                logger.warning(f"Malicious pattern {pattern} detected in hex-encoded bytes")
                return True
                
        return False
    except Exception as e:
        logger.error(f"Error during file scanning: {e}")
        # Default to True (malicious/unsafe) if scanning fails
        return True

