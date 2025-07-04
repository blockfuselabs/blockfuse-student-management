const { ethers } = require("hardhat");
const { getSelectors } = require("./libraries/diamond.js");

async function main() {
  const diamondAddress = "0x9D498B7f357D4899139Ec5aB133Bf5B2052B7368"; // Update if needed
  const facetNames = [
    "AdminFacet",
    "StudentFacet",
    "CohortFacet",
    "AdminUsernameFacet",
  ];

  // 1. Get on-chain facets and selectors
  const diamondLoupe = await ethers.getContractAt(
    "IDiamondLoupe",
    diamondAddress
  );
  const onChainFacets = await diamondLoupe.facets();

  // Build a map: selector => facetAddress (on-chain)
  const selectorToFacet = {};
  for (const facet of onChainFacets) {
    for (const selector of facet.functionSelectors) {
      selectorToFacet[selector] = facet.facetAddress.toLowerCase();
    }
  }

  // 2. For each local facet, get selectors and compare
  for (const name of facetNames) {
    const Facet = await ethers.getContractFactory(name);
    const selectors = getSelectors(Facet);
    console.log(`\n${name} selectors:`);
    let allUpToDate = true;
    for (const selector of selectors) {
      // Find which on-chain facet address this selector is mapped to
      const onChainAddress = selectorToFacet[selector];
      if (!onChainAddress) {
        console.log(`  [MISSING] ${selector}`);
        allUpToDate = false;
      } else {
        // Print the facet address for this selector
        console.log(`  [ON-CHAIN: ${onChainAddress}] ${selector}`);
      }
    }
    // Optionally, check if all selectors for this facet are mapped to the same address
    const localFacet = await Facet.deploy();
    await localFacet.deployed();
    const localAddress = localFacet.address.toLowerCase();
    const mappedAddresses = selectors
      .map((s) => selectorToFacet[s])
      .filter(Boolean);
    const allToSame = mappedAddresses.every(
      (addr) => addr === mappedAddresses[0]
    );
    if (allToSame && mappedAddresses[0] === localAddress) {
      console.log(
        `  All selectors for ${name} are up-to-date and mapped to the latest deployment (${localAddress})`
      );
    } else if (allToSame) {
      console.log(
        `  All selectors for ${name} are mapped to a single address (${mappedAddresses[0]}), but it may not be the latest deployment.`
      );
    } else {
      console.log(
        `  Selectors for ${name} are mapped to multiple addresses or missing. Some may be outdated or missing.`
      );
    }
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
