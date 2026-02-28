import logging
from web3 import Web3
from web3.exceptions import Web3Exception
from app.config import settings

logger = logging.getLogger(__name__)

w3 = Web3(Web3.HTTPProvider(settings.POLYGON_RPC))

# ABI matching the real AegisRegistry.sol contract
CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "bytes32", "name": "modelHash", "type": "bytes32"}
        ],
        "name": "registerModel",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "bytes32", "name": "modelHash", "type": "bytes32"}
        ],
        "name": "verifyModel",
        "outputs": [
            {"internalType": "address", "name": "publisher", "type": "address"},
            {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"


def get_contract():
    if not settings.CONTRACT_ADDRESS or not settings.PRIVATE_KEY:
        raise ValueError("Blockchain credentials are not configured.")

    contract = w3.eth.contract(
        address=Web3.to_checksum_address(settings.CONTRACT_ADDRESS),
        abi=CONTRACT_ABI
    )
    return contract


def register_model_hash_on_chain(file_hash: str) -> str:
    """
    Registers the model hash on Polygon Amoy.
    Returns the transaction hash.
    """
    contract = get_contract()
    account = w3.eth.account.from_key(settings.PRIVATE_KEY)
    sender = account.address

    logger.info(f"Registering hash on-chain: {file_hash[:16]}... from {sender}")

    # SHA-256 hex string is 64 chars = 32 bytes, perfect for bytes32
    file_hash_bytes = bytes.fromhex(file_hash)

    # Build transaction with dynamic gas estimation
    nonce = w3.eth.get_transaction_count(sender)

    # Use legacy transaction format for maximum compatibility
    tx = contract.functions.registerModel(file_hash_bytes).build_transaction({
        'from': sender,
        'chainId': 80002,
        'nonce': nonce,
        'gasPrice': w3.eth.gas_price,
    })

    # Let web3 estimate gas automatically by not specifying 'gas'
    # (build_transaction will estimate if 'gas' is omitted and 'from' is set)

    logger.info(f"Transaction built. Gas price: {tx.get('gasPrice')}, Nonce: {nonce}")

    signed_tx = w3.eth.account.sign_transaction(tx, private_key=settings.PRIVATE_KEY)

    # web3.py 6.x uses .raw_transaction, older versions use .rawTransaction
    raw = getattr(signed_tx, 'raw_transaction', None) or getattr(signed_tx, 'rawTransaction', None)
    if not raw:
        raise Exception("Could not get raw transaction bytes from signed transaction")

    tx_hash = w3.eth.send_raw_transaction(raw)
    tx_hex = w3.to_hex(tx_hash)

    logger.info(f"Transaction sent: {tx_hex}")

    # Wait for receipt
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
    if receipt.status != 1:
        raise Exception(f"Transaction reverted. Receipt: {receipt}")

    logger.info(f"Model registered on-chain. Tx: {tx_hex}, Gas used: {receipt.gasUsed}")
    return tx_hex


def verify_model_on_chain(file_hash: str) -> dict:
    """
    Verifies if a model hash exists on chain.
    """
    contract = get_contract()

    file_hash_bytes = bytes.fromhex(file_hash)
    result = contract.functions.verifyModel(file_hash_bytes).call()

    publisher_address = result[0]
    timestamp = result[1]

    is_registered = publisher_address != ZERO_ADDRESS

    logger.info(f"On-chain verify {file_hash[:16]}...: registered={is_registered}, publisher={publisher_address}")

    return {
        "is_registered": is_registered,
        "publisher": publisher_address if is_registered else None,
        "timestamp": timestamp if is_registered else None
    }
