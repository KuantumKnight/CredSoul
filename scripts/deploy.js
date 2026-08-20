import hre from "hardhat";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const { ethers, network } = hre;
const Factory = await ethers.getContractFactory("ReputationPassport");
const contract = await Factory.deploy();
await contract.waitForDeployment();
const address = await contract.getAddress();

const deployment = {
  contractName: "ReputationPassport",
  address,
  chainId: Number((await ethers.provider.getNetwork()).chainId),
  network: network.name,
  rpcUrl: network.name === "localhost" ? "http://127.0.0.1:8545" : process.env.SEPOLIA_RPC_URL || "",
  deployedAt: new Date().toISOString()
};

const outputPath = resolve("public/deployment.json");
await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(deployment, null, 2));
console.log(`ReputationPassport deployed to ${address}`);
console.log(`Deployment metadata written to ${outputPath}`);
