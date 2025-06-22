const { ethers } = require("hardhat");
const { getSelectors, FacetCutAction } = require("./libraries/diamond.js");
const path = require("path");

async function addFacet() {
  const diamondAddress = "0x706F5EAC71a871144731E5231E122694BE76e4F3";
  const NewFacet = await ethers.getContractFactory("StudentFacet");
  const newFacet = await NewFacet.deploy();
  await newFacet.deployed();
  console.log("NewFacet deployed:", newFacet.address);

  const diamondCut = await ethers.getContractAt("IDiamondCut", diamondAddress);

  const cut = [
    {
      facetAddress: newFacet.address,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(newFacet),
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
  console.log("Facet added successfully!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
if (require.main === module) {
  addFacet()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.addFacet = addFacet;
