import { ethers } from 'hardhat';

async function main() {
  const blockFuseSMS = await ethers.deployContract('BlockFuseSMS');

  await blockFuseSMS.waitForDeployment();

  console.log('BlockFuseSMS Contract Deployed at ' + blockFuseSMS.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});