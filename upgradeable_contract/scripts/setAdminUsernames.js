const { ethers } = require("hardhat");

async function main() {
  // Diamond address - UPDATE THIS WITH YOUR DEPLOYED DIAMOND ADDRESS
  const DIAMOND_ADDRESS = "0x706F5EAC71a871144731E5231E122694BE76e4F3"; // Your deployed diamond address
  
  console.log("Setting usernames for existing admins...");
  
  // Get the signer (must be super admin)
  const [signer] = await ethers.getSigners();
  console.log(`Using signer: ${signer.address}`);
  
  // Connect to the AdminUsernameFacet through the diamond
  const adminUsernameFacet = await ethers.getContractAt('AdminUsernameFacet', DIAMOND_ADDRESS);
  
  // Get current super admin
  const superAdminAddress = await adminUsernameFacet.superAdmin();
  console.log(`Super admin address: ${superAdminAddress}`);
  
  if (signer.address.toLowerCase() !== superAdminAddress.toLowerCase()) {
    console.log("⚠️  Warning: Signer is not the super admin. Only super admin can set usernames for others.");
    console.log("You can still set your own username if you're an admin using setMyUsername()");
    return;
  }
  
  // Get all current admins
  const adminList = await adminUsernameFacet.getAllAdminsWithUsernames();
  console.log(`Found ${adminList[0].length} admins (including super admin)`);
  
  // Example: Set usernames for existing admins
  // CUSTOMIZE THIS SECTION WITH YOUR ACTUAL ADMIN ADDRESSES AND DESIRED USERNAMES
  const adminUsernames = [
    { address: superAdminAddress, username: "superadmin" },
    // Add more admins here as needed:
    // { address: "0x1234...", username: "admin1" },
    // { address: "0x5678...", username: "admin2" },
  ];
  
  console.log("\nSetting usernames...");
  
  for (const admin of adminUsernames) {
    try {
      console.log(`Setting username "${admin.username}" for ${admin.address}...`);
      const tx = await adminUsernameFacet.setAdminUsername(admin.address, admin.username);
      await tx.wait();
      console.log(`✅ Username set successfully. TX: ${tx.hash}`);
    } catch (error) {
      console.log(`❌ Failed to set username for ${admin.address}: ${error.message}`);
    }
  }
  
  // Verify the usernames were set
  console.log("\nVerifying usernames...");
  const updatedAdminList = await adminUsernameFacet.getAllAdminsWithUsernames();
  
  console.log("\nCurrent admins with usernames:");
  for (let i = 0; i < updatedAdminList[0].length; i++) {
    const address = updatedAdminList[0][i];
    const username = updatedAdminList[1][i];
    const role = address.toLowerCase() === superAdminAddress.toLowerCase() ? "Super Admin" : "Admin";
    console.log(`- ${address} (${role}): "${username}"`);
  }
  
  console.log("\n✅ Admin username setup complete!");
}

// Alternative function for individual admins to set their own username
async function setMyOwnUsername(username) {
  const DIAMOND_ADDRESS = "0x706F5EAC71a871144731E5231E122694BE76e4F3"; // Your deployed diamond address
  
  const [signer] = await ethers.getSigners();
  console.log(`Setting username for ${signer.address}...`);
  
  const adminUsernameFacet = await ethers.getContractAt('AdminUsernameFacet', DIAMOND_ADDRESS);
  
  try {
    const tx = await adminUsernameFacet.setMyUsername(username);
    await tx.wait();
    console.log(`✅ Username "${username}" set successfully. TX: ${tx.hash}`);
  } catch (error) {
    console.log(`❌ Failed to set username: ${error.message}`);
  }
}

// Usage examples:
// To run the main function: npx hardhat run scripts/setAdminUsernames.js --network <network>
// To set your own username: modify and call setMyOwnUsername("your_username")

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });