import env, { ethers, web3 } from "hardhat";
import { ContractFactory, Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Signature } from "@ethersproject/bytes";
import "@nomiclabs/hardhat-web3";

let message: string;
let signature: string;
let splitedSignatire: Signature;

let tokenFactory: ContractFactory;
let token: Contract;
let addr: SignerWithAddress[];

describe("TTests", function () {

    it("Should work", async function () {

        tokenFactory = await ethers.getContractFactory("Testt");
        token = await tokenFactory.deploy();
        addr = await ethers.getSigners();
        
        let number = 199;

        let msgOrNull = web3.utils.soliditySha3(number.toString());
        message = msgOrNull ? msgOrNull : "";

        signature = await web3.eth.sign(message, addr[9].address);

        splitedSignatire = ethers.utils.splitSignature(signature);        

        await token.testRedeem(
            number,
            addr[9].address,
            splitedSignatire.v,
            splitedSignatire.r,
            splitedSignatire.s
        );
    })
})