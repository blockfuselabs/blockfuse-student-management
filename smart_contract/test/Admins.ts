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

    describe("Test for adding admins", function () {
        it("Should create new admin if msg.sender is superAdmin", async function () {
          const { BlockFuseSMS, superAdmin, otherAccount} = await loadFixture(deployBlockFuseSMS);

          expect(await BlockFuseSMS.connect(superAdmin).addAdmin(otherAccount.address)).to.emit(BlockFuseSMS, 'AdminAdded').withArgs(otherAccount.address);
        });

        it("Should revert with custom error if msg.sender is not superAdmin", async function () {
            const { BlockFuseSMS, superAdmin, otherAccount} = await loadFixture(deployBlockFuseSMS);
  
            await expect(
                BlockFuseSMS.connect(otherAccount).addAdmin(otherAccount.address)
            ).to.be.revertedWithCustomError(BlockFuseSMS, "UNAUTHORIZED_ACCESS");
        });
    });

    describe("Test for removing admins", function () {
        it("Should remove admin if admin exists and msg.sender is superAdmin", async function () {
          const { BlockFuseSMS, superAdmin, otherAccount} = await loadFixture(deployBlockFuseSMS);

          expect(await BlockFuseSMS.connect(superAdmin).addAdmin(otherAccount.address)).to.emit(BlockFuseSMS, 'AdminAdded').withArgs(otherAccount.address);

          expect( await BlockFuseSMS.connect(superAdmin).removeAdmin(otherAccount.address)).to.emit(BlockFuseSMS, 'AdminRemoved').withArgs(otherAccount.address)
        });

        it("Should revert with custom error if msg.sender is not superAdmin", async function () {
            const { BlockFuseSMS, superAdmin, otherAccount} = await loadFixture(deployBlockFuseSMS);
            
            expect(await BlockFuseSMS.connect(superAdmin).addAdmin(otherAccount.address)).to.emit(BlockFuseSMS, 'AdminAdded').withArgs(otherAccount.address);

            await expect(
                BlockFuseSMS.connect(otherAccount).removeAdmin(otherAccount.address)
            ).to.be.revertedWithCustomError(BlockFuseSMS, "UNAUTHORIZED_ACCESS");
        });
    });

  });