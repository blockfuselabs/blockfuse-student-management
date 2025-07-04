const { ethers } = require("hardhat");
const { getSelectors, FacetCutAction } = require("./libraries/diamond.js");

async function upgradeFacets() {
  const diamondAddress = "0x9D498B7f357D4899139Ec5aB133Bf5B2052B7368";

  // Deploy new AdminFacet
  const AdminFacet = await ethers.getContractFactory("AdminFacet");
  const adminFacet = await AdminFacet.deploy();
  await adminFacet.deployed();
  console.log("AdminFacet deployed:", adminFacet.address);

  // Deploy new StudentFacet
  const StudentFacet = await ethers.getContractFactory("StudentFacet");
  const studentFacet = await StudentFacet.deploy();
  await studentFacet.deployed();
  console.log("StudentFacet deployed:", studentFacet.address);

  const diamondCut = await ethers.getContractAt("IDiamondCut", diamondAddress);

  const cut = [
    {
      facetAddress: adminFacet.address,
      action: FacetCutAction.Replace,
      functionSelectors: getSelectors(adminFacet),
    },
    {
      facetAddress: studentFacet.address,
      action: FacetCutAction.Replace,
      functionSelectors: getSelectors(studentFacet),
    },
  ];

  const tx = await diamondCut.diamondCut(
    cut,
    ethers.constants.AddressZero,
    "0x"
  );
  console.log("Diamond cut tx:", tx.hash);
  const receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
  console.log("Facets upgraded successfully!");
}

if (require.main === module) {
  upgradeFacets()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
