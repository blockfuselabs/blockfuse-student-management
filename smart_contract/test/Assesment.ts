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

            const firstname = "GoldenVoice";
            const lastname = "Yilkash";
            const twitter = "https://www.twitter.com/dimkayilrit";
            const linkedin = "https://www.linkedin.com/dimka";
            const github = "https://www.github.com/dimka90";
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
            // Adding student scores
            const firstAssesmentScore = 20
            const tx = await BlockFuseSMS.connect(superAdmin).recordStudentAssesment(
                addr1,
                firstAssesmentScore
                );
            // Wait for the transaction receipt to get the block.timestamp
            const receipt = await tx.wait();
            const block = await hre.ethers.provider.getBlock(receipt.blockNumber);
            await expect(tx)
                .to.emit(BlockFuseSMS, "AssessmentRecorded")
                .withArgs(addr1,
                    firstAssesmentScore,
                    firstAssesmentScore,
                    block?.timestamp,
                    superAdmin
                );
            
            const studentId = await BlockFuseSMS.student(addr1);
            const studentAssessments = await BlockFuseSMS.getStudentAssesments(addr1);
            const studentScoredByIndex = await BlockFuseSMS.getStudentScoreByIndex(addr1,0);
            
            expect(studentId.finalScore).to.equal(firstAssesmentScore);
            expect(studentAssessments[0]).equal(firstAssesmentScore);
            expect(studentScoredByIndex).equal(firstAssesmentScore)

            const secondAssesmentScored = 20
            const studentTotalScore = firstAssesmentScore + secondAssesmentScored;
            const tx2= await BlockFuseSMS.connect(superAdmin).recordStudentAssesment(
                addr1,
                secondAssesmentScored
            );
            const receipt2 = await tx2.wait();
            const block2 = await hre.ethers.provider.getBlock(receipt2.blockNumber);
            // Create a cohort
            await expect(tx2)
                .to.emit(BlockFuseSMS, "AssessmentRecorded")
                .withArgs(
                    addr1,
                    secondAssesmentScored,
                    studentTotalScore,
                    block2?.timestamp,
                    superAdmin
                );
                
                const studentId2 = await BlockFuseSMS.student(addr1);
                const secondStudentAssessments = await BlockFuseSMS.getStudentAssesments(addr1);
                const secondStudentScoredByIndex = await BlockFuseSMS.getStudentScoreByIndex(addr1,0);
               
                expect(studentId2.finalScore).to.equal(studentTotalScore);
                expect(secondStudentAssessments[1]).equal(secondAssesmentScored);
                expect(secondStudentScoredByIndex).equal(secondAssesmentScored)
                
        });

    });

    it("Should record a negative  score for a student", async function () {
        const { BlockFuseSMS, superAdmin,addr1 } = await deployBlockFuseSMS();

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

        const firstname = "GoldenVoice";
        const lastname = "Yilkash";
        const twitter = "https://www.twitter.com/dimkayilrit";
        const linkedin = "https://www.linkedin.com/dimka";
        const github = "https://www.github.com/dimka90";
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

        // Adding student scores
        const firstAssesmentScore = 50
        const tx = await BlockFuseSMS.connect(superAdmin).recordStudentAssesment(
            addr1,
            firstAssesmentScore
            );

        // Wait for the transaction receipt to get the block.timestamp
        const receipt = await tx.wait();
        const block = await hre.ethers.provider.getBlock(receipt.blockNumber);
        await expect(tx)
            .to.emit(BlockFuseSMS, "AssessmentRecorded")
            .withArgs(addr1,
                firstAssesmentScore,
                firstAssesmentScore,
                block?.timestamp,
                superAdmin
            );
        
        const studentId = await BlockFuseSMS.student(addr1);
        const studentAssessments = await BlockFuseSMS.getStudentAssesments(addr1);
        const studentScoredByIndex = await BlockFuseSMS.getStudentScoreByIndex(addr1,0);
        
        expect(studentId.finalScore).to.equal(firstAssesmentScore);
        expect(studentAssessments[0]).equal(firstAssesmentScore);
        expect(studentScoredByIndex).equal(firstAssesmentScore);

        const secondAssesmentScored = -20
        const studentTotalScore = firstAssesmentScore + secondAssesmentScored;
        const tx2= await BlockFuseSMS.connect(superAdmin).recordStudentAssesment(
            addr1,
            secondAssesmentScored
        );
        const receipt2 = await tx2.wait();
        const block2 = await hre.ethers.provider.getBlock(receipt2.blockNumber);
        // Create a cohort
        await expect(tx2)
            .to.emit(BlockFuseSMS, "AssessmentRecorded")
            .withArgs(
                addr1,
                secondAssesmentScored,
                studentTotalScore,
                block2?.timestamp,
                superAdmin
            );
            
            const studentId2 = await BlockFuseSMS.student(addr1);
            const secondStudentAssessments = await BlockFuseSMS.getStudentAssesments(addr1);
            const secondStudentScoredByIndex = await BlockFuseSMS.getStudentScoreByIndex(addr1,1);
           
            expect(studentId2.finalScore).to.equal(studentTotalScore);
            expect(secondStudentAssessments[1]).equal(secondAssesmentScored);
            expect(secondStudentScoredByIndex).equal(secondAssesmentScored)
            // firstAssesmet-secondAssesment = 50-20 = 30
            expect(studentId2.finalScore).to.equal(30)
        });
  });