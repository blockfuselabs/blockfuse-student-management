import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import hre from "hardhat";

  const { expect } = require("chai");
  
  describe("Deploy BlockFuseSMS", function () {
    async function deployBlockFuseSMS() {
        const [superAdmin, otherAccount, addr1, addr2, addr3] = await hre.ethers.getSigners();
    
        const BlockFuseSMSContract = await hre.ethers.getContractFactory("BlockFuseSMS");
        const BlockFuseSMS = await BlockFuseSMSContract.deploy(superAdmin);
    
    
        return { BlockFuseSMS, superAdmin, otherAccount, addr1, addr2, addr3 };
    }

    describe("Test for trackToSTring", function () {
        const Track = {
            WEB2: 0,
            WEB3: 1,
        };

        it("should return 'web2' for Track.WEB2", async function () {
            const { BlockFuseSMS } = await deployBlockFuseSMS();

            const trackString = await BlockFuseSMS.testTrackToString(Track.WEB2);
            expect(trackString).to.equal("web2");
        });
    
        it("should return 'web3' for Track.WEB3", async function () {
            const { BlockFuseSMS } = await deployBlockFuseSMS();

            const trackString = await BlockFuseSMS.testTrackToString(Track.WEB3);
            expect(trackString).to.equal("web3");
        });
    
        it("should revert for an invalid track enum value", async function () {
            const { BlockFuseSMS } = await deployBlockFuseSMS();

            await expect(BlockFuseSMS.testTrackToString(2)).to.be.reverted;
        });
    });

});