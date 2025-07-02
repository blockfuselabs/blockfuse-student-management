const { ethers } = require("hardhat");
const { getSelectors, FacetCutAction } = require('./libraries/diamond.js');

async function main() {
  const DIAMOND_ADDRESS = "0x706F5EAC71a871144731E5231E122694BE76e4F3"; 
  
  console.log("Adding AdminUsernameFacet to diamond...");
  
  // Get the diamond cut facet
  const diamondCutFacet = await ethers.getContractAt('IDiamondCut', DIAMOND_ADDRESS);
  
  // Deploy the new AdminUsernameFacet
  console.log("Deploying AdminUsernameFacet...");
  const AdminUsernameFacet = await ethers.getContractFactory('AdminUsernameFacet');
  const adminUsernameFacet = await AdminUsernameFacet.deploy();
  await adminUsernameFacet.deployed();
  console.log(`AdminUsernameFacet deployed: ${adminUsernameFacet.address}`);
  
  // Get the function selectors for the new facet
  const selectors = getSelectors(adminUsernameFacet);
  console.log("Function selectors:", selectors);
  
  // Create the facet cut
  const cut = [{
    facetAddress: adminUsernameFacet.address,
    action: FacetCutAction.Add,
    functionSelectors: selectors
  }];
  
  // Execute the diamond cut
  console.log("Executing diamond cut...");
  const tx = await diamondCutFacet.diamondCut(cut, ethers.constants.AddressZero, "0x");
  const receipt = await tx.wait();
  
  if (!receipt.status) {
    throw Error(`Diamond
       upgrade failed: ${tx.hash}`);
  }
  
  console.log("Diamond cut successful!");
  console.log(`Transaction hash: ${tx.hash}`);
  console.log(`Gas used: ${receipt.gasUsed}`);
  
  // Verify the facet was added
  console.log("\nVerifying facet addition...");
  const diamondLoupe = await ethers.getContractAt('IDiamondLoupe', DIAMOND_ADDRESS);
  const facets = await diamondLoupe.facets();
  
  console.log("\nCurrent facets in diamond:");
  for (const facet of facets) {
    console.log(`- ${facet.facetAddress}: ${facet.functionSelectors.length} functions`);
  }
  
  // Test the new functionality
  console.log("\nTesting new admin username functionality...");
  const adminFacet = await ethers.getContractAt('AdminUsernameFacet', DIAMOND_ADDRESS);
  
  try {
    // Get current super admin
    const superAdminAddress = await adminFacet.superAdmin();
    console.log(`Super admin address: ${superAdminAddress}`);
    
    // Get current admin list
    const adminList = await adminFacet.getAllAdminsWithUsernames();
    console.log(`Current admins: ${adminList[0].length}`);
    console.log("Admin addresses and usernames:");
    for (let i = 0; i < adminList[0].length; i++) {
      console.log(`- ${adminList[0][i]}: "${adminList[1][i]}"`);
    }
  } catch (error) {
    console.log("Note: Some functions require admin privileges to test");
  }
  
  console.log("\n✅ AdminUsernameFacet successfully added to diamond!");
  console.log("\nAvailable new functions:");
  console.log("- setAdminUsername(address, string): Super admin sets username for any admin");
  console.log("- setMyUsername(string): Admin sets their own username");
  console.log("- getAdminUsername(address): Get username for an admin");
  console.log("- getAllAdminsWithUsernames(): Get all admins with their usernames");
  console.log("- addAdminWithUsername(address, string): Add new admin with username");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });