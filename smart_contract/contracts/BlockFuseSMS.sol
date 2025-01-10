// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract BlockFuseSMS {

    enum Track { web2, web3 }

    struct studentDetails {
        string firstname;
        string lastname;
        string username;
        string twitter;
        string linkedin;
        string github;
        Track track;
        uint256 cohort;
        bool isActive;
        uint256 finalScore;
    }

    struct cohort {
        uint8 cohortId;
        Track cohortTrack;
        uint256 totalStudents;
        uint256 startDate;
        uint256 endDate;
        uint256 duration;

    }


    mapping(address => studentDetails) student;


}
