const { ethers } = require("hardhat");
const { getSelectors, FacetCutAction } = require("./libraries/diamond.js");

async function addFacet() {
  const diamondAddress = "0x1a65Cb45a38Ce9C545CCe4088Ff431325d4Cc775"; 
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

addFacet()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
