import hashlib

def compute_sha256(file_content: bytes) -> str:
    """
    Computes the SHA-256 hash of a file's content.
    """
    m = hashlib.sha256()
    m.update(file_content)
    return m.hexdigest()
