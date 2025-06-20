import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import hre from "hardhat";

  const { expect } = require("chai");
  
  describe("Register Sudent", function () {
    async function deployBlockFuseSMS() {
        const [superAdmin, otherAccount, addr1, addr2, addr3] = await hre.ethers.getSigners();
    
        const BlockFuseSMSContract = await hre.ethers.getContractFactory("BlockFuseSMS");
        const BlockFuseSMS = await BlockFuseSMSContract.deploy();
    
    
        return { BlockFuseSMS, superAdmin, otherAccount, addr1, addr2, addr3 };
    }

    describe("Test for onboarding students to a cohort", function () {
        it("Should register a student for a specific cohort successfully", async function () {
            const { BlockFuseSMS, superAdmin, addr1 } = await deployBlockFuseSMS();

            // Create a cohort before onboarding a student
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
    
            const firstname = "shaaibu";
            const lastname = "suleiman";
            const twitter = "https://www.twitter.com/shaaibu";
            const linkedin = "https://www.linkedin.com/shaaibu";
            const github = "https://www.github.com/shaaibu";
            const track = 0;
            const cohortId = 2;

            await expect(BlockFuseSMS.connect(superAdmin).registerStudent(
                firstname,
                lastname,
                twitter,
                linkedin,
                github,
                track,
                cohortId,
                addr1
            )).to.emit(BlockFuseSMS, "StudentAddedToCohort").withArgs(
                addr1,
                cohortId
            )
        });


        it("Should fail if non admin tries registering a student for a cohort", async function () {
            const { BlockFuseSMS, superAdmin, addr1 } = await deployBlockFuseSMS();

            // Create a cohort before onboarding a student
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

            const firstname = "shaaibu";
            const lastname = "suleiman";
            const twitter = "https://www.twitter.com/shaaibu";
            const linkedin = "https://www.linkedin.com/shaaibu";
            const github = "https://www.github.com/shaaibu";
            const track = 0;
            const cohortId = 2;

            await expect(BlockFuseSMS.connect(addr1).registerStudent(
                firstname,
                lastname,
                twitter,
                linkedin,
                github,
                track,
                cohortId,
                addr1
            )).to.revertedWithCustomError(BlockFuseSMS, "UNAUTHORIZED_ACCESS")
        }); 
    });


    it("Should register a student for a specific cohort successfully and retrieve student data", async function () {
        const { BlockFuseSMS, superAdmin, addr1 } = await deployBlockFuseSMS();

        // Create a cohort before onboarding a student
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

        const firstname = "shaaibu";
        const lastname = "suleiman";
        const twitter = "https://www.twitter.com/shaaibu";
        const linkedin = "https://www.linkedin.com/shaaibu";
        const github = "https://www.github.com/shaaibu";
        const track = 0;
        const cohortId = 2;

        const onboardStudent = await BlockFuseSMS.connect(superAdmin).registerStudent(
            firstname,
            lastname,
            twitter,
            linkedin,
            github,
            track,
            cohortId,
            addr1
        );

        expect((await BlockFuseSMS.getStudent(addr1)).firstname).to.eq(firstname);
        expect((await BlockFuseSMS.getStudent(addr1)).lastname).to.eq(lastname);
        expect((await BlockFuseSMS.getStudent(addr1)).twitter).to.eq(twitter);
        expect((await BlockFuseSMS.getStudent(addr1)).linkedin).to.eq(linkedin);
        expect((await BlockFuseSMS.getStudent(addr1)).isActive).to.eq(true);
        expect((await BlockFuseSMS.getStudent(addr1)).studentAddress).to.eq(addr1);
        expect((await BlockFuseSMS.getStudent(addr1)).finalScore).to.eq(0);
        expect((await BlockFuseSMS.getStudent(addr1)).username).to.eq(firstname + " " + lastname);
    });

    it("Should retrieve students by cohort and track successfully", async function () {
        const { BlockFuseSMS, superAdmin, addr1, addr2, addr3 } = await deployBlockFuseSMS();
    
        // Create a cohort
        const startDate = Math.floor(Date.now() / 1000); // Current timestamp in seconds
        const endDate = startDate + 30 * 24 * 60 * 60; // 30 days later
        await expect(BlockFuseSMS.connect(superAdmin).createCohort(startDate, endDate))
            .to.emit(BlockFuseSMS, "CohortCreated")
            .withArgs(2);
    
        // Add web3 track to the cohort
        await expect(BlockFuseSMS.connect(superAdmin).addTrackToCohort(2, 1)) // 1 corresponds to Track.web3
            .to.emit(BlockFuseSMS, "CohortTrackAdded")
            .withArgs(2, "web3");
    
        // Register students to the web3 track in cohort 2
        await BlockFuseSMS.connect(superAdmin).registerStudent(
            "John", "Doe", 
            "https://twitter.com/johndoe", 
            "https://linkedin.com/johndoe", 
            "https://github.com/johndoe", 
            1, // Track.web3
            2, // Cohort ID
            addr1
        );
    
        await BlockFuseSMS.connect(superAdmin).registerStudent(
            "Jane", "Smith", 
            "https://twitter.com/janesmith", 
            "https://linkedin.com/janesmith", 
            "https://github.com/janesmith", 
            1, // Track.web3
            2, // Cohort ID
            addr2
        );
    
        // Retrieve students by cohort ID and track
        const students = await BlockFuseSMS.getStudentsByCohortAndTrack(2, 1); // Cohort 2, Track.web3
    
        // Validate the retrieved student details
        expect(students.length).to.eq(2);
    
        // Validate details of the first student
        expect(students[0].firstname).to.eq("John");
        expect(students[0].lastname).to.eq("Doe");
        expect(students[0].studentAddress).to.eq(addr1);
    
        // Validate details of the second student
        expect(students[1].firstname).to.eq("Jane");
        expect(students[1].lastname).to.eq("Smith");
        expect(students[1].studentAddress).to.eq(addr2);
    });
    
  });