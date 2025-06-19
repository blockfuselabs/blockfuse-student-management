// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../contracts/interfaces/IDiamondCut.sol";
import "../contracts/facets/DiamondCutFacet.sol";
import "../contracts/facets/DiamondLoupeFacet.sol";
import "../contracts/facets/OwnershipFacet.sol";
import "../lib/forge-std/src/Test.sol";
import "../contracts/Diamond.sol";
import "../contracts/facets/AdminFacet.sol";
import "../contracts/facets/CohortFacet.sol";
import "../contracts/facets/StudentFacet.sol";
import "../contracts/libraries/LibAppStorage.sol";

contract DiamondDeployer is Test, IDiamondCut {
    //contract types of facets to be deployed
    LibAppStorage.Layout layout;
    Diamond diamond;
    DiamondCutFacet dCutFacet;
    DiamondLoupeFacet dLoupe;
    OwnershipFacet ownerF;
    AdminFacet adminFacet;
    CohortFacet cohortFacet;
    StudentFacet studentFacet;
    CohortFacet boundCohortFacet;

    address superAdmin = mkaddr("superAdmin");
    address otherAddr = mkaddr("otherAddr");

    function mkaddr(string memory name) public returns (address) {
        address addr = address(uint160(uint256(keccak256(abi.encodePacked(name)))));
        vm.label(addr, name);
        return addr;
    }

    function setUp() public {
        vm.startPrank(superAdmin);

        //deploy facets
        dCutFacet = new DiamondCutFacet();
        diamond = new Diamond(address(dCutFacet));
        dLoupe = new DiamondLoupeFacet();
        ownerF = new OwnershipFacet();
        adminFacet = new AdminFacet();
        cohortFacet = new CohortFacet();
        studentFacet = new StudentFacet();
        boundCohortFacet = CohortFacet(address(diamond));

        console.log("superAdmin address in setUp: ", layout.superAdmin);

        //upgrade diamond with facets

        //build cut struct
        FacetCut[] memory cut = new FacetCut[](5);

        cut[0] = (
            FacetCut({
                facetAddress: address(dLoupe),
                action: FacetCutAction.Add,
                functionSelectors: generateSelectors("DiamondLoupeFacet")
            })
        );

        cut[1] = (
            FacetCut({
                facetAddress: address(ownerF),
                action: FacetCutAction.Add,
                functionSelectors: generateSelectors("OwnershipFacet")
            })
        );

        cut[2] = (
            FacetCut({
                facetAddress: address(adminFacet),
                action: FacetCutAction.Add,
                functionSelectors: generateSelectors("AdminFacet")
            })
        );

        cut[3] = (
            FacetCut({
                facetAddress: address(cohortFacet),
                action: FacetCutAction.Add,
                functionSelectors: generateSelectors("CohortFacet")
            })
        );

        cut[4] = (
            FacetCut({
                facetAddress: address(studentFacet),
                action: FacetCutAction.Add,
                functionSelectors: generateSelectors("StudentFacet")
            })
        );

        //upgrade diamond
        IDiamondCut(address(diamond)).diamondCut(cut, address(0x0), "");

        //call a function
        DiamondLoupeFacet(address(diamond)).facetAddresses();

        vm.stopPrank();
    }

    function testDeployerOfTheContractIsSuperAdmin() public view {
        //    vm.startPrank(superAdmin);
        console.log("superAdmin address in test: ", boundCohortFacet.getSuperAdmin());
    }

    function testReplaceStudentWallet() public {
        // Setup: Register a student
        address studentOld = mkaddr("studentOld");
        address studentNew = mkaddr("studentNew");
        LibAppStorage.Track track = LibAppStorage.Track.web2;
        vm.startPrank(superAdmin);
        // Create a cohort and add the track before registering the student
        uint256 startDate = block.timestamp;
        uint256 endDate = block.timestamp + 30 days;
        CohortFacet(address(diamond)).createCohort(startDate, endDate);
        uint8 cohortId = CohortFacet(address(diamond)).getCohortCount();
        CohortFacet(address(diamond)).addTrackToCohort(cohortId, track);
        LibAppStorage.studentDetails memory student;
        student.firstname = "John";
        student.lastname = "Doe";
        student.username = "John Doe";
        student.twitter = "@johndoe";
        student.linkedin = "johndoe";
        student.github = "johndoe";
        student.track = LibAppStorage.Track.web2;
        student.cohort = cohortId;
        student.studentAddress = studentOld;
        // Register the student with the old address
        AdminFacet(address(diamond)).registerStudent(student);
        // Replace the wallet address
        AdminFacet(address(diamond)).replaceStudentWallet(studentOld, studentNew);
        // Check that the new address is active and the old one is not
        assertTrue(AdminFacet(address(diamond)).isStudentActive(studentNew), "New student address should be active");
        assertTrue(!AdminFacet(address(diamond)).isStudentActive(studentOld), "Old student address should be inactive");
        vm.stopPrank();
    }

    function generateSelectors(string memory _facetName) internal returns (bytes4[] memory selectors) {
        string[] memory cmd = new string[](3);
        cmd[0] = "node";
        cmd[1] = "scripts/genSelectors.js";
        cmd[2] = _facetName;
        bytes memory res = vm.ffi(cmd);
        selectors = abi.decode(res, (bytes4[]));
    }

    function diamondCut(FacetCut[] calldata _diamondCut, address _init, bytes calldata _calldata) external override {}
}
