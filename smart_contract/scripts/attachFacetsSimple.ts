import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Attaching facets with account:", deployer.address);

  // Diamond contract address
  const DIAMOND_ADDRESS = "0x4746316702460F73E001800dd9e68188550cdF74";

  // Facet addresses from your deployment
  const ADMIN_FACET = "0x6dea48c9f11d3028B6f37CB32430Ae16aaf15727";
  const STUDENT_FACET = "0x09664EA5088E61a81CC6017cA52a59A5d4641e3A";
  const COHORT_FACET = "0xdCc0C034e2051059BBAAecE55FE9D504698bf83A";

  // Get the Diamond contract
  const diamond = await ethers.getContractAt("IDiamondCut", DIAMOND_ADDRESS);

  // Get the facet contracts to extract function selectors
  const adminFacet = await ethers.getContractAt("AdminFacet", ADMIN_FACET);
  const studentFacet = await ethers.getContractAt(
    "StudentFacet",
    STUDENT_FACET
  );
  const cohortFacet = await ethers.getContractAt("CohortFacet", COHORT_FACET);

  // Get function selectors from the facets
  const adminSelectors = getSelectors(adminFacet);
  const studentSelectors = getSelectors(studentFacet);
  const cohortSelectors = getSelectors(cohortFacet);

  console.log("Admin selectors:", adminSelectors);
  console.log("Student selectors:", studentSelectors);
  console.log("Cohort selectors:", cohortSelectors);

  // Prepare the facet cuts
  const cuts = [
    {
      facetAddress: ADMIN_FACET,
      action: 0, // Add
      functionSelectors: adminSelectors,
    },
    {
      facetAddress: STUDENT_FACET,
      action: 0, // Add
      functionSelectors: studentSelectors,
    },
    {
      facetAddress: COHORT_FACET,
      action: 0, // Add
      functionSelectors: cohortSelectors,
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

// Helper function to get function selectors from a contract
function getSelectors(contract: any): string[] {
  const selectors: string[] = [];

  // Get all function fragments from the contract interface
  const functions = contract.interface.fragments.filter(
    (fragment: any) => fragment.type === "function"
  );

  for (const func of functions) {
    const selector = contract.interface.getSighash(func);
    selectors.push(selector);
    console.log(`Function: ${func.name} -> Selector: ${selector}`);
  }

  return selectors;
}

main().catch((error) => {
  console.error("Error:", error);
  process.exitCode = 1;
});
