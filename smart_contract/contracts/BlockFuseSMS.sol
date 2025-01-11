// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import { Event } from "../library/Event.sol";
import { Error } from "../library/Error.sol";

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
    uint8 public cohortCount = 1; // Counter for cohort IDs (initialized as 1, so that it will start from cohort 2)
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
