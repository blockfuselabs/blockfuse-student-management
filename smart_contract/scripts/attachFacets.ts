import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Attaching facets with account:", deployer.address);

  // Diamond contract address
  const DIAMOND_ADDRESS = "0x4746316702460F73E001800dd9e68188550cdF74";

  // Facet addresses from your deployment
  const DIAMOND_CUT_FACET = "0x16000BA69D3dff4E46ee8E80F5F9Af4412F69A3F";
  const DIAMOND_LOUPE_FACET = "0x07e92001078A953f288F0957c27Eb24915936442";
  const OWNERSHIP_FACET = "0x4aeA4a903666b5187c6836d2400aF6B2c45d6530";
  const ADMIN_FACET = "0x6dea48c9f11d3028B6f37CB32430Ae16aaf15727";
  const STUDENT_FACET = "0x09664EA5088E61a81CC6017cA52a59A5d4641e3A";
  const COHORT_FACET = "0xdCc0C034e2051059BBAAecE55FE9D504698bf83A";

  // Get the Diamond contract
  const diamond = await ethers.getContractAt("IDiamondCut", DIAMOND_ADDRESS);

  // Prepare the facet cuts
  const cuts = [
    // DiamondCutFacet (should already be attached)
    {
      facetAddress: DIAMOND_CUT_FACET,
      action: 0, // Add
      functionSelectors: [
        "0x1f931c1c", // diamondCut
        "0xcdffacc6", // facetFunctionSelectors
        "0x52ef6b2c", // facets
        "0xadfca15e", // facetAddress
        "0x7a0ed627", // facetAddresses
        "0x01ffc9a7", // supportsInterface
      ],
    },
    // DiamondLoupeFacet
    {
      facetAddress: DIAMOND_LOUPE_FACET,
      action: 0, // Add
      functionSelectors: [
        "0xcdffacc6", // facetFunctionSelectors
        "0x52ef6b2c", // facets
        "0xadfca15e", // facetAddress
        "0x7a0ed627", // facetAddresses
        "0x01ffc9a7", // supportsInterface
      ],
    },
    // OwnershipFacet
    {
      facetAddress: OWNERSHIP_FACET,
      action: 0, // Add
      functionSelectors: [
        "0x8da5cb5b", // owner
        "0xf2fde38b", // transferOwnership
      ],
    },
    // AdminFacet
    {
      facetAddress: ADMIN_FACET,
      action: 0, // Add
      functionSelectors: [
        "0x5db6a9c5", // getAllAdmins
        "0x4e73e355", // addAdmin
        "0x429b62e5", // removeAdmin
        "0x1785f53c", // registerStudent
        "0x1e4e83c5", // addStudentToCohort
        "0x70480275", // recordStudentAssesment
        "0x768d906d", // replaceStudentWallet
        "0x821faf7c", // enableStudent
        "0x9830bd99", // disableStudent
        "0x9a48b315", // isStudentActive
      ],
    },
    // StudentFacet
    {
      facetAddress: STUDENT_FACET,
      action: 0, // Add
      functionSelectors: [
        "0x567d079e", // getStudent
        "0x5db6a9c5", // getStudentAssesments
        "0x65c667dc", // getStudentAttendance
        "0x6b7b44d7", // logAttendance
        "0x70699d52", // getAttendanceByCohortAndTrack
      ],
    },
    // CohortFacet
    {
      facetAddress: COHORT_FACET,
      action: 0, // Add
      functionSelectors: [
        "0x8204c326", // createCohort
        "0x821faf7c", // addTrackToCohort
        "0xd068f425", // getCohort
        "0xe30b9184", // getCohortCount
        "0x3567d079e", // getCohortTracks
        "0x5db6a9c5", // getSuperAdmin
      ],
    },
  ];

  // Execute the diamondCut
  console.log("Executing diamondCut to attach facets...");

  for (const cut of cuts) {
    try {
      console.log(`Attaching facet: ${cut.facetAddress}`);
      const tx = await diamond.diamondCut(
        [cut],
        ethers.ZeroAddress, // No init contract
        "0x" // No init data
      );
      await tx.wait();
      console.log(`✅ Facet ${cut.facetAddress} attached successfully`);
    } catch (error) {
      console.error(`❌ Failed to attach facet ${cut.facetAddress}:`, error);
    }
  }

  console.log("Facet attachment completed!");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exitCode = 1;
});
