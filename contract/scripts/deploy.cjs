const hre = require("hardhat");

async function main() {
    const AegisRegistry = await hre.ethers.getContractFactory("AegisRegistry");

    const contract = await AegisRegistry.deploy();

    // Wait for deployment
    await contract.waitForDeployment();

    const address = await contract.getAddress();

    console.log("AegisRegistry deployed to:", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});