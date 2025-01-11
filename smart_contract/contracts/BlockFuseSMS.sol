// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract BlockFuseSMS {

    enum Track { web2, web3 }
    event AssessmentRecorded(address studentAddress, int studentScoreAdded, int totalScore, uint time, address instructorAddress);
    event AddAdmin(address adminAdded);
    event RemoveAdmin(address adminRemove);
    modifier onlyAdmin{
        require(admins[msg.sender], "Unauthorized access");
        _;
    }

      modifier onlySuperAdmin{
         require(msg.sender == superAdmin, "Unauthories access");
         _;
    }

    modifier studentExist(address _studentWalletAddress){
        require(_studentWalletAddress != address(0) && student[_studentWalletAddress].isActive == true, "Student does not exist");
        _;
    }

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
        int finalScore;
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
    mapping(address => int[] ) public studentScore;
    mapping(address => bool) admins;
    address superAdmin;

    constructor () {
        superAdmin = msg.sender;
        admins[superAdmin] = true;
    }

function addAdmin( address adminAddress) external onlySuperAdmin returns(bool) {
    admins[adminAddress] = true;
    emit AddAdmin(adminAddress);
    return true;
}

function  removeAdmin(address adminAddress) external onlySuperAdmin returns (bool){
    admins[adminAddress] = false;
    emit RemoveAdmin(adminAddress);
    return true;
    
}
function recordStudentAssesment(address _studentWalletAddress, int _studentScore) external onlyAdmin studentExist(_studentWalletAddress) returns(bool){
// Todo: check if the cohort that the student belongs to is still in session
// The above Todo depends on uncle B implementation
studentScore[_studentWalletAddress].push(_studentScore);
int score = student[_studentWalletAddress].finalScore += _studentScore;
emit AssessmentRecorded(_studentWalletAddress, _studentScore,score,block.timestamp , msg.sender);
return true;

}

function getStudentAssesments(address _studentWalletAddress) external studentExist(_studentWalletAddress) view returns(int[] memory)
{
return studentScore[_studentWalletAddress];
}

function getStudentFinalScore(address _studentWalletAddress) external studentExist(_studentWalletAddress) view returns(int)
{
return student[_studentWalletAddress].finalScore;
}

function getStudentScoreByIndex(address _studentWalletAddress, uint index) external studentExist(_studentWalletAddress) view returns(int){
require(studentScore[_studentWalletAddress].length > 0, "Student not yet Scored");
require(index < studentScore[_studentWalletAddress].length , "Index out of range");

return studentScore[_studentWalletAddress][index];
}

}
