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
    },
    {
        "anonymous": False,
        "inputs": [
            {"indexed": True, "internalType": "bytes32", "name": "modelHash", "type": "bytes32"},
            {"indexed": True, "internalType": "address", "name": "publisher", "type": "address"}
        ],
        "name": "ModelRegistered",
        "type": "event"
    }
]

ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"


def get_contract():
    if not settings.CONTRACT_ADDRESS or not settings.PRIVATE_KEY:
        raise ValueError("Blockchain credentials are not configured. Set CONTRACT_ADDRESS and PRIVATE_KEY.")

    try:
        contract = w3.eth.contract(
            address=Web3.to_checksum_address(settings.CONTRACT_ADDRESS),
            abi=CONTRACT_ABI
        )
        return contract
    except Exception as e:
        logger.error(f"Error initializing contract: {e}")
        raise


def register_model_hash_on_chain(file_hash: str) -> str:
    """
    Registers the model hash on Polygon Amoy.
    Returns the transaction hash.
    """
    contract = get_contract()

    try:
        account = w3.eth.account.from_key(settings.PRIVATE_KEY)
        nonce = w3.eth.get_transaction_count(account.address)

        # SHA-256 hex string is 64 chars = 32 bytes, perfect for bytes32
        file_hash_bytes = bytes.fromhex(file_hash)

        tx = contract.functions.registerModel(file_hash_bytes).build_transaction({
            'chainId': 80002,  # Amoy testnet
            'gas': 200000,
            'maxFeePerGas': w3.to_wei('30', 'gwei'),
            'maxPriorityFeePerGas': w3.to_wei('25', 'gwei'),
            'nonce': nonce,
        })

        signed_tx = w3.eth.account.sign_transaction(tx, private_key=settings.PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)

        logger.info(f"Transaction sent: {w3.to_hex(tx_hash)}")

        # Wait for receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        if receipt.status != 1:
            raise Exception("Smart contract transaction reverted")

        logger.info(f"Model registered on-chain. Tx: {w3.to_hex(tx_hash)}")
        return w3.to_hex(tx_hash)

    except Web3Exception as e:
        logger.error(f"Web3 error while registering on chain: {e}")
        raise
    except Exception as e:
        logger.error(f"Failed to register on chain: {e}")
        raise


def verify_model_on_chain(file_hash: str) -> dict:
    """
    Verifies if a model hash exists on chain.
    Returns is_registered, publisher address, and timestamp.
    """
    contract = get_contract()

    try:
        file_hash_bytes = bytes.fromhex(file_hash)
        result = contract.functions.verifyModel(file_hash_bytes).call()

        publisher_address = result[0]
        timestamp = result[1]

        # If publisher is the zero address, the model was never registered
        is_registered = publisher_address != ZERO_ADDRESS

        logger.info(f"On-chain verification for {file_hash[:16]}...: registered={is_registered}, publisher={publisher_address}")

        return {
            "is_registered": is_registered,
            "publisher": publisher_address if is_registered else None,
            "timestamp": timestamp if is_registered else None
        }

    except Web3Exception as e:
        logger.error(f"Web3 error while verifying on chain: {e}")
        return {
            "is_registered": False,
            "publisher": None,
            "timestamp": None
        }
    except Exception as e:
        logger.error(f"Failed to verify on chain: {e}")
        return {
            "is_registered": False,
            "publisher": None,
            "timestamp": None
        }
