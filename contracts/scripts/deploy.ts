import { ethers } from "hardhat";

async function main() {
  const GitAnchor = await ethers.getContractFactory("GitAnchor");
  const gitAnchor = await GitAnchor.deploy();

  await gitAnchor.deployed();

  console.log(`GitAnchor deployed to ${gitAnchor.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
