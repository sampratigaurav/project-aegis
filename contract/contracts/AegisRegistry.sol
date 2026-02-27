// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AegisRegistry {

    struct Model {
        address publisher;
        uint256 timestamp;
    }

    mapping(bytes32 => Model) private registry;

    event ModelRegistered(bytes32 indexed modelHash, address indexed publisher);

    function registerModel(bytes32 modelHash) external {
        require(registry[modelHash].publisher == address(0), "Model already registered");

        registry[modelHash] = Model({
            publisher: msg.sender,
            timestamp: block.timestamp
        });

        emit ModelRegistered(modelHash, msg.sender);
    }

    function verifyModel(bytes32 modelHash)
        external
        view
        returns (address publisher, uint256 timestamp)
    {
        Model memory model = registry[modelHash];
        return (model.publisher, model.timestamp);
    }
}