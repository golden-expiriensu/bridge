import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import { formatEther } from "@ethersproject/units";
import { TokenName } from "./tokenName"

task("balanceOf", "balance of account")
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
        
        console.log(`Account ${taskArgs.account}
        has ${formatEther(await token.balanceOf(taskArgs.account))} tokens on balance`);
    });