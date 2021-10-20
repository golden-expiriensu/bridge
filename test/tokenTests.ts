import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { parseEther } from "@ethersproject/units";

let tokenFactory: ContractFactory;
let token: Contract;
let addr: SignerWithAddress[];

describe("Token tests", function () {

    beforeEach(async function () {

        tokenFactory = await ethers.getContractFactory("BridgeToken");
        token = await tokenFactory.deploy(parseEther("10"));
        addr = await ethers.getSigners();
    });

    describe("1) Main functions", function () {

        it("Should transfer 10 tokens from addr1 to addr2 and show balance of addr1 and addr2", async function () {

            await token.transfer(addr[1].address, parseEther("4"));
            expect(await token.balanceOf(addr[0].address)).to.equal(parseEther("6"));
            expect(await token.balanceOf(addr[1].address)).to.equal(parseEther("4"));
        })
    })

    describe("2) Mint and burner role tests", function () {

        it("a) Should forbid to mint from account without MINTER_ROLE", async function () {

            await expect(token.connect(addr[5]).mint(addr[5].address, parseEther("1"))).to.be.revertedWith(
                `AccessControl: account ${addr[5].address.toLowerCase()} is missing role ${await token.MINTER_ROLE()}`
                );
        })

        it("b) Should forbid to burn from account without BURNER_ROLE", async function () {

            await expect(token.connect(addr[5]).burn(addr[5].address, parseEther("1"))).to.be.revertedWith(
                `AccessControl: account ${addr[5].address.toLowerCase()} is missing role ${await token.BURNER_ROLE()}`
                );
        })

        it("c) Should add minter role to addr[5]", async function () {

            await token.grantRole(await token.MINTER_ROLE(), addr[5].address);
            await token.connect(addr[5]).mint(addr[5].address, parseEther("1"))
            expect(await token.balanceOf(addr[5].address)).to.equal(parseEther("1"));            
        })

        it("d) Should add burner role to addr[5]", async function () {

            await token.transfer(addr[5].address, parseEther("3"));
            await token.grantRole(await token.BURNER_ROLE(), addr[5].address);
            await token.connect(addr[5]).burn(addr[5].address, parseEther("1"))
            expect(await token.balanceOf(addr[5].address)).to.equal(parseEther("2"));            
        })
    })
})