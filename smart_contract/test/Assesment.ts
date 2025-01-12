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

    describe("Test for recording student assesment", function () {
        it("Should record  a student score", async function () {
            const { BlockFuseSMS, superAdmin,addr1 } = await deployBlockFuseSMS();
    
            const studentScored = 20
            
    
            // Create a cohort
            await expect(BlockFuseSMS.connect(superAdmin).recordStudentAssesment(addr1, studentScored))
                .to.emit(BlockFuseSMS, "AssessmentRecorded")
                .withArgs(2);
    
            // Verify the created cohort
            const studentId = await BlockFuseSMS.student(addr1);

            expect(studentId.finalScore).to.equal(10);
            // expect(cohort.startDate).to.equal(startDate);
            // expect(cohort.endDate).to.equal(endDate);
            // expect(cohort.duration).to.equal(endDate - startDate);
        });

        it("Should revert cohort create with error if msg.sender is not superAdmin", async function () {
            const { BlockFuseSMS, superAdmin, otherAccount } = await loadFixture(deployBlockFuseSMS);
    
            const startDate = Math.floor(Date.now() / 1000); // Current timestamp in seconds
            const endDate = startDate + 30 * 24 * 60 * 60; // 30 days later
    
            await expect(
                BlockFuseSMS.connect(otherAccount).createCohort(startDate, endDate)
            )
                .to.be.revertedWithCustomError(BlockFuseSMS, "UNAUTHORIZED_ACCESS");
        });

        it("Should revert cohort create with error if startDate is greater than endDate", async function () {
            const { BlockFuseSMS, superAdmin, otherAccount } = await loadFixture(deployBlockFuseSMS);
    
            const startDate = Math.floor(Date.now() / 1000); // Current timestamp in seconds
            const endDate = startDate - 30 * 24 * 60 * 60; // 30 days later
    
            await expect(
                BlockFuseSMS.connect(superAdmin).createCohort(startDate, endDate)
            )
                .to.be.revertedWithCustomError(BlockFuseSMS, "END_DATE_MUST_BE_GREATER_THAN_START");
        });
    });

    describe("Test for adding Tracks to cohort", function() {
        it("Should add tracks to an existing cohort", async function () {
            const { BlockFuseSMS, superAdmin } = await deployBlockFuseSMS();
    
            const startDate = Math.floor(Date.now() / 1000); // Current timestamp in seconds
            const endDate = startDate + 30 * 24 * 60 * 60; // 30 days later
    
            // Create a cohort
            await expect(BlockFuseSMS.connect(superAdmin).createCohort(startDate, endDate))
                .to.emit(BlockFuseSMS, "CohortCreated")
                .withArgs(2);
    
            // Add web3 track to the cohort
            await expect(BlockFuseSMS.connect(superAdmin).addTrackToCohort(2, 1)) // 1 corresponds to Track.web3
                .to.emit(BlockFuseSMS, "CohortTrackAdded")
                .withArgs(2, "web3");
    
            // Add web2 track to the same cohort
            await expect(BlockFuseSMS.connect(superAdmin).addTrackToCohort(2, 0)) // 0 corresponds to Track.web2
                .to.emit(BlockFuseSMS, "CohortTrackAdded")
                .withArgs(2, "web2");
    
            // Fetch cohort tracks
            const tracks = await BlockFuseSMS.getCohortTracks(2); // Assume a helper function is defined in the contract
            expect(tracks.length).to.equal(2);
            expect(tracks[0]).to.equal(1); // First track is web3
            expect(tracks[1]).to.equal(0); // Second track is web2
        });
    
        it("Should fail to add a track to a non-existent cohort", async function () {
            const { BlockFuseSMS, superAdmin } = await deployBlockFuseSMS();
    
            // Attempt to add a track to a non-existent cohort
            await expect(BlockFuseSMS.connect(superAdmin).addTrackToCohort(99, 1)) // Non-existent cohort ID
                .to.be.revertedWithCustomError(BlockFuseSMS, "COHORT_DOES_NOT_EXIST");
        });
    });

    describe("Test for geting cohorts", function () {
        const Track = {
            WEB2: 0,
            WEB3: 1,
        };

        it("should create a cohort and retrieve details with tracks and students grouped", async function () {
            const { BlockFuseSMS, superAdmin, addr1, addr2, addr3 } = await deployBlockFuseSMS();

            // Create a new cohort
            const startDate = Math.floor(Date.now() / 1000); // Current timestamp
            const endDate = startDate + 30 * 24 * 60 * 60; // 30 days later
            await BlockFuseSMS.connect(superAdmin).createCohort(startDate, endDate);
    
            // Add tracks to the cohort
            await BlockFuseSMS.connect(superAdmin).addTrackToCohort(2, Track.WEB2);
            await BlockFuseSMS.connect(superAdmin).addTrackToCohort(2, Track.WEB3);
    
            // Add students to tracks
            await BlockFuseSMS.connect(superAdmin).addStudentToCohort(2, addr1.address, Track.WEB2);
            await BlockFuseSMS.connect(superAdmin).addStudentToCohort(2, addr2.address, Track.WEB3);
            await BlockFuseSMS.connect(superAdmin).addStudentToCohort(2, addr3.address, Track.WEB2);
    
            // Fetch the cohort details
            const cohort = await BlockFuseSMS.getCohort(2);
    
            // Validate cohort data
            expect(cohort.id).to.equal(2);
            expect(cohort.tracks).to.deep.equal(["web2", "web3"]);
            expect(cohort.totalStudents).to.equal(3);
            expect(cohort.startDate).to.equal(startDate);
            expect(cohort.endDate).to.equal(endDate);
    
            // Validate students grouped by track
            const studentsByTrack = cohort.studentsByTrack;
            expect(studentsByTrack.length).to.equal(2); // Two tracks
            expect(studentsByTrack[0]).to.deep.equal([addr1.address, addr3.address]); // WEB2 students
            expect(studentsByTrack[1]).to.deep.equal([addr2.address]); // WEB3 students
        });

        it("should revert if adding a student to a non-existent track in a cohort", async function () {
            const { BlockFuseSMS, superAdmin, addr1, addr2, addr3 } = await deployBlockFuseSMS();
            
            // Create a new cohort
            const startDate = Math.floor(Date.now() / 1000); // Current timestamp
            const endDate = startDate + 30 * 24 * 60 * 60; // 30 days later
            await BlockFuseSMS.connect(superAdmin).createCohort(startDate, endDate);
    
            // Try adding a student to a non-existent track
            await expect(
                BlockFuseSMS.connect(superAdmin).addStudentToCohort(1, addr1.address, Track.WEB3)
            ).to.be.revertedWithCustomError(BlockFuseSMS, "TRACK_DOES_NOT_EXIST_IN_COHORT");
        });

        it("should revert if retrieving a non-existent cohort", async function () {
            const { BlockFuseSMS, superAdmin, addr1, addr2, addr3 } = await deployBlockFuseSMS();

            await expect(BlockFuseSMS.getCohort(99)).to.be.revertedWithCustomError(BlockFuseSMS, "COHORT_DOES_NOT_EXIST");
        });
    
        it("should revert if adding a student to a non-existent cohort", async function () {
            const { BlockFuseSMS, superAdmin, addr1, addr2, addr3 } = await deployBlockFuseSMS();
            
            await expect(
                BlockFuseSMS.connect(superAdmin).addStudentToCohort(99, addr1.address, Track.WEB2)
            ).to.be.revertedWithCustomError(BlockFuseSMS, "INVALID_COHORT_ID");
        });
    });

  });