import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { TokenName } from "./tokenName"

task("addBurner", "adds new minter from owner account")
    .addParam("account", "the account`s address")
    .setAction(async function (taskArgs, hre) {

        const network = hre.network.name;
        console.log(network);
        const fs = require('fs');
        const dotenv = require('dotenv');
        
        const envConfig = dotenv.parse(fs.readFileSync(`.env-${network}`))
        for (const k in envConfig) {
            process.env[k] = envConfig[k]
        }
        const token = await hre.ethers.getContractAt(TokenName, process.env.TOKEN_ADDR as string);
        console.log(`token = ${token.address}`);
        
        console.log(`granting ${taskArgs.account} burner role...`);
        const addr = await hre.ethers.getSigners();
        await token.connect(addr[1]).grantRole(await token.BURNER_ROLE, taskArgs.account);

        console.log('addBurner Done!');
    });