import { expect } from "chai";
import env, { ethers } from "hardhat";
import { parseEther } from "@ethersproject/units";
import { ContractFactory, Contract } from "@ethersproject/contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Signature } from "@ethersproject/bytes";
import "@nomiclabs/hardhat-web3";

let message: string;
let signature: string;
let splitedSignatire: Signature;

let addr: SignerWithAddress[];
let tokenFactory: ContractFactory;
let tokenEth: Contract;
let tokenBsc: Contract;
let bridgeFactory: ContractFactory;
let bridgeEth: Contract;
let bridgeBsc: Contract;

const ethChainId = 4;
const bscChainId = 97;
const tokenSymbol = "BGT";

describe("Bridge tests", function () {

    this.beforeEach(async function () {

        tokenFactory = await ethers.getContractFactory("BridgeToken");
        tokenEth = await tokenFactory.deploy(parseEther("1000"));
        tokenBsc = await tokenFactory.deploy(parseEther("1000"));
        bridgeFactory = await ethers.getContractFactory("Bridge");
        bridgeEth = await bridgeFactory.deploy(ethChainId);
        bridgeBsc = await bridgeFactory.deploy(bscChainId);
        addr = await ethers.getSigners();

        await tokenEth.transfer(addr[5].address, parseEther("500"));
        await tokenBsc.transfer(addr[5].address, parseEther("500"));

        await bridgeEth.grantRole(await bridgeEth.ADMIN_ROLE(), addr[9].address);
        await bridgeBsc.grantRole(await bridgeBsc.ADMIN_ROLE(), addr[9].address);
        await tokenEth.grantRole(await tokenEth.MINTER_ROLE(), bridgeEth.address);
        await tokenEth.grantRole(await tokenEth.BURNER_ROLE(), bridgeEth.address);
        await tokenBsc.grantRole(await tokenBsc.MINTER_ROLE(), bridgeBsc.address);
        await tokenBsc.grantRole(await tokenBsc.BURNER_ROLE(), bridgeBsc.address);
    });

    describe("1) Add functions", function () {

        it("a) Should forbid to swap due to chainTo is not available", async function () {

            await expect(bridgeEth.swap(
                100,
                0,
                addr[5].address,
                bscChainId,
                tokenSymbol
            )).to.be.revertedWith("swap: chainTo is not available");
        })

        it("b) Should forbid to swap due to chainTo = chainId", async function () {

            await bridgeEth.addChain(ethChainId);
            await expect(bridgeEth.swap(
                100,
                0,
                addr[5].address,
                ethChainId,
                tokenSymbol
            )).to.be.revertedWith("swap: chainId and chainTo are the same");
        })

        it("c) Should forbid to swap due to token is undefined", async function () {

            await bridgeEth.addChain(bscChainId);
            await expect(bridgeEth.swap(
                100,
                0,
                addr[5].address,
                bscChainId,
                tokenSymbol
            )).to.be.revertedWith("swap: token symbol cannot be found");
        })

        it("d) Should allow to swap", async function () {

            await bridgeEth.addChain(bscChainId);
            await bridgeEth.addToken(tokenSymbol, tokenEth.address);
            await bridgeEth.swap(
                100,
                0,
                addr[5].address,
                bscChainId,
                tokenSymbol
            );
        })
    })

    describe("2) Swap", function () {

        it("a) Should burn 100 tokens from address after swap", async function () {

            expect(await tokenEth.balanceOf(addr[5].address)).to.be.equal(parseEther("500"));
            
            await bridgeEth.addChain(bscChainId);
            await bridgeEth.addToken(tokenSymbol, tokenEth.address);

            await bridgeEth.connect(addr[5]).swap(
                parseEther("100"),
                0,
                addr[5].address,
                bscChainId,
                tokenSymbol
            );

            expect(await tokenEth.balanceOf(addr[5].address)).to.be.equal(parseEther("400"));
        })
    })

    describe("3) Redeem", function () {

        it("a) Redeem should mint 100 tokens", async function () {

            expect(await tokenEth.balanceOf(addr[5].address)).to.be.equal(parseEther("500"));
            
            await bridgeBsc.init(addr[9].address);
            await bridgeBsc.addToken(tokenSymbol, tokenBsc.address);

            let msgOrNull = env.web3.utils.soliditySha3(10**20, 0, addr[5].address, ethChainId, bscChainId, tokenSymbol);
            message = msgOrNull ? msgOrNull : "";
            signature = await env.web3.eth.sign(message, addr[9].address);
            splitedSignatire = ethers.utils.splitSignature(signature);

            await bridgeBsc.redeem(
                parseEther("100"),
                0,
                addr[5].address,
                ethChainId,
                bscChainId,
                tokenSymbol,
                splitedSignatire.v,
                splitedSignatire.r,
                splitedSignatire.s
            );

            expect(await tokenBsc.balanceOf(addr[5].address)).to.be.equal(parseEther("600"));
        });
    })
})