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

contract StudentFacetTest is Test, IDiamondCut {
    Diamond diamond;
    DiamondCutFacet dCutFacet;
    DiamondLoupeFacet dLoupe;
    OwnershipFacet ownerF;
    AdminFacet adminFacet;
    CohortFacet cohortFacet;
    StudentFacet studentFacet;

    address student1 = mkaddr("student1");
    address student2 = mkaddr("student2");
    address admin = mkaddr("admin");
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
            functionSelectors: new bytes4[](9)
        });
        cut[4].functionSelectors[0] = 0xcf9e6826; // getAttendanceByCohortAndTrack(uint8,uint8)
        cut[4].functionSelectors[1] = 0x72fddf65; // getAttendanceDatesForStudent(address,uint8,uint8)
        cut[4].functionSelectors[2] = 0x6b7b44d7; // getStudent(address)
        cut[4].functionSelectors[3] = 0x89d2b0c5; // getStudentAssesments(address)
        cut[4].functionSelectors[4] = 0xcfc48d27; // getStudentFinalScore(address)
        cut[4].functionSelectors[5] = 0x7649cd70; // getStudentScoreByIndex(address,uint256)
        cut[4].functionSelectors[6] = 0x9830bd99; // getStudentsByCohortAndTrack(uint8,uint8)
        cut[4].functionSelectors[7] = 0xe18325c4; // hasAttendance(address,uint8,uint8,uint256)
        cut[4].functionSelectors[8] = 0x94178fc3; // logAttendance(address,uint8,uint8)

        // Upgrade diamond
        IDiamondCut(address(diamond)).diamondCut(cut, address(0x0), "");

        // Setup test data through proper facet calls
        setupTestData();

        vm.stopPrank();
    }

    function setupTestData() internal {
        // Add admin
        AdminFacet(address(diamond)).addAdmin(admin);

        // Create cohort
        uint256 startDate = block.timestamp;
        uint256 endDate = block.timestamp + 30 days;
        CohortFacet(address(diamond)).createCohort(startDate, endDate);
        cohortId = CohortFacet(address(diamond)).getCohortCount();

        // Add tracks to cohort
        CohortFacet(address(diamond)).addTrackToCohort(cohortId, web2Track);
        CohortFacet(address(diamond)).addTrackToCohort(cohortId, web3Track);

        // Register student1 (active)
        LibAppStorage.studentDetails memory student1Details;
        student1Details.firstname = "John";
        student1Details.lastname = "Doe";
        student1Details.username = "johndoe";
        student1Details.twitter = "@johndoe";
        student1Details.linkedin = "johndoe";
        student1Details.github = "johndoe";
        student1Details.track = web2Track;
        student1Details.cohort = cohortId;
        student1Details.studentAddress = student1;
        AdminFacet(address(diamond)).registerStudent(student1Details);

        // Register student2 (will be deactivated)
        LibAppStorage.studentDetails memory student2Details;
        student2Details.firstname = "Jane";
        student2Details.lastname = "Smith";
        student2Details.username = "janesmith";
        student2Details.twitter = "@janesmith";
        student2Details.linkedin = "janesmith";
        student2Details.github = "janesmith";
        student2Details.track = web3Track;
        student2Details.cohort = cohortId;
        student2Details.studentAddress = student2;
        AdminFacet(address(diamond)).registerStudent(student2Details);

        // Deactivate student2
        AdminFacet(address(diamond)).disableStudent(student2);

        // Add scores for student1
        AdminFacet(address(diamond)).recordStudentAssesment(student1, 80);
        AdminFacet(address(diamond)).recordStudentAssesment(student1, 90);
        AdminFacet(address(diamond)).recordStudentAssesment(student1, 75);
    }

    // Test Case 1: Test successful attendance logging by student
    function testLogAttendanceByStudent() public {
        vm.prank(student1);

        vm.expectEmit(true, true, true, true);
        emit Event.AttendanceLogged(cohortId, student1, "web2", block.timestamp / 1 days);

        StudentFacet(address(diamond)).logAttendance(student1, cohortId, web2Track);

        // Verify attendance was logged
        bool hasAttended =
            StudentFacet(address(diamond)).hasAttendance(student1, cohortId, web2Track, block.timestamp / 1 days);
        assertTrue(hasAttended);
    }

    // Test Case 2: Test attendance logging access control
    function testLogAttendanceAccessControl() public {
        // Test unauthorized user cannot log attendance
        vm.prank(unauthorized);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        StudentFacet(address(diamond)).logAttendance(student1, cohortId, web2Track);

        // Test admin can log attendance for student
        vm.prank(admin);
        StudentFacet(address(diamond)).logAttendance(student1, cohortId, web2Track);

        // Test super admin can log attendance for student
        vm.prank(superAdmin);
        // Move to next day to avoid duplicate attendance
        vm.warp(block.timestamp + 1 days);
        StudentFacet(address(diamond)).logAttendance(student1, cohortId, web2Track);

        // Verify both attendances were logged
        assertTrue(
            StudentFacet(address(diamond)).hasAttendance(
                student1, cohortId, web2Track, (block.timestamp - 1 days) / 1 days
            )
        );
        assertTrue(
            StudentFacet(address(diamond)).hasAttendance(student1, cohortId, web2Track, block.timestamp / 1 days)
        );
    }

    // Test Case 3: Test attendance validation and duplicate prevention
    function testAttendanceValidation() public {
        vm.startPrank(student1);

        // Test invalid cohort
        vm.expectRevert(Error.INVALID_COHORT_ID.selector);
        StudentFacet(address(diamond)).logAttendance(student1, 99, web2Track);

        // Test invalid track
        vm.expectRevert(Error.INVALID_TRACK.selector);
        StudentFacet(address(diamond)).logAttendance(student1, cohortId, web3Track);

        // Test inactive student
        vm.expectRevert(Error.STUDENT_IS_NOT_ACTIVE.selector);
        StudentFacet(address(diamond)).logAttendance(student2, cohortId, web3Track);

        // Test successful attendance
        StudentFacet(address(diamond)).logAttendance(student1, cohortId, web2Track);

        // Test duplicate attendance prevention
        vm.expectRevert(Error.ALREADY_MARKED_ATTENDANCE.selector);
        StudentFacet(address(diamond)).logAttendance(student1, cohortId, web2Track);

        vm.stopPrank();
    }

    // Test Case 4: Test student score retrieval functions
    function testStudentScoreRetrieval() public {
        // Test getting all assessments
        int256[] memory scores = StudentFacet(address(diamond)).getStudentAssesments(student1);
        assertEq(scores.length, 3);
        assertEq(scores[0], 80);
        assertEq(scores[1], 90);
        assertEq(scores[2], 75);

        // Test getting final score (sum of all assessments: 80 + 90 + 75 = 245)
        int256 finalScore = StudentFacet(address(diamond)).getStudentFinalScore(student1);
        assertEq(finalScore, 245);

        // Test getting score by index
        int256 scoreAtIndex1 = StudentFacet(address(diamond)).getStudentScoreByIndex(student1, 1);
        assertEq(scoreAtIndex1, 90);

        // Test invalid index
        vm.expectRevert("Index out of range");
        StudentFacet(address(diamond)).getStudentScoreByIndex(student1, 10);

        // Test non-existent student
        vm.expectRevert(Error.STUDENT_DOES_NOT_EXIST.selector);
        StudentFacet(address(diamond)).getStudentAssesments(unauthorized);
    }

    // Test Case 5: Test attendance tracking and cohort attendance retrieval
    function testAttendanceTrackingAndRetrieval() public {
        // Log attendance for multiple days
        vm.prank(student1);
        StudentFacet(address(diamond)).logAttendance(student1, cohortId, web2Track);

        // Move to next day and log again
        vm.warp(block.timestamp + 1 days);
        vm.prank(student1);
        StudentFacet(address(diamond)).logAttendance(student1, cohortId, web2Track);

        // Move to next day and log again
        vm.warp(block.timestamp + 1 days);
        vm.prank(student1);
        StudentFacet(address(diamond)).logAttendance(student1, cohortId, web2Track);

        // Test attendance retrieval by cohort and track
        (address[] memory students, uint256[] memory attendanceCounts) =
            StudentFacet(address(diamond)).getAttendanceByCohortAndTrack(cohortId, web2Track);

        assertEq(students.length, 1);
        assertEq(students[0], student1);
        assertEq(attendanceCounts[0], 3);

        // Test non-existent cohort
        vm.expectRevert(Error.COHORT_DOES_NOT_EXIST.selector);
        StudentFacet(address(diamond)).getAttendanceByCohortAndTrack(99, web2Track);

        // Test getting student details
        LibAppStorage.studentDetails memory studentData = StudentFacet(address(diamond)).getStudent(student1);
        assertEq(studentData.firstname, "John");
        assertEq(studentData.lastname, "Doe");
        assertEq(studentData.cohort, cohortId);
        assertTrue(studentData.isActive);
    }

    // Test Case 4: Test getAttendanceDatesForStudent returns correct dates
    function testGetAttendanceDatesForStudent() public {
        // Log attendance for student1 on three different days
        vm.prank(student1);
        StudentFacet(address(diamond)).logAttendance(student1, cohortId, web2Track); // Day 1
        uint256 day1 = block.timestamp / 1 days;

        vm.warp(block.timestamp + 1 days);
        StudentFacet(address(diamond)).logAttendance(student1, cohortId, web2Track); // Day 2
        uint256 day2 = block.timestamp / 1 days;

        vm.warp(block.timestamp + 1 days);
        StudentFacet(address(diamond)).logAttendance(student1, cohortId, web2Track); // Day 3
        uint256 day3 = block.timestamp / 1 days;

        // Call getAttendanceDatesForStudent via the diamond proxy using ABI encoding
        (bool success, bytes memory data) = address(diamond).call(
            abi.encodeWithSignature(
                "getAttendanceDatesForStudent(address,uint8,uint8)", student1, cohortId, uint8(web2Track)
            )
        );
        require(success, "Diamond call failed");
        uint256[] memory dates = abi.decode(data, (uint256[]));
        assertEq(dates.length, 3);
        assertEq(dates[0], day1);
        assertEq(dates[1], day2);
        assertEq(dates[2], day3);
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
