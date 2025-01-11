import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import hre from "hardhat";

  const { expect } = require("chai");
  
  describe("Deploy BlockFuseSMS", function () {
    async function deployBlockFuseSMS() {
        const [superAdmin, otherAccount] = await hre.ethers.getSigners();
    
        const BlockFuseSMSContract = await hre.ethers.getContractFactory("BlockFuseSMS");
        const BlockFuseSMS = await BlockFuseSMSContract.deploy(superAdmin);
    
    
        return { BlockFuseSMS, superAdmin, otherAccount };
    }

    describe("Test for contract deployment and owner/superAdmin", function () {
        it("Should pass if owner is correct", async function () {
          const { BlockFuseSMS, superAdmin, otherAccount} = await loadFixture(deployBlockFuseSMS);

          expect(await BlockFuseSMS.superAdmin()).to.equal(superAdmin);
        });
    
        it("Should fail if superAdmin is incorrect", async function () {
          const { BlockFuseSMS, superAdmin, otherAccount  } = await loadFixture(deployBlockFuseSMS);
    
          expect(await BlockFuseSMS.superAdmin).to.not.eq(otherAccount);
        });
        
      });

  });