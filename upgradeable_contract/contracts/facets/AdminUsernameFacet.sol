// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import "../libraries/Error.sol";
import "../libraries/Event.sol";
import "../libraries/LibAppStorage.sol";

contract AdminUsernameFacet {
    modifier onlyAdmin() {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        require(layout.admins[msg.sender] || msg.sender == layout.superAdmin, Error.UNAUTHORIZED_ACCESS());
        _;
    }

    modifier onlySuperAdmin() {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        require(msg.sender == layout.superAdmin, Error.UNAUTHORIZED_ACCESS());
        _;
    }

    function setAdminUsername(address adminAddress, string calldata username) external onlySuperAdmin {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        require(adminAddress != address(0), Error.INVALID_ADDRESS());
        require(bytes(username).length > 0, "Username cannot be empty");
        require(layout.admins[adminAddress] || adminAddress == layout.superAdmin, "Address is not an admin");
        
        layout.usernames[adminAddress] = username;
        emit Event.AdminUsernameSet(adminAddress, username);
    }
    
    function setMyUsername(string calldata username) external onlyAdmin {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        require(bytes(username).length > 0, "Username cannot be empty");
        
        layout.usernames[msg.sender] = username;
        emit Event.AdminUsernameSet(msg.sender, username);
    }
    
    function getAdminUsername(address adminAddress) external view returns (string memory) {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        require(layout.admins[adminAddress] || adminAddress == layout.superAdmin, "Address is not an admin");
        return layout.usernames[adminAddress];
    }
    
    function getAllAdminsWithUsernames() external view returns (address[] memory addresses, string[] memory usernames) {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        
        // Include super admin in the list
        uint256 totalAdmins = layout.adminList.length + 1;
        addresses = new address[](totalAdmins);
        usernames = new string[](totalAdmins);
        
        // Add super admin first
        addresses[0] = layout.superAdmin;
        usernames[0] = layout.usernames[layout.superAdmin];
        
        // Add regular admins
        for (uint256 i = 0; i < layout.adminList.length; i++) {
            addresses[i + 1] = layout.adminList[i];
            usernames[i + 1] = layout.usernames[layout.adminList[i]];
        }
        
        return (addresses, usernames);
    }
    
    function addAdminWithUsername(address adminAddress, string calldata username) external onlySuperAdmin returns (bool) {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        require(adminAddress != address(0), Error.INVALID_ADDRESS());
        require(bytes(username).length > 0, "Username cannot be empty");
        require(!layout.admins[adminAddress], "Admin already exists");

        layout.admins[adminAddress] = true;
        layout.adminList.push(adminAddress);
        layout.usernames[adminAddress] = username;
        
        emit Event.AdminAdded(adminAddress);
        emit Event.AdminUsernameSet(adminAddress, username);
        return true;
    }
}