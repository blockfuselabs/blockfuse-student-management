// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/interfaces/IDiamondCut.sol";
import "../contracts/facets/DiamondCutFacet.sol";
import "../contracts/facets/DiamondLoupeFacet.sol";
import "../contracts/facets/OwnershipFacet.sol";
import "../contracts/Diamond.sol";
import "../contracts/facets/AdminFacet.sol";
import "../contracts/facets/CohortFacet.sol";
import "../contracts/facets/StudentFacet.sol";
import "../contracts/libraries/LibAppStorage.sol";
import "../contracts/libraries/Error.sol";
import "../contracts/libraries/Event.sol";

contract CohortFacetTest is Test, IDiamondCut {
    Diamond diamond;
    DiamondCutFacet dCutFacet;
    DiamondLoupeFacet dLoupe;
    OwnershipFacet ownerF;
    AdminFacet adminFacet;
    CohortFacet cohortFacet;
    StudentFacet studentFacet;
    
    address admin = mkaddr("admin");
    address superAdmin = mkaddr("superAdmin");
    address unauthorized = mkaddr("unauthorized");
    address student1 = mkaddr("student1");
    address student2 = mkaddr("student2");
    
    LibAppStorage.Track web2Track = LibAppStorage.Track.web2;
    LibAppStorage.Track web3Track = LibAppStorage.Track.web3;
    
    function mkaddr(string memory name) public returns (address) {
        address addr = address(uint160(uint256(keccak256(abi.encodePacked(name)))));
        vm.label(addr, name);
        return addr;
    }
    
    function setUp() public {
        vm.startPrank(superAdmin);
        
        // Deploy facets
        dCutFacet = new DiamondCutFacet();
        diamond = new Diamond(address(dCutFacet));
        dLoupe = new DiamondLoupeFacet();
        ownerF = new OwnershipFacet();
        adminFacet = new AdminFacet();
        cohortFacet = new CohortFacet();
        studentFacet = new StudentFacet();
        
        // Build cut struct
        FacetCut[] memory cut = new FacetCut[](5);
        
        cut[0] = FacetCut({
            facetAddress: address(dLoupe),
            action: FacetCutAction.Add,
            functionSelectors: generateSelectors("DiamondLoupeFacet")
        });
        
        cut[1] = FacetCut({
            facetAddress: address(ownerF),
            action: FacetCutAction.Add,
            functionSelectors: generateSelectors("OwnershipFacet")
        });
        
        cut[2] = FacetCut({
            facetAddress: address(adminFacet),
            action: FacetCutAction.Add,
            functionSelectors: generateSelectors("AdminFacet")
        });
        
        cut[3] = FacetCut({
            facetAddress: address(cohortFacet),
            action: FacetCutAction.Add,
            functionSelectors: generateSelectors("CohortFacet")
        });
        
        cut[4] = FacetCut({
            facetAddress: address(studentFacet),
            action: FacetCutAction.Add,
            functionSelectors: generateSelectors("StudentFacet")
        });
        
        // Upgrade diamond
        IDiamondCut(address(diamond)).diamondCut(cut, address(0x0), "");
        
        vm.stopPrank();
    }
    
    // Test Case 1: Test cohort creation functionality
    function testCohortCreation() public {
        uint256 startDate = block.timestamp;
        uint256 endDate = block.timestamp + 30 days;
        
        // Test successful cohort creation by super admin
        vm.prank(superAdmin);
        vm.expectEmit(true, false, false, false);
        emit Event.CohortCreated(2); // First cohort should have ID 2 (cohortCount starts at 1)
        CohortFacet(address(diamond)).createCohort(startDate, endDate);
        
        // Verify cohort count increased
        assertEq(CohortFacet(address(diamond)).getCohortCount(), 2);
        
        // Verify cohort details
        (
            uint256 id,
            string[] memory tracks,
            uint256 totalStudents,
            uint256 retrievedStartDate,
            uint256 retrievedEndDate,
            uint256 duration,
            address[][] memory studentsByTrack
        ) = CohortFacet(address(diamond)).getCohort(2);
        
        assertEq(id, 2);
        assertEq(tracks.length, 0); // No tracks added yet
        assertEq(totalStudents, 0);
        assertEq(retrievedStartDate, startDate);
        assertEq(retrievedEndDate, endDate);
        assertEq(duration, endDate - startDate);
        assertEq(studentsByTrack.length, 0);
        
        // Test unauthorized user cannot create cohort
        vm.prank(unauthorized);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        CohortFacet(address(diamond)).createCohort(startDate + 1 days, endDate + 1 days);
        
        // Test admin cannot create cohort (only super admin)
        vm.prank(admin);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        CohortFacet(address(diamond)).createCohort(startDate + 1 days, endDate + 1 days);
        
        // Test invalid dates (start date >= end date)
        vm.prank(superAdmin);
        vm.expectRevert(Error.END_DATE_MUST_BE_GREATER_THAN_START.selector);
        CohortFacet(address(diamond)).createCohort(endDate, startDate); // Swapped dates
        
        vm.prank(superAdmin);
        vm.expectRevert(Error.END_DATE_MUST_BE_GREATER_THAN_START.selector);
        CohortFacet(address(diamond)).createCohort(startDate, startDate); // Same dates
    }
    
    // Test Case 2: Test track management for cohorts
    function testTrackManagement() public {
        // First create a cohort
        uint256 startDate = block.timestamp;
        uint256 endDate = block.timestamp + 30 days;
        
        vm.prank(superAdmin);
        CohortFacet(address(diamond)).createCohort(startDate, endDate);
        uint8 cohortId = CohortFacet(address(diamond)).getCohortCount();
        
        // Test adding web2 track
        vm.prank(superAdmin);
        vm.expectEmit(true, true, false, false);
        emit Event.CohortTrackAdded(cohortId, "web2");
        CohortFacet(address(diamond)).addTrackToCohort(cohortId, web2Track);
        
        // Test adding web3 track
        vm.prank(superAdmin);
        vm.expectEmit(true, true, false, false);
        emit Event.CohortTrackAdded(cohortId, "web3");
        CohortFacet(address(diamond)).addTrackToCohort(cohortId, web3Track);
        
        // Verify tracks were added
        LibAppStorage.Track[] memory tracks = CohortFacet(address(diamond)).getCohortTracks(cohortId);
        assertEq(tracks.length, 2);
        assertEq(uint256(tracks[0]), uint256(web2Track));
        assertEq(uint256(tracks[1]), uint256(web3Track));
        
        // Verify getCohort returns correct track information
        (
            ,
            string[] memory trackNames,
            ,
            ,
            ,
            ,
            address[][] memory studentsByTrack
        ) = CohortFacet(address(diamond)).getCohort(cohortId);
        
        assertEq(trackNames.length, 2);
        assertEq(trackNames[0], "web2");
        assertEq(trackNames[1], "web3");
        assertEq(studentsByTrack.length, 2);
        
        // Test unauthorized user cannot add track
        vm.prank(unauthorized);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        CohortFacet(address(diamond)).addTrackToCohort(cohortId, web2Track);
        
        // Test admin cannot add track (only super admin)
        vm.prank(admin);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        CohortFacet(address(diamond)).addTrackToCohort(cohortId, web2Track);
        
        // Test adding track to non-existent cohort
        vm.prank(superAdmin);
        vm.expectRevert(Error.COHORT_DOES_NOT_EXIST.selector);
        CohortFacet(address(diamond)).addTrackToCohort(99, web2Track);
    }
    
    // Test Case 3: Test cohort retrieval and validation
    function testCohortRetrieval() public {
        // Create multiple cohorts
        uint256 startDate1 = block.timestamp;
        uint256 endDate1 = block.timestamp + 30 days;
        uint256 startDate2 = block.timestamp + 1 days;
        uint256 endDate2 = block.timestamp + 60 days;
        
        vm.startPrank(superAdmin);
        CohortFacet(address(diamond)).createCohort(startDate1, endDate1);
        CohortFacet(address(diamond)).createCohort(startDate2, endDate2);
        vm.stopPrank();
        
        // Verify cohort count
        assertEq(CohortFacet(address(diamond)).getCohortCount(), 3); // Should be 3 (starts at 1)
        
        // Test retrieving first cohort
        (
            uint256 id1,
            ,
            ,
            uint256 retrievedStartDate1,
            uint256 retrievedEndDate1,
            uint256 duration1,
        ) = CohortFacet(address(diamond)).getCohort(2);
        
        assertEq(id1, 2);
        assertEq(retrievedStartDate1, startDate1);
        assertEq(retrievedEndDate1, endDate1);
        assertEq(duration1, endDate1 - startDate1);
        
        // Test retrieving second cohort
        (
            uint256 id2,
            ,
            ,
            uint256 retrievedStartDate2,
            uint256 retrievedEndDate2,
            uint256 duration2,
        ) = CohortFacet(address(diamond)).getCohort(3);
        
        assertEq(id2, 3);
        assertEq(retrievedStartDate2, startDate2);
        assertEq(retrievedEndDate2, endDate2);
        assertEq(duration2, endDate2 - startDate2);
        
        // Test retrieving non-existent cohort (ID 0)
        vm.expectRevert(Error.COHORT_DOES_NOT_EXIST.selector);
        CohortFacet(address(diamond)).getCohort(0);
        
        // Test retrieving non-existent cohort (ID beyond count)
        vm.expectRevert(Error.COHORT_DOES_NOT_EXIST.selector);
        CohortFacet(address(diamond)).getCohort(99);
        
        // Test getting tracks for empty cohort
        LibAppStorage.Track[] memory emptyTracks = CohortFacet(address(diamond)).getCohortTracks(2);
        assertEq(emptyTracks.length, 0);
    }
    
    // Test Case 4: Test super admin functionality
    function testSuperAdminFunctionality() public {
        // Test getSuperAdmin returns correct address
        address retrievedSuperAdmin = CohortFacet(address(diamond)).getSuperAdmin();
        assertEq(retrievedSuperAdmin, superAdmin);
        
        // Test that super admin can perform all operations
        uint256 startDate = block.timestamp;
        uint256 endDate = block.timestamp + 30 days;
        
        vm.startPrank(superAdmin);
        
        // Create cohort
        CohortFacet(address(diamond)).createCohort(startDate, endDate);
        uint8 cohortId = CohortFacet(address(diamond)).getCohortCount();
        
        // Add tracks
        CohortFacet(address(diamond)).addTrackToCohort(cohortId, web2Track);
        CohortFacet(address(diamond)).addTrackToCohort(cohortId, web3Track);
        
        vm.stopPrank();
        
        // Verify operations were successful
        assertEq(CohortFacet(address(diamond)).getCohortCount(), 2);
        
        LibAppStorage.Track[] memory tracks = CohortFacet(address(diamond)).getCohortTracks(cohortId);
        assertEq(tracks.length, 2);
        
        // Test that non-super-admin cannot perform privileged operations
        vm.prank(unauthorized);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        CohortFacet(address(diamond)).createCohort(startDate + 1 days, endDate + 1 days);
        
        vm.prank(unauthorized);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        CohortFacet(address(diamond)).addTrackToCohort(cohortId, web2Track);
    }
    
    // Test Case 5: Test integration with student enrollment
    function testStudentEnrollmentIntegration() public {
        // Create cohort and add tracks
        uint256 startDate = block.timestamp;
        uint256 endDate = block.timestamp + 30 days;
        
        vm.prank(superAdmin);
        CohortFacet(address(diamond)).createCohort(startDate, endDate);
        uint8 cohortId = CohortFacet(address(diamond)).getCohortCount();
        
        vm.prank(superAdmin);
        CohortFacet(address(diamond)).addTrackToCohort(cohortId, web2Track);
        vm.prank(superAdmin);
        CohortFacet(address(diamond)).addTrackToCohort(cohortId, web3Track);
        
        // Add admin to register students
        vm.prank(superAdmin);
        AdminFacet(address(diamond)).addAdmin(admin);
        
        // Register students through AdminFacet
        vm.prank(admin);
        LibAppStorage.studentDetails memory student1Details;
        student1Details.firstname = "John";
        student1Details.lastname = "Doe";
        student1Details.username = "johndoe";
        student1Details.track = web2Track;
        student1Details.cohort = cohortId;
        student1Details.studentAddress = student1;
        AdminFacet(address(diamond)).registerStudent(student1Details);
        
        vm.prank(admin);
        LibAppStorage.studentDetails memory student2Details;
        student2Details.firstname = "Jane";
        student2Details.lastname = "Smith";
        student2Details.username = "janesmith";
        student2Details.track = web3Track;
        student2Details.cohort = cohortId;
        student2Details.studentAddress = student2;
        AdminFacet(address(diamond)).registerStudent(student2Details);
        
        // Verify students appear in cohort data
        (
            ,
            string[] memory trackNames,
            uint256 totalStudents,
            ,
            ,
            ,
            address[][] memory studentsByTrack
        ) = CohortFacet(address(diamond)).getCohort(cohortId);
        
        assertEq(trackNames.length, 2);
        assertEq(totalStudents, 2); // Should show 2 total students
        assertEq(studentsByTrack.length, 2);
        
        // Check web2 track students
        assertEq(studentsByTrack[0].length, 1);
        assertEq(studentsByTrack[0][0], student1);
        
        // Check web3 track students
        assertEq(studentsByTrack[1].length, 1);
        assertEq(studentsByTrack[1][0], student2);
        
        // Test cohort with no students enrolled
        vm.prank(superAdmin);
        CohortFacet(address(diamond)).createCohort(startDate + 2 days, endDate + 2 days);
        uint8 emptyCohortId = CohortFacet(address(diamond)).getCohortCount();
        
        (
            ,
            string[] memory emptyTrackNames,
            uint256 emptyTotalStudents,
            ,
            ,
            ,
            address[][] memory emptyStudentsByTrack
        ) = CohortFacet(address(diamond)).getCohort(emptyCohortId);
        
        assertEq(emptyTrackNames.length, 0);
        assertEq(emptyTotalStudents, 0);
        assertEq(emptyStudentsByTrack.length, 0);
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