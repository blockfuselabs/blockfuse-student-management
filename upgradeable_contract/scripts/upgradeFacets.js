const { ethers } = require("hardhat");
const { getSelectors, FacetCutAction } = require("./libraries/diamond.js");

async function upgradeFacets() {
  const diamondAddress = "0x9D498B7f357D4899139Ec5aB133Bf5B2052B7368";
  const facetNames = [
    "AdminFacet",
    "StudentFacet",
    "CohortFacet",
    "AdminUsernameFacet",
  ];

  const cut = [];

  for (const name of facetNames) {
    const Facet = await ethers.getContractFactory(name);
    const facet = await Facet.deploy();
    await facet.deployed();
    const selectors = getSelectors(facet);
    console.log(`${name}: Adding to diamond cut with address ${facet.address}`);
    cut.push({
      facetAddress: facet.address,
      action: FacetCutAction.Replace,
      functionSelectors: selectors,
    });
  }

  const diamondCut = await ethers.getContractAt("IDiamondCut", diamondAddress);
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
