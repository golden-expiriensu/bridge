import { ethers } from "hardhat";
import { parseEther } from "@ethersproject/units"

const tokenName = "BridgeToken";

async function main() {
  
  const addr = await ethers.getSigners();
  const FToken = await ethers.getContractFactory(tokenName);
  const token = await FToken.connect(addr[1]).deploy(parseEther("1000000"));
  console.log(`Deploying ${tokenName}...`);

  await token.deployed();

  console.log(`${tokenName} deployed to: ${token.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
