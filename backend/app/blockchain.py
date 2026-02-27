import json
import logging
from web3 import Web3
from web3.exceptions import Web3Exception
from app.config import settings

logger = logging.getLogger(__name__)

w3 = Web3(Web3.HTTPProvider(settings.POLYGON_RPC))

def get_contract():
    if not settings.CONTRACT_ADDRESS or not settings.PRIVATE_KEY:
        logger.warning("Blockchain credentials not fully configured. Using mock mode.")
        return None
        
    try:
        # standard ABI for Aegis smart contract
        abi = [
            {
                "inputs": [
                    {"internalType": "bytes32", "name": "fileHash", "type": "bytes32"},
                    {"internalType": "string", "name": "metadataURI", "type": "string"}
                ],
                "name": "registerModel",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "bytes32", "name": "fileHash", "type": "bytes32"}
                ],
                "name": "verifyModel",
                "outputs": [
                    {"internalType": "bool", "name": "isRegistered", "type": "bool"},
                    {"internalType": "address", "name": "publisher", "type": "address"},
                    {"internalType": "uint256", "name": "timestamp", "type": "uint256"}
                ],
                "stateMutability": "view",
                "type": "function"
            }
        ]
        contract = w3.eth.contract(address=settings.CONTRACT_ADDRESS, abi=abi)
        return contract
    except Exception as e:
        logger.error(f"Error initializing contract: {e}")
        return None

def register_model_hash_on_chain(file_hash: str, metadata_uri: str = "") -> str:
    """
    Registers the model hash on Polygon.
    Returns the transaction hash.
    """
    contract = get_contract()
    if not contract:
        # Mock tx hash
        return f"mock_tx_{file_hash[:10]}"
        
    try:
        account = w3.eth.account.from_key(settings.PRIVATE_KEY)
        nonce = w3.eth.get_transaction_count(account.address)
        
        file_hash_bytes = bytes.fromhex(file_hash)
        
        tx = contract.functions.registerModel(file_hash_bytes, metadata_uri).build_transaction({
            'chainId': 80002, # Amoy testnet
            'gas': 2000000,
            'maxFeePerGas': w3.to_wei('2', 'gwei'),
            'maxPriorityFeePerGas': w3.to_wei('1', 'gwei'),
            'nonce': nonce,
        })
        
        signed_tx = w3.eth.account.sign_transaction(tx, private_key=settings.PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        # Wait for receipt to guarantee success
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=120)
        if receipt.status != 1:
            raise Exception("Smart contract transaction reverted")
            
        return w3.to_hex(tx_hash)
    except Web3Exception as e:
        logger.error(f"Web3 provider error while registering on chain: {e}")
        raise e
    except Exception as e:
        logger.error(f"Failed to register on chain: {e}")
        raise e


def verify_model_on_chain(file_hash: str) -> dict:
    """
    Verifies if a model hash exists on chain.
    """
    contract = get_contract()
    if not contract:
        # Mock response
        return {
            "is_registered": True,
            "publisher": "0xMockPublisherAddress",
            "timestamp": 1700000000
        }
        
    try:
        file_hash_bytes = bytes.fromhex(file_hash)
        result = contract.functions.verifyModel(file_hash_bytes).call()
        return {
            "is_registered": result[0],
            "publisher": result[1],
            "timestamp": result[2]
        }
    except Web3Exception as e:
        logger.error(f"Web3 provider error while verifying on chain: {e}")
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
