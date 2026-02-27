require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    amoy: {
      url: "https://polygon-amoy.g.alchemy.com/v2/YVa7apDLJrsHD_4EoXAyF",
      accounts: ["1f6c6a7970e85bc2f089ba54cc81911bccac6a7fadb2568efceabd487bee0e31"]
    }
  }
};