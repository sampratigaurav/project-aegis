import logging
import tempfile
import os
import pickle
import io

logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# DANGEROUS PATTERNS – catches pickle-based RCE payloads like
# __reduce__ → os.system, subprocess.call, exec, eval, etc.
# -------------------------------------------------------------------
DANGEROUS_OPCODES = [
    b'cos\n',          # pickle: push global (c opcode) → os module
    b'csubprocess\n',  # pickle: push global → subprocess module
    b'cbuiltins\n',    # pickle: push global → builtins module
    b'c__builtin__\n', # pickle: push global → __builtin__ module
    b'cposixpath\n',   # pickle: push global → posixpath
    b'cnt\n',          # pickle: push global → nt (Windows OS interface)
]

DANGEROUS_STRINGS = [
    b'os.system',
    b'subprocess',
    b'exec(',
    b'eval(',
    b'__import__',
    b'__reduce__',
    b'__reduce_ex__',
    b'builtins',
    b'commands.getoutput',
    b'pty.spawn',
    b'shutil.rmtree',
]


def _scan_with_patterns(file_content: bytes) -> bool:
    """
    Pattern-based scan: checks file bytes for known dangerous opcodes
    and strings that indicate code execution payloads.
    Returns True if malicious, False if safe.
    """
    for opcode in DANGEROUS_OPCODES:
        if opcode in file_content:
            logger.warning(f"Dangerous pickle opcode detected: {opcode!r}")
            return True

    for pattern in DANGEROUS_STRINGS:
        if pattern in file_content:
            logger.warning(f"Dangerous pattern found in model: {pattern!r}")
            return True

    return False


def _scan_with_modelscan(file_content: bytes, filename: str) -> bool:
    """
    Uses ProtectAI's modelscan library for deep analysis.
    Returns True if malicious, False if safe, None if modelscan unavailable.
    """
    try:
        from modelscan.modelscan import ModelScan
    except ImportError:
        logger.warning("modelscan not available, skipping deep scan.")
        return None

    # Use the original file extension so modelscan knows the format
    _, ext = os.path.splitext(filename)
    if not ext:
        ext = ".bin"

    fd, temp_path = tempfile.mkstemp(suffix=ext)

    try:
        with os.fdopen(fd, 'wb') as f:
            f.write(file_content)

        scanner = ModelScan()
        scan_result = scanner.scan(temp_path)

        issues = getattr(scan_result, 'issues', [])
        if hasattr(issues, 'all_issues'):
            issues = issues.all_issues

        for issue in issues:
            severity = getattr(issue, 'severity', 'UNKNOWN')
            if hasattr(severity, 'name'):
                severity = severity.name
            severity = str(severity).upper()
            if severity in ['CRITICAL', 'HIGH']:
                logger.warning(f"ModelScan detected malicious content: {issue}")
                return True

        logger.info("ModelScan completed: No critical issues found.")
        return False

    except Exception as e:
        logger.error(f"ModelScan error: {e}", exc_info=True)
        return None  # Inconclusive — fall back to pattern scan
    finally:
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except Exception:
            pass


def scan_model_file(file_content: bytes, filename: str = "model.bin") -> bool:
    """
    Scans a model file for dangerous patterns.
    Uses a two-layer approach:
      1. Fast pattern-based scan (always runs)
      2. Deep modelscan analysis (if available)
    Returns True if malicious, False if safe.
    """
    # Layer 1: Pattern scan (fast, always works)
    if _scan_with_patterns(file_content):
        logger.warning(f"Pattern scan FAILED for {filename} — malicious content detected.")
        return True

    # Layer 2: ModelScan deep analysis (if available)
    modelscan_result = _scan_with_modelscan(file_content, filename)
    if modelscan_result is True:
        logger.warning(f"ModelScan FAILED for {filename} — malicious content detected.")
        return True

    logger.info(f"All scans passed for {filename}.")
    return False
