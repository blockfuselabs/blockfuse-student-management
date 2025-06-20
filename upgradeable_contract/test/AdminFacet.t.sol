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

contract AdminFacetTest is Test, IDiamondCut {
    Diamond diamond;
    DiamondCutFacet dCutFacet;
    DiamondLoupeFacet dLoupe;
    OwnershipFacet ownerF;
    AdminFacet adminFacet;
    CohortFacet cohortFacet;
    StudentFacet studentFacet;
    
    address admin1 = mkaddr("admin1");
    address admin2 = mkaddr("admin2");
    address student1 = mkaddr("student1");
    address student2 = mkaddr("student2");
    address superAdmin = mkaddr("superAdmin");
    address unauthorized = mkaddr("unauthorized");
    
    uint8 cohortId;
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
        
        // Setup test data
        setupTestData();
        
        vm.stopPrank();
    }
    
    function setupTestData() internal {
        // Create cohort
        uint256 startDate = block.timestamp;
        uint256 endDate = block.timestamp + 30 days;
        CohortFacet(address(diamond)).createCohort(startDate, endDate);
        cohortId = CohortFacet(address(diamond)).getCohortCount();
        
        // Add tracks to cohort
        CohortFacet(address(diamond)).addTrackToCohort(cohortId, web2Track);
        CohortFacet(address(diamond)).addTrackToCohort(cohortId, web3Track);
    }
    
    // Test Case 1: Test admin management (add/remove admins)
    function testAdminManagement() public {
        // Test adding admin by super admin
        vm.prank(superAdmin);
        vm.expectEmit(true, false, false, false);
        emit Event.AdminAdded(admin1);
        bool result = AdminFacet(address(diamond)).addAdmin(admin1);
        assertTrue(result);
        
        // Test unauthorized user cannot add admin
        vm.prank(unauthorized);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        AdminFacet(address(diamond)).addAdmin(admin2);
        
        // Test admin cannot add another admin (only super admin can)
        vm.prank(admin1);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        AdminFacet(address(diamond)).addAdmin(admin2);
        
        // Test removing admin by super admin
        vm.prank(superAdmin);
        vm.expectEmit(true, false, false, false);
        emit Event.AdminRemoved(admin1);
        result = AdminFacet(address(diamond)).removeAdmin(admin1);
        assertTrue(result);
        
        // Test unauthorized user cannot remove admin
        vm.prank(unauthorized);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        AdminFacet(address(diamond)).removeAdmin(admin1);
    }
    
    // Test Case 2: Test student registration functionality
    function testStudentRegistration() public {
        // Add admin first
        vm.prank(superAdmin);
        AdminFacet(address(diamond)).addAdmin(admin1);
        
        // Test student registration by admin
        vm.prank(admin1);
        LibAppStorage.studentDetails memory studentDetails;
        studentDetails.firstname = "John";
        studentDetails.lastname = "Doe";
        studentDetails.username = "johndoe";
        studentDetails.twitter = "@johndoe";
        studentDetails.linkedin = "johndoe";
        studentDetails.github = "johndoe";
        studentDetails.track = web2Track;
        studentDetails.cohort = cohortId;
        studentDetails.studentAddress = student1;
        
        vm.expectEmit(true, true, false, false);
        emit Event.StudentAddedToCohort(student1, cohortId);
        AdminFacet(address(diamond)).registerStudent(studentDetails);
        
        // Verify student is active and registered correctly
        assertTrue(AdminFacet(address(diamond)).isStudentActive(student1));
        LibAppStorage.studentDetails memory retrievedStudent = StudentFacet(address(diamond)).getStudent(student1);
        assertEq(retrievedStudent.firstname, "John");
        assertEq(retrievedStudent.lastname, "Doe");
        assertEq(retrievedStudent.cohort, cohortId);
        assertTrue(retrievedStudent.isActive);
        assertEq(retrievedStudent.finalScore, 0);
        
        // Test unauthorized user cannot register student
        vm.prank(unauthorized);
        studentDetails.studentAddress = student2;
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        AdminFacet(address(diamond)).registerStudent(studentDetails);
        
        // Test registration with invalid cohort
        vm.prank(admin1);
        studentDetails.cohort = 99;
        vm.expectRevert(Error.INVALID_COHORT_ID.selector);
        AdminFacet(address(diamond)).registerStudent(studentDetails);
    }
    
    // Test Case 3: Test student assessment recording
    function testStudentAssessmentRecording() public {
        // Setup: Add admin and register student
        vm.prank(superAdmin);
        AdminFacet(address(diamond)).addAdmin(admin1);
        
        vm.prank(admin1);
        LibAppStorage.studentDetails memory studentDetails;
        studentDetails.firstname = "John";
        studentDetails.lastname = "Doe";
        studentDetails.username = "johndoe";
        studentDetails.track = web2Track;
        studentDetails.cohort = cohortId;
        studentDetails.studentAddress = student1;
        AdminFacet(address(diamond)).registerStudent(studentDetails);
        
        // Test recording assessment by admin
        vm.prank(admin1);
        vm.expectEmit(true, true, true, true);
        emit Event.AssessmentRecorded(student1, 85, 85, block.timestamp, admin1);
        bool result = AdminFacet(address(diamond)).recordStudentAssesment(student1, 85);
        assertTrue(result);
        
        // Verify score was recorded
        int256[] memory scores = StudentFacet(address(diamond)).getStudentAssesments(student1);
        assertEq(scores.length, 1);
        assertEq(scores[0], 85);
        assertEq(StudentFacet(address(diamond)).getStudentFinalScore(student1), 85);
        
        // Test recording multiple assessments
        vm.prank(admin1);
        AdminFacet(address(diamond)).recordStudentAssesment(student1, 90);
        scores = StudentFacet(address(diamond)).getStudentAssesments(student1);
        assertEq(scores.length, 2);
        assertEq(scores[1], 90);
        assertEq(StudentFacet(address(diamond)).getStudentFinalScore(student1), 175); // 85 + 90
        
        // Test unauthorized user cannot record assessment
        vm.prank(unauthorized);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        AdminFacet(address(diamond)).recordStudentAssesment(student1, 95);
        
        // Test recording assessment for non-existent student
        vm.prank(admin1);
        vm.expectRevert(Error.STUDENT_DOES_NOT_EXIST.selector);
        AdminFacet(address(diamond)).recordStudentAssesment(student2, 80);
    }
    
    // Test Case 4: Test student activation/deactivation
    function testStudentActivationDeactivation() public {
        // Setup: Add admin and register student
        vm.prank(superAdmin);
        AdminFacet(address(diamond)).addAdmin(admin1);
        
        vm.prank(admin1);
        LibAppStorage.studentDetails memory studentDetails;
        studentDetails.firstname = "John";
        studentDetails.lastname = "Doe";
        studentDetails.username = "johndoe";
        studentDetails.track = web2Track;
        studentDetails.cohort = cohortId;
        studentDetails.studentAddress = student1;
        AdminFacet(address(diamond)).registerStudent(studentDetails);
        
        // Verify student is initially active
        assertTrue(AdminFacet(address(diamond)).isStudentActive(student1));
        
        // Test disabling student by admin
        vm.prank(admin1);
        AdminFacet(address(diamond)).disableStudent(student1);
        assertFalse(AdminFacet(address(diamond)).isStudentActive(student1));
        
        // Test enabling student by admin
        vm.prank(admin1);
        AdminFacet(address(diamond)).enableStudent(student1);
        assertTrue(AdminFacet(address(diamond)).isStudentActive(student1));
        
        // Test unauthorized user cannot disable student
        vm.prank(unauthorized);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        AdminFacet(address(diamond)).disableStudent(student1);
        
        // Test unauthorized user cannot enable student
        vm.prank(unauthorized);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        AdminFacet(address(diamond)).enableStudent(student1);
        
        // Test super admin can also disable/enable students
        vm.prank(superAdmin);
        AdminFacet(address(diamond)).disableStudent(student1);
        assertFalse(AdminFacet(address(diamond)).isStudentActive(student1));
        
        vm.prank(superAdmin);
        AdminFacet(address(diamond)).enableStudent(student1);
        assertTrue(AdminFacet(address(diamond)).isStudentActive(student1));
    }
    
    // Test Case 5: Test student wallet replacement functionality
    function testStudentWalletReplacement() public {
        // Setup: Add admin and register student
        vm.prank(superAdmin);
        AdminFacet(address(diamond)).addAdmin(admin1);
        
        vm.prank(admin1);
        LibAppStorage.studentDetails memory studentDetails;
        studentDetails.firstname = "John";
        studentDetails.lastname = "Doe";
        studentDetails.username = "johndoe";
        studentDetails.track = web2Track;
        studentDetails.cohort = cohortId;
        studentDetails.studentAddress = student1;
        AdminFacet(address(diamond)).registerStudent(studentDetails);
        
        // Add some scores to student1
        vm.prank(admin1);
        AdminFacet(address(diamond)).recordStudentAssesment(student1, 85);
        vm.prank(admin1);
        AdminFacet(address(diamond)).recordStudentAssesment(student1, 90);
        
        address newStudentAddress = mkaddr("newStudentAddress");
        
        // Test wallet replacement by admin
        vm.prank(admin1);
        vm.expectEmit(true, true, false, false);
        emit Event.StudentWalletReplaced(student1, newStudentAddress);
        AdminFacet(address(diamond)).replaceStudentWallet(student1, newStudentAddress);
        
        // Verify old address is deactivated and new address is active
        assertFalse(AdminFacet(address(diamond)).isStudentActive(student1));
        assertTrue(AdminFacet(address(diamond)).isStudentActive(newStudentAddress));
        
        // Verify data was copied to new address
        LibAppStorage.studentDetails memory oldStudent = StudentFacet(address(diamond)).getStudent(student1);
        LibAppStorage.studentDetails memory newStudent = StudentFacet(address(diamond)).getStudent(newStudentAddress);
        
        assertEq(newStudent.firstname, oldStudent.firstname);
        assertEq(newStudent.lastname, oldStudent.lastname);
        assertEq(newStudent.cohort, oldStudent.cohort);
        assertEq(uint256(newStudent.track), uint256(oldStudent.track));
        assertEq(newStudent.finalScore, oldStudent.finalScore);
        assertEq(newStudent.studentAddress, newStudentAddress);
        assertTrue(newStudent.isActive);
        assertFalse(oldStudent.isActive);
        
        // Test unauthorized user cannot replace wallet
        vm.prank(unauthorized);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        AdminFacet(address(diamond)).replaceStudentWallet(newStudentAddress, student2);
        
        // Test invalid addresses
        vm.prank(admin1);
        vm.expectRevert(Error.INVALID_ADDRESS.selector);
        AdminFacet(address(diamond)).replaceStudentWallet(address(0), student2);
        
        vm.prank(admin1);
        vm.expectRevert(Error.INVALID_ADDRESS.selector);
        AdminFacet(address(diamond)).replaceStudentWallet(newStudentAddress, address(0));
        
        // Test replacing non-existent student
        vm.prank(admin1);
        vm.expectRevert(Error.STUDENT_DOES_NOT_EXIST.selector);
        AdminFacet(address(diamond)).replaceStudentWallet(student2, mkaddr("anotherAddress"));
        
        // Test replacing with already active student address
        vm.prank(admin1);
        LibAppStorage.studentDetails memory student2Details;
        student2Details.firstname = "Jane";
        student2Details.lastname = "Smith";
        student2Details.username = "janesmith";
        student2Details.track = web3Track;
        student2Details.cohort = cohortId;
        student2Details.studentAddress = student2;
        AdminFacet(address(diamond)).registerStudent(student2Details);
        
        vm.prank(admin1);
        vm.expectRevert(Error.STUDENT_DOES_NOT_EXIST.selector);
        AdminFacet(address(diamond)).replaceStudentWallet(newStudentAddress, student2);
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