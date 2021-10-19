import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { TokenName } from "./tokenName"

task("mint", "mint amount to account")
    .addParam("account", "the account`s address")
    .addParam("amount", "tokens amount")
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
        
        const addr = await hre.ethers.getSigners();
        await token.connect(addr[1]).mint(taskArgs.account, taskArgs.amount);
        
        console.log('mint Done!');
    });