const { ethers } = require("hardhat");

async function main() {
  const [signer] = await ethers.getSigners();
  const balance = await signer.getBalance();
  
  console.log(`Wallet Address: ${signer.address}`);
  console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH`);
  
  // Check if balance is sufficient for deployment (rough estimate)
  const minRequired = ethers.utils.parseEther("0.01"); // 0.01 ETH
  
  if (balance.lt(minRequired)) {
    console.log("⚠️  WARNING: Balance may be insufficient for deployment");
    console.log(`Minimum recommended: ${ethers.utils.formatEther(minRequired)} ETH`);
  } else {
    console.log("✅ Balance appears sufficient for deployment");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });