const { ethers } = require("hardhat");

async function testStudentRegistration() {
  const diamondAddress = "0x706F5EAC71a871144731E5231E122694BE76e4F3";

  try {
    // Get the signers
    const [deployer] = await ethers.getSigners();
    console.log("🔑 Testing with account:", deployer.address);

    // Get the contracts
    const cohortFacet = await ethers.getContractAt(
      "CohortFacet",
      diamondAddress
    );
    const adminFacet = await ethers.getContractAt("AdminFacet", diamondAddress);

    // Check if deployer is super admin
    const superAdmin = await cohortFacet.getSuperAdmin();
    console.log("👑 Super Admin:", superAdmin);
    console.log("🔑 Deployer is super admin:", deployer.address === superAdmin);

    // Get current cohort count
    const currentCohortCount = await cohortFacet.getCohortCount();
    console.log("📊 Current cohort count:", currentCohortCount.toString());

    // Create a new cohort
    console.log("\n🚀 Creating new cohort...");
    const startDate = Math.floor(Date.now() / 1000);
    const endDate = startDate + 30 * 24 * 60 * 60; // 30 days later

    const createCohortTx = await cohortFacet.createCohort(startDate, endDate);
    await createCohortTx.wait();

    const newCohortCount = await cohortFacet.getCohortCount();
    console.log("✅ New cohort created with ID:", newCohortCount.toString());

    // Add tracks to the cohort
    console.log("\n🎯 Adding tracks to cohort...");
    const web2Track = 0; // web2
    const web3Track = 1; // web3

    const addWeb2TrackTx = await cohortFacet.addTrackToCohort(
      newCohortCount,
      web2Track
    );
    await addWeb2TrackTx.wait();
    console.log("✅ Web2 track added to cohort");

    const addWeb3TrackTx = await cohortFacet.addTrackToCohort(
      newCohortCount,
      web3Track
    );
    await addWeb3TrackTx.wait();
    console.log("✅ Web3 track added to cohort");

    // Verify tracks were added
    const cohortTracks = await cohortFacet.getCohortTracks(newCohortCount);
    console.log(
      "📋 Cohort tracks:",
      cohortTracks.map((track) => track.toString())
    );

    // Now try to register a student
    console.log("\n👨‍🎓 Registering student...");
    const studentAddress = "0x8e07cfdba4d4f3b289d91769d20ce88ae8bd363b";

    const studentDetails = {
      firstname: "Gar",
      lastname: "Michael",
      username: "gar_michael",
      twitter: "https://twitter.com/gar_manji",
      linkedin: "https://linkedin.com/in/gar_manji_michael",
      github: "https://github.com/mbragi",
      track: web2Track, // Use web2 track that we just added
      cohort: newCohortCount,
      isActive: true,
      finalScore: 0,
      studentAddress: studentAddress,
    };

    const registerStudentTx = await adminFacet.registerStudent(studentDetails);
    await registerStudentTx.wait();
    console.log("✅ Student registered successfully!");

    // Verify student is active
    const isActive = await adminFacet.isStudentActive(studentAddress);
    console.log("✅ Student active status:", isActive);
  } catch (error) {
    console.error("❌ Error:", error.message);

    // Try to get more details about the error
    if (error.data) {
      console.error("Error data:", error.data);
    }
    if (error.reason) {
      console.error("Error reason:", error.reason);
    }
  }
}

if (require.main === module) {
  testStudentRegistration()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.testStudentRegistration = testStudentRegistration;
