import "@nomicfoundation/hardhat-toolbox";

const sepoliaRpcUrl = process.env.SEPOLIA_RPC_URL;
const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;

export default {
    solidity: { version: "0.8.26", settings: { evmVersion: "cancun", optimizer: { enabled: true, runs: 1 } } },
  networks: {
    hardhat: {},
    localhost: { url: "http://127.0.0.1:8545" },
    ...(sepoliaRpcUrl ? {
      sepolia: {
        url: sepoliaRpcUrl,
        chainId: 11155111,
        accounts: deployerPrivateKey ? [deployerPrivateKey] : []
      }
    } : {})
  }
};
