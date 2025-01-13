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

    describe("Test for Logging Attendance", function () {
        it("Should successfully log attendance for a student", async function () {
            const { BlockFuseSMS, superAdmin, addr1, addr3 } = await deployBlockFuseSMS();
    
            const startDate = Math.floor(Date.now() / 1000); // Current timestamp in seconds
            const endDate = startDate + 30 * 24 * 60 * 60; // 30 days later
    
            // Create a cohort
            await expect(BlockFuseSMS.connect(superAdmin).createCohort(startDate, endDate))
                .to.emit(BlockFuseSMS, "CohortCreated")
                .withArgs(2); // Cohort ID starts from 2
    
            // Add tracks to the cohort
            await expect(BlockFuseSMS.connect(superAdmin).addTrackToCohort(2, 1)) // 1 corresponds to Track.web3
                .to.emit(BlockFuseSMS, "CohortTrackAdded")
                .withArgs(2, "web3");
    
            await expect(BlockFuseSMS.connect(superAdmin).addTrackToCohort(2, 0)) // 0 corresponds to Track.web2
                .to.emit(BlockFuseSMS, "CohortTrackAdded")
                .withArgs(2, "web2");
    
            // Register a student
            const firstname = "shaaibu";
            const lastname = "suleiman";
            const twitter = "https://www.twitter.com/shaaibu";
            const linkedin = "https://www.linkedin.com/shaaibu";
            const github = "https://www.github.com/shaaibu";
            const track = 1; // Track.web3
            const cohortId = 2;
    
            await expect(BlockFuseSMS.connect(superAdmin).registerStudent(
                firstname,
                lastname,
                twitter,
                linkedin,
                github,
                track,
                cohortId,
                addr1.address
            )).to.emit(BlockFuseSMS, "StudentAddedToCohort")
                .withArgs(addr1.address, cohortId);
    
            // Log attendance for the student
            await expect(BlockFuseSMS.connect(addr1).logAttendance(
                addr1.address,
                cohortId,
                track
            )).to.emit(BlockFuseSMS, "AttendanceLogged");

            // Verify another student can not log attendance for someone
            await expect(BlockFuseSMS.connect(addr3).logAttendance(
                addr1.address,
                cohortId,
                track
            )).to.be.revertedWithCustomError(BlockFuseSMS, "UNAUTHORIZED_ACCESS");
    
            // Verify duplicate attendance logging is not allowed
            await expect(BlockFuseSMS.connect(addr1).logAttendance(
                addr1.address,
                cohortId,
                track
            )).to.be.revertedWithCustomError(BlockFuseSMS, "ALREADY_MARKED_ATTENDANCE");
        });

        it("Should successfully log attendance for a student by admin / super admin", async function () {
            const { BlockFuseSMS, superAdmin, addr1, addr2, addr3 } = await deployBlockFuseSMS();
    
            const startDate = Math.floor(Date.now() / 1000); // Current timestamp in seconds
            const endDate = startDate + 30 * 24 * 60 * 60; // 30 days later
    
            // Create a cohort
            await expect(BlockFuseSMS.connect(superAdmin).createCohort(startDate, endDate))
                .to.emit(BlockFuseSMS, "CohortCreated")
                .withArgs(2); // Cohort ID starts from 2
    
            // Add tracks to the cohort
            await expect(BlockFuseSMS.connect(superAdmin).addTrackToCohort(2, 1)) // 1 corresponds to Track.web3
                .to.emit(BlockFuseSMS, "CohortTrackAdded")
                .withArgs(2, "web3");
    
            await expect(BlockFuseSMS.connect(superAdmin).addTrackToCohort(2, 0)) // 0 corresponds to Track.web2
                .to.emit(BlockFuseSMS, "CohortTrackAdded")
                .withArgs(2, "web2");
    
            // Register a student
            const firstname = "shaaibu";
            const lastname = "suleiman";
            const twitter = "https://www.twitter.com/shaaibu";
            const linkedin = "https://www.linkedin.com/shaaibu";
            const github = "https://www.github.com/shaaibu";
            const track = 1; // Track.web3
            const cohortId = 2;
    
            await expect(BlockFuseSMS.connect(superAdmin).registerStudent(
                firstname,
                lastname,
                twitter,
                linkedin,
                github,
                track,
                cohortId,
                addr1.address
            )).to.emit(BlockFuseSMS, "StudentAddedToCohort")
                .withArgs(addr1.address, cohortId);
    
            // set addr3 as admin
            await BlockFuseSMS.connect(superAdmin).addAdmin(addr3)

            // Log attendance for the student by admin acting as addr3
            await expect(BlockFuseSMS.connect(addr3).logAttendance(
                addr1.address,
                cohortId,
                track
            )).to.emit(BlockFuseSMS, "AttendanceLogged");
        });
    
        it("Should revert if student tries to log attendance for wrong cohort or track", async function () {
            const { BlockFuseSMS, superAdmin, addr1 } = await deployBlockFuseSMS();
    
            const startDate = Math.floor(Date.now() / 1000); // Current timestamp in seconds
            const endDate = startDate + 30 * 24 * 60 * 60; // 30 days later
    
            // Create a cohort
            await BlockFuseSMS.connect(superAdmin).createCohort(startDate, endDate);
    
            // Add tracks to the cohort
            await BlockFuseSMS.connect(superAdmin).addTrackToCohort(2, 1); // Track.web3
            await BlockFuseSMS.connect(superAdmin).addTrackToCohort(2, 0); // Track.web2
    
            // Register a student
            const firstname = "shaaibu";
            const lastname = "suleiman";
            const twitter = "https://www.twitter.com/shaaibu";
            const linkedin = "https://www.linkedin.com/shaaibu";
            const github = "https://www.github.com/shaaibu";
            const track = 1; // Track.web3
            const cohortId = 2;
    
            await BlockFuseSMS.connect(superAdmin).registerStudent(
                firstname,
                lastname,
                twitter,
                linkedin,
                github,
                track,
                cohortId,
                addr1.address
            );
    
            // Attempt to log attendance for the wrong track
            await expect(BlockFuseSMS.connect(addr1).logAttendance(
                addr1.address,
                cohortId,
                0 // Track.web2
            )).to.be.revertedWithCustomError(BlockFuseSMS, "INVALID_TRACK");
    
            // Attempt to log attendance for the wrong cohort
            await expect(BlockFuseSMS.connect(addr1).logAttendance(
                addr1.address,
                3, // Invalid cohort ID
                track
            )).to.be.revertedWithCustomError(BlockFuseSMS, "INVALID_COHORT_ID");

            // disable student
            await BlockFuseSMS.connect(superAdmin).disableStudent(addr1.address);

            // confirm student is inactive
            await expect((await BlockFuseSMS.student(addr1.address)).isActive).to.equal(false);

            // Attempt to log attendance for student that is not active
            await expect(BlockFuseSMS.connect(addr1).logAttendance(
                addr1.address,
                cohortId,
                track
            )).to.be.revertedWithCustomError(BlockFuseSMS, "STUDENT_IS_NOT_ACTIVE");
        });
    });

    describe("Test for Getting Attendance by Cohort and Track", function () {
        it("Should successfully retrieve attendance records for a cohort and track", async function () {
            const { BlockFuseSMS, superAdmin, addr1, addr2, addr3 } = await deployBlockFuseSMS();
    
            const startDate = Math.floor(Date.now() / 1000); // Current timestamp in seconds
            const endDate = startDate + 30 * 24 * 60 * 60; // 30 days later
    
            // Create a cohort
            await expect(BlockFuseSMS.connect(superAdmin).createCohort(startDate, endDate))
                .to.emit(BlockFuseSMS, "CohortCreated")
                .withArgs(2); // Cohort ID starts from 2
    
            // Add tracks to the cohort
            await BlockFuseSMS.connect(superAdmin).addTrackToCohort(2, 1); // Track.web3
            await BlockFuseSMS.connect(superAdmin).addTrackToCohort(2, 0); // Track.web2
    
            // Register multiple students
            const cohortId = 2;
            const trackWeb3 = 1;
            const trackWeb2 = 0;
    
            await BlockFuseSMS.connect(superAdmin).registerStudent(
                "Alice", "Doe", "https://twitter.com/alice", "https://linkedin.com/alice", "https://github.com/alice", trackWeb3, cohortId, addr1.address
            );
            await BlockFuseSMS.connect(superAdmin).registerStudent(
                "Bob", "Smith", "https://twitter.com/bob", "https://linkedin.com/bob", "https://github.com/bob", trackWeb3, cohortId, addr2.address
            );
            await BlockFuseSMS.connect(superAdmin).registerStudent(
                "Charlie", "Brown", "https://twitter.com/charlie", "https://linkedin.com/charlie", "https://github.com/charlie", trackWeb2, cohortId, addr3.address
            );
    
            // Log attendance for students on different days
            const currentDay = Math.floor(Date.now() / 1000 / 86400); // Current day in UTC
            const nextDay = currentDay + 1;
    
            await BlockFuseSMS.connect(addr1).logAttendance(addr1.address, cohortId, trackWeb3); // Day 1
            await BlockFuseSMS.connect(addr2).logAttendance(addr2.address, cohortId, trackWeb3); // Day 1
            await ethers.provider.send("evm_increaseTime", [86400]); // Advance 1 day
            await BlockFuseSMS.connect(addr1).logAttendance(addr1.address, cohortId, trackWeb3); // Day 2
            await BlockFuseSMS.connect(addr3).logAttendance(addr3.address, cohortId, trackWeb2); // Day 2

            expect(await BlockFuseSMS.hasAttendance(addr1, cohortId, trackWeb3, currentDay)).to.equal(true);
            expect(await BlockFuseSMS.hasAttendance(addr2, cohortId, trackWeb3, currentDay)).to.equal(true);
            expect(await BlockFuseSMS.hasAttendance(addr1, cohortId, trackWeb3, nextDay)).to.equal(true);
            expect(await BlockFuseSMS.hasAttendance(addr2, cohortId, trackWeb3, nextDay)).to.equal(false);
    
            // Call the getAttendanceByCohortAndTrack function for Web3 track
            const attendanceWeb3 = await BlockFuseSMS.connect(superAdmin).getAttendanceByCohortAndTrack(cohortId, trackWeb3);
            const studentsWeb3 = attendanceWeb3[0];
            const attendanceCountsWeb3 = attendanceWeb3[1];
    
            // Validate the Web3 track attendance
            expect(studentsWeb3.length).to.equal(2); // Two students in Web3
            expect(studentsWeb3).to.include(addr1.address);
            expect(studentsWeb3).to.include(addr2.address);
            expect(attendanceCountsWeb3[0]).to.equal(2); // addr1 logged attendance twice
            expect(attendanceCountsWeb3[1]).to.equal(1); // addr2 logged attendance once
    
            // Call the getAttendanceByCohortAndTrack function for Web2 track
            const attendanceWeb2 = await BlockFuseSMS.connect(superAdmin).getAttendanceByCohortAndTrack(cohortId, trackWeb2);
            const studentsWeb2 = attendanceWeb2[0];
            const attendanceCountsWeb2 = attendanceWeb2[1];
    
            // Validate the Web2 track attendance
            expect(studentsWeb2.length).to.equal(1); // One student in Web2
            expect(studentsWeb2[0]).to.equal(addr3.address);
            expect(attendanceCountsWeb2[0]).to.equal(1); // addr3 logged attendance once
        });
    
        it("Should revert if cohort does not exist", async function () {
            const { BlockFuseSMS, superAdmin } = await deployBlockFuseSMS();
    
            await expect(
                BlockFuseSMS.connect(superAdmin).getAttendanceByCohortAndTrack(99, 1) // Non-existent cohort ID
            ).to.be.revertedWithCustomError(BlockFuseSMS, "COHORT_DOES_NOT_EXIST");
        });
    });    
    
  });