// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../contracts/interfaces/IDiamondCut.sol";
import "../contracts/facets/DiamondCutFacet.sol";
import "../contracts/facets/DiamondLoupeFacet.sol";
import "../contracts/facets/OwnershipFacet.sol";
import "../contracts/Diamond.sol";
import "../contracts/facets/AdminFacet.sol";
import "../contracts/facets/AdminUsernameFacet.sol";
import "../contracts/facets/CohortFacet.sol";
import "../contracts/facets/StudentFacet.sol";
import "../contracts/libraries/LibAppStorage.sol";
import "../contracts/libraries/Error.sol";
import "../contracts/libraries/Event.sol";

contract AdminUsernameFacetTest is Test {
    Diamond diamond;
    DiamondCutFacet dCutFacet;
    DiamondLoupeFacet dLoupe;
    OwnershipFacet ownerF;
    AdminFacet adminFacet;
    AdminUsernameFacet adminUsernameFacet;
    CohortFacet cohortFacet;
    StudentFacet studentFacet;

    address admin1 = mkaddr("admin1");
    address admin2 = mkaddr("admin2");
    address admin3 = mkaddr("admin3");
    address student1 = mkaddr("student1");
    address superAdmin = mkaddr("superAdmin");
    address unauthorized = mkaddr("unauthorized");

    string constant SUPER_ADMIN_USERNAME = "superadmin";
    string constant ADMIN1_USERNAME = "admin_one";
    string constant ADMIN2_USERNAME = "admin_two";
    string constant ADMIN3_USERNAME = "admin_three";

    function mkaddr(string memory name) public returns (address) {
        address addr = address(uint160(uint256(keccak256(abi.encodePacked(name)))));
        vm.label(addr, name);
        return addr;
    }

    function generateSelectors(string memory _facetName) internal returns (bytes4[] memory selectors) {
        string[] memory cmd = new string[](3);
        cmd[0] = "node";
        cmd[1] = "scripts/genSelectors.js";
        cmd[2] = _facetName;
        bytes memory res = vm.ffi(cmd);
        selectors = abi.decode(res, (bytes4[]));
    }

    function setUp() public {
        vm.startPrank(superAdmin);

        // Deploy facets
        dCutFacet = new DiamondCutFacet();
        diamond = new Diamond(address(dCutFacet));
        dLoupe = new DiamondLoupeFacet();
        ownerF = new OwnershipFacet();
        adminFacet = new AdminFacet();
        adminUsernameFacet = new AdminUsernameFacet();
        cohortFacet = new CohortFacet();
        studentFacet = new StudentFacet();

        // Build cut struct
        IDiamondCut.FacetCut[] memory cut = new IDiamondCut.FacetCut[](6);
        
        cut[0] = IDiamondCut.FacetCut({
            facetAddress: address(dLoupe),
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: generateSelectors("DiamondLoupeFacet")
        });
        
        cut[1] = IDiamondCut.FacetCut({
            facetAddress: address(ownerF),
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: generateSelectors("OwnershipFacet")
        });
        
        cut[2] = IDiamondCut.FacetCut({
            facetAddress: address(adminFacet),
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: generateSelectors("AdminFacet")
        });
        
        cut[3] = IDiamondCut.FacetCut({
            facetAddress: address(adminUsernameFacet),
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: generateSelectors("AdminUsernameFacet")
        });
        
        cut[4] = IDiamondCut.FacetCut({
            facetAddress: address(cohortFacet),
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: generateSelectors("CohortFacet")
        });
        
        cut[5] = IDiamondCut.FacetCut({
            facetAddress: address(studentFacet),
            action: IDiamondCut.FacetCutAction.Add,
            functionSelectors: generateSelectors("StudentFacet")
        });

        // Execute diamond cut
        IDiamondCut(address(diamond)).diamondCut(cut, address(0), "");

        // Add some regular admins for testing
        AdminFacet(address(diamond)).addAdmin(admin1);
        AdminFacet(address(diamond)).addAdmin(admin2);

        vm.stopPrank();
    }

    function testSetAdminUsernameBySuperAdmin() public {
        vm.startPrank(superAdmin);

        // Test setting username for super admin
        vm.expectEmit(true, false, false, true);
        emit Event.AdminUsernameSet(superAdmin, SUPER_ADMIN_USERNAME);
        AdminUsernameFacet(address(diamond)).setAdminUsername(superAdmin, SUPER_ADMIN_USERNAME);

        // Test setting username for regular admin
        vm.expectEmit(true, false, false, true);
        emit Event.AdminUsernameSet(admin1, ADMIN1_USERNAME);
        AdminUsernameFacet(address(diamond)).setAdminUsername(admin1, ADMIN1_USERNAME);

        // Verify usernames were set
        assertEq(AdminUsernameFacet(address(diamond)).getAdminUsername(superAdmin), SUPER_ADMIN_USERNAME);
        assertEq(AdminUsernameFacet(address(diamond)).getAdminUsername(admin1), ADMIN1_USERNAME);

        vm.stopPrank();
    }

    function testSetAdminUsernameUnauthorized() public {
        // Test unauthorized user cannot set admin username
        vm.prank(unauthorized);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        AdminUsernameFacet(address(diamond)).setAdminUsername(admin1, ADMIN1_USERNAME);

        // Test regular admin cannot set other admin's username
        vm.prank(admin1);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        AdminUsernameFacet(address(diamond)).setAdminUsername(admin2, ADMIN2_USERNAME);
    }

    function testSetAdminUsernameInvalidInputs() public {
        vm.startPrank(superAdmin);

        // Test empty username
        vm.expectRevert("Username cannot be empty");
        AdminUsernameFacet(address(diamond)).setAdminUsername(admin1, "");

        // Test zero address
        vm.expectRevert(Error.INVALID_ADDRESS.selector);
        AdminUsernameFacet(address(diamond)).setAdminUsername(address(0), ADMIN1_USERNAME);

        // Test non-admin address
        vm.expectRevert("Address is not an admin");
        AdminUsernameFacet(address(diamond)).setAdminUsername(unauthorized, ADMIN1_USERNAME);

        vm.stopPrank();
    }

    function testSetMyUsername() public {
        // Test super admin setting own username
        vm.prank(superAdmin);
        vm.expectEmit(true, false, false, true);
        emit Event.AdminUsernameSet(superAdmin, SUPER_ADMIN_USERNAME);
        AdminUsernameFacet(address(diamond)).setMyUsername(SUPER_ADMIN_USERNAME);

        // Test regular admin setting own username
        vm.prank(admin1);
        vm.expectEmit(true, false, false, true);
        emit Event.AdminUsernameSet(admin1, ADMIN1_USERNAME);
        AdminUsernameFacet(address(diamond)).setMyUsername(ADMIN1_USERNAME);

        // Verify usernames were set
        assertEq(AdminUsernameFacet(address(diamond)).getAdminUsername(superAdmin), SUPER_ADMIN_USERNAME);
        assertEq(AdminUsernameFacet(address(diamond)).getAdminUsername(admin1), ADMIN1_USERNAME);
    }

    function testSetMyUsernameUnauthorized() public {
        // Test unauthorized user cannot set username
        vm.prank(unauthorized);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        AdminUsernameFacet(address(diamond)).setMyUsername("unauthorized_user");
    }

    function testSetMyUsernameEmptyString() public {
        vm.prank(admin1);
        vm.expectRevert("Username cannot be empty");
        AdminUsernameFacet(address(diamond)).setMyUsername("");
    }

    function testGetAdminUsername() public {
        // Set usernames first
        vm.startPrank(superAdmin);
        AdminUsernameFacet(address(diamond)).setAdminUsername(superAdmin, SUPER_ADMIN_USERNAME);
        AdminUsernameFacet(address(diamond)).setAdminUsername(admin1, ADMIN1_USERNAME);
        vm.stopPrank();

        // Test getting usernames
        assertEq(AdminUsernameFacet(address(diamond)).getAdminUsername(superAdmin), SUPER_ADMIN_USERNAME);
        assertEq(AdminUsernameFacet(address(diamond)).getAdminUsername(admin1), ADMIN1_USERNAME);

        // Test getting username for admin without username (should return empty string)
        assertEq(AdminUsernameFacet(address(diamond)).getAdminUsername(admin2), "");
    }

    function testGetAdminUsernameNonAdmin() public {
        vm.expectRevert("Address is not an admin");
        AdminUsernameFacet(address(diamond)).getAdminUsername(unauthorized);
    }

    function testGetAllAdminsWithUsernames() public {
        // Set usernames for all admins
        vm.startPrank(superAdmin);
        AdminUsernameFacet(address(diamond)).setAdminUsername(superAdmin, SUPER_ADMIN_USERNAME);
        AdminUsernameFacet(address(diamond)).setAdminUsername(admin1, ADMIN1_USERNAME);
        AdminUsernameFacet(address(diamond)).setAdminUsername(admin2, ADMIN2_USERNAME);
        vm.stopPrank();

        // Get all admins with usernames
        (address[] memory addresses, string[] memory usernames) = AdminUsernameFacet(address(diamond)).getAllAdminsWithUsernames();

        // Should have 3 admins (1 super admin + 2 regular admins)
        assertEq(addresses.length, 3);
        assertEq(usernames.length, 3);

        // Super admin should be first
        assertEq(addresses[0], superAdmin);
        assertEq(usernames[0], SUPER_ADMIN_USERNAME);

        // Check that all admins are present (order of regular admins may vary)
        bool admin1Found = false;
        bool admin2Found = false;
        
        for (uint256 i = 1; i < addresses.length; i++) {
            if (addresses[i] == admin1) {
                assertEq(usernames[i], ADMIN1_USERNAME);
                admin1Found = true;
            } else if (addresses[i] == admin2) {
                assertEq(usernames[i], ADMIN2_USERNAME);
                admin2Found = true;
            }
        }
        
        assertTrue(admin1Found, "Admin1 not found in list");
        assertTrue(admin2Found, "Admin2 not found in list");
    }

    function testGetAllAdminsWithUsernamesEmptyUsernames() public view {
        // Don't set any usernames, test with empty usernames
        (address[] memory addresses, string[] memory usernames) = AdminUsernameFacet(address(diamond)).getAllAdminsWithUsernames();

        // Should still return all admins, but with empty usernames
        assertEq(addresses.length, 3); // 1 super admin + 2 regular admins
        assertEq(usernames.length, 3);
        
        // Super admin should be first
        assertEq(addresses[0], superAdmin);
        assertEq(usernames[0], ""); // Empty username
        
        // All usernames should be empty
        for (uint256 i = 0; i < usernames.length; i++) {
            assertEq(usernames[i], "");
        }
    }

    function testAddAdminWithUsername() public {
        vm.prank(superAdmin);
        
        // Test adding new admin with username
        vm.expectEmit(true, false, false, false);
        emit Event.AdminAdded(admin3);
        vm.expectEmit(true, false, false, true);
        emit Event.AdminUsernameSet(admin3, ADMIN3_USERNAME);
        
        bool result = AdminUsernameFacet(address(diamond)).addAdminWithUsername(admin3, ADMIN3_USERNAME);
        assertTrue(result);

        // Verify admin was added and username was set
        address[] memory allAdmins = AdminFacet(address(diamond)).getAllAdmins();
        bool admin3Found = false;
        for (uint256 i = 0; i < allAdmins.length; i++) {
            if (allAdmins[i] == admin3) {
                admin3Found = true;
                break;
            }
        }
        assertTrue(admin3Found, "Admin3 was not added to admin list");
        assertEq(AdminUsernameFacet(address(diamond)).getAdminUsername(admin3), ADMIN3_USERNAME);
    }

    function testAddAdminWithUsernameUnauthorized() public {
        vm.prank(unauthorized);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        AdminUsernameFacet(address(diamond)).addAdminWithUsername(admin3, ADMIN3_USERNAME);

        vm.prank(admin1);
        vm.expectRevert(Error.UNAUTHORIZED_ACCESS.selector);
        AdminUsernameFacet(address(diamond)).addAdminWithUsername(admin3, ADMIN3_USERNAME);
    }

    function testAddAdminWithUsernameInvalidInputs() public {
        vm.startPrank(superAdmin);

        // Test zero address
        vm.expectRevert(Error.INVALID_ADDRESS.selector);
        AdminUsernameFacet(address(diamond)).addAdminWithUsername(address(0), ADMIN3_USERNAME);

        // Test empty username
        vm.expectRevert("Username cannot be empty");
        AdminUsernameFacet(address(diamond)).addAdminWithUsername(admin3, "");

        // Test existing admin
        vm.expectRevert("Admin already exists");
        AdminUsernameFacet(address(diamond)).addAdminWithUsername(admin1, ADMIN1_USERNAME);

        vm.stopPrank();
    }

    function testUsernameOverwrite() public {
        vm.startPrank(superAdmin);
        
        // Set initial username
        AdminUsernameFacet(address(diamond)).setAdminUsername(admin1, ADMIN1_USERNAME);
        assertEq(AdminUsernameFacet(address(diamond)).getAdminUsername(admin1), ADMIN1_USERNAME);
        
        // Overwrite with new username
        string memory newUsername = "admin_one_updated";
        AdminUsernameFacet(address(diamond)).setAdminUsername(admin1, newUsername);
        assertEq(AdminUsernameFacet(address(diamond)).getAdminUsername(admin1), newUsername);
        
        vm.stopPrank();
    }

    function testIntegrationWithExistingAdminFacet() public {
        vm.startPrank(superAdmin);
        
        // Set username for admin
        AdminUsernameFacet(address(diamond)).setAdminUsername(admin1, ADMIN1_USERNAME);
        
        // Remove admin using existing AdminFacet
        AdminFacet(address(diamond)).removeAdmin(admin1);
        
        // Username should still be in storage, but getAdminUsername should revert
        vm.expectRevert("Address is not an admin");
        AdminUsernameFacet(address(diamond)).getAdminUsername(admin1);
        
        // Re-add admin
        AdminFacet(address(diamond)).addAdmin(admin1);
        
        // Username should still be accessible (storage persists)
        assertEq(AdminUsernameFacet(address(diamond)).getAdminUsername(admin1), ADMIN1_USERNAME);
        
        vm.stopPrank();
    }

    function testReplaceAdminPreservesUsername() public {
        vm.startPrank(superAdmin);
        
        // Set username for admin1
        AdminUsernameFacet(address(diamond)).setAdminUsername(admin1, ADMIN1_USERNAME);
        
        // Replace admin1 with admin3 using existing AdminFacet
        AdminFacet(address(diamond)).replaceAdmin(admin1, admin3);
        
        // admin1 should no longer be admin, admin3 should be admin
        vm.expectRevert("Address is not an admin");
        AdminUsernameFacet(address(diamond)).getAdminUsername(admin1);
        
        // admin3 should have no username initially
        assertEq(AdminUsernameFacet(address(diamond)).getAdminUsername(admin3), "");
        
        // But admin1's username should still be in storage (if re-added)
        AdminFacet(address(diamond)).addAdmin(admin1);
        assertEq(AdminUsernameFacet(address(diamond)).getAdminUsername(admin1), ADMIN1_USERNAME);
        
        vm.stopPrank();
    }
}