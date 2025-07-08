const { ethers } = require("hardhat");
const { getSelectors, FacetCutAction } = require("./libraries/diamond.js");

async function upgradeFacets() {
  const diamondAddress = "0x9D498B7f357D4899139Ec5aB133Bf5B2052B7368";
  // Map facet names to their deployed addresses
  const facetAddresses = {
    AdminFacet: "0xe8E33517AfDaBF77380eBB22A4cDf433b0Bb5441",
    StudentFacet: "0x4d92a1B0f0D73800e1f87095C0FE4806c810CCeD",
    // Add more facets as needed
  };
  const facetNames = Object.keys(facetAddresses);

  // 1. Fetch on-chain selectors and build a set
  const diamondLoupe = await ethers.getContractAt(
    "IDiamondLoupe",
    diamondAddress
  );
  const onChainFacets = await diamondLoupe.facets();
  const onChainSelectorSet = new Set();
  for (const facet of onChainFacets) {
    for (const selector of facet.functionSelectors) {
      onChainSelectorSet.add(selector);
    }
  }

  // 2. For each facet, split selectors into Add and Replace
  const cut = [];
  for (const name of facetNames) {
    const Facet = await ethers.getContractFactory(name);
    const selectors = getSelectors(Facet.interface);
    const address = facetAddresses[name];
    const selectorsToAdd = selectors.filter(
      (sel) => !onChainSelectorSet.has(sel)
    );
    const selectorsToReplace = selectors.filter((sel) =>
      onChainSelectorSet.has(sel)
    );
    if (selectorsToAdd.length > 0) {
      console.log(`${name}: Adding selectors:`, selectorsToAdd);
      cut.push({
        facetAddress: address,
        action: FacetCutAction.Add,
        functionSelectors: selectorsToAdd,
      });
    }
    if (selectorsToReplace.length > 0) {
      console.log(`${name}: Replacing selectors:`, selectorsToReplace);
      cut.push({
        facetAddress: address,
        action: FacetCutAction.Replace,
        functionSelectors: selectorsToReplace,
      });
    }
  }

  if (cut.length === 0) {
    console.log("No selectors to add or replace. Exiting.");
    return;
  }

  const diamondCut = await ethers.getContractAt("IDiamondCut", diamondAddress);
  const tx = await diamondCut.diamondCut(
    cut,
    ethers.constants.AddressZero,
    "0x",
    { gasLimit: 5_000_000 } // Set a reasonable manual gas limit
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
