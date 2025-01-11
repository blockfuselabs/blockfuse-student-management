// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import { Event } from "../library/Event.sol";
import { Error } from "../library/Error.sol";

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
        int256 finalScore;
    }

    struct Cohort {
        uint8 cohortId;
        Track cohortTrack;
        uint256 totalStudents;
        uint256 startDate;
        uint256 endDate;
        uint256 duration;
        address[] students;
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
}    uint8 public cohortCount = 1; // Counter for cohort IDs (initialized as 1, so that it will start from cohort 2)
    mapping(uint8 => Cohort) public cohorts; // Mapping of cohort ID to Cohort details
    mapping(address => string) public usernames;

    // all modifiers
    modifier validDates(uint256 startDate, uint256 endDate) {
        require(startDate < endDate, Error.END_DATE_MUST_BE_GREATER_THAN_START());
        _;
    }

    // SETTER FUNCTIONS
    function createCohort(
        Track _track, 
        uint256 _startDate, 
        uint256 _endDate, 
        uint256 _duration
        ) public validDates(_startDate, _endDate) {

        cohortCount++;
        Cohort storage newCohort = cohorts[cohortCount];
        newCohort.cohortId = cohortCount;
        newCohort.cohortTrack = _track;
        newCohort.startDate = _startDate;
        newCohort.endDate = _endDate;
        newCohort.duration = _duration;

        emit Event.CohortCreated(cohortCount, trackToString(_track));
    }

    // GETTER FUNCTIONS
    function getCohort(uint8 _cohortId) public view returns (
        uint256 id,
        string memory track,
        uint256 totalStudents,
        uint256 startDate,
        uint256 endDate,
        address[] memory students
    ) {
        require(_cohortId > 0 && _cohortId <= cohortCount, Error.COHORT_DOES_NOT_EXIST());

        Cohort storage cohort = cohorts[_cohortId];
        
        return (
            cohort.cohortId, 
            trackToString(cohort.cohortTrack), 
            cohort.totalStudents, 
            cohort.startDate, 
            cohort.endDate, 
            cohort.students
        );
    }

    // HELPER FUNCTIONS
    function trackToString(Track _track) internal pure returns (string memory) {
        if (_track == Track.web2) {
            return "web2";
        } else {
            return "web3";
        }
    }

    function addStudentToCohort(uint8 _cohortId, address _student) public {
        require(_cohortId > 0 && _cohortId <= cohortCount, Error.INVALID_COHORT_ID());
        Cohort storage cohort = cohorts[_cohortId];
        cohort.students.push(_student);
        cohort.totalStudents++;

        emit Event.StudentAdded(_cohortId, _student);
    }
}
