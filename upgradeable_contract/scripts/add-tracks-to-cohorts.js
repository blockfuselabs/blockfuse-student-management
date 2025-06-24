const { ethers } = require("hardhat");

async function addTracksToCohorts() {
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

    // Check if deployer is super admin
    const superAdmin = await cohortFacet.getSuperAdmin();
    console.log("👑 Super Admin:", superAdmin);
    console.log("🔑 Deployer is super admin:", deployer.address === superAdmin);

    // Get current cohort count
    const cohortCount = await cohortFacet.getCohortCount();
    console.log("📊 Total cohort count:", cohortCount.toString());

    const web2Track = 0; // web2
    const web3Track = 1; // web3

    // Add tracks to all existing cohorts
    for (let i = 1; i <= cohortCount; i++) {
      try {
        console.log(`\n🎯 Processing cohort ${i}...`);

        // Check if cohort exists and get its details
        const cohortData = await cohortFacet.getCohort(i);
        console.log(
          `   📅 Cohort ${i} dates: ${new Date(
            Number(cohortData[3]) * 1000
          ).toISOString()} to ${new Date(
            Number(cohortData[4]) * 1000
          ).toISOString()}`
        );

        // Check existing tracks
        const existingTracks = await cohortFacet.getCohortTracks(i);
        console.log(
          `   📋 Existing tracks: [${existingTracks
            .map((track) => track.toString())
            .join(", ")}]`
        );

        // Add web2 track if not already present
        if (!existingTracks.includes(web2Track)) {
          console.log(`   ➕ Adding web2 track to cohort ${i}...`);
          const addWeb2Tx = await cohortFacet.addTrackToCohort(i, web2Track);
          await addWeb2Tx.wait();
          console.log(`   ✅ Web2 track added to cohort ${i}`);
        } else {
          console.log(`   ✅ Web2 track already exists in cohort ${i}`);
        }

        // Add web3 track if not already present
        if (!existingTracks.includes(web3Track)) {
          console.log(`   ➕ Adding web3 track to cohort ${i}...`);
          const addWeb3Tx = await cohortFacet.addTrackToCohort(i, web3Track);
          await addWeb3Tx.wait();
          console.log(`   ✅ Web3 track added to cohort ${i}`);
        } else {
          console.log(`   ✅ Web3 track already exists in cohort ${i}`);
        }

        // Verify final tracks
        const finalTracks = await cohortFacet.getCohortTracks(i);
        console.log(
          `   📋 Final tracks for cohort ${i}: [${finalTracks
            .map((track) => track.toString())
            .join(", ")}]`
        );
      } catch (error) {
        console.error(`   ❌ Error processing cohort ${i}:`, error.message);
      }
    }

    console.log("\n🎉 Finished adding tracks to all cohorts!");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

if (require.main === module) {
  addTracksToCohorts()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.addTracksToCohorts = addTracksToCohorts;
