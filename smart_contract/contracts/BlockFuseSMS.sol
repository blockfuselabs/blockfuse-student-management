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
        uint8 cohort;
        bool isActive;
        int256 finalScore;
        address studentAddress;
    }

    struct Cohort {
        uint8 cohortId;
        Track[] cohortTracks;
        uint256 totalStudents;
        uint256 startDate;
        uint256 endDate;
        uint256 duration;
        mapping(Track => address[]) studentsByTrack;
    }

    uint8 public cohortCount = 1; // Counter for cohort IDs (initialized as 1, so that it will start from cohort 2)
    mapping(uint8 => Cohort) public cohorts; // Mapping of cohort ID to Cohort details
    mapping(address => string) public usernames;
    mapping(address => studentDetails) student;
    mapping(address => int[] ) public studentScore;
    mapping(address => bool) admins;
    address public superAdmin;

    constructor () {
        superAdmin = msg.sender;
        admins[superAdmin] = true;
    }

    // =====================================================================================
    // ===========================   ALL MODIFIERS  ========================================
    // =====================================================================================

    modifier validDates(uint256 startDate, uint256 endDate) {
        require(startDate < endDate, Error.END_DATE_MUST_BE_GREATER_THAN_START());
        _;
    }

    modifier onlyAdmin{
        require(admins[msg.sender] || msg.sender == superAdmin, Error.UNAUTHORIZED_ACCESS());
        _;
    }

    modifier onlySuperAdmin{
         require(msg.sender == superAdmin, Error.UNAUTHORIZED_ACCESS());
         _;
    }

    modifier studentExist(address _studentWalletAddress){
        require(_studentWalletAddress != address(0) && student[_studentWalletAddress].isActive == true, Error.STUDENT_DOES_NOT_EXIST());
        _;
    }

    // =====================================================================================
    // =========================== SETTER FUNCTIONS ========================================
    // =====================================================================================

    function createCohort(
        uint256 _startDate, 
        uint256 _endDate
    ) public 
        validDates(_startDate, _endDate)
        onlySuperAdmin
    {
        cohortCount++;
        Cohort storage newCohort = cohorts[cohortCount];
        newCohort.cohortId = cohortCount;
        newCohort.startDate = _startDate;
        newCohort.endDate = _endDate;
        newCohort.duration = _endDate - _startDate;

        emit Event.CohortCreated(cohortCount);
    }

    function addTrackToCohort(uint8 _cohortId, Track _track) public onlySuperAdmin {
        require(cohorts[_cohortId].cohortId != 0, Error.COHORT_DOES_NOT_EXIST());
        
        cohorts[_cohortId].cohortTracks.push(_track);

        emit Event.CohortTrackAdded(_cohortId, trackToString(_track));
    }


    function addAdmin( address adminAddress) external onlySuperAdmin returns(bool) {
        admins[adminAddress] = true;
        emit Event.AdminAdded(adminAddress);
        return true;
    }

    function  removeAdmin(address adminAddress) external onlySuperAdmin returns (bool){
        admins[adminAddress] = false;
        emit Event.AdminRemoved(adminAddress);
        return true;
        
    }

    function recordStudentAssesment(address _studentWalletAddress, int _studentScore) external onlyAdmin studentExist(_studentWalletAddress) returns(bool){
        // Todo: check if the cohort that the student belongs to is still in session
        // The above Todo depends on uncle B implementation
        studentScore[_studentWalletAddress].push(_studentScore);
        int score = student[_studentWalletAddress].finalScore += _studentScore;
        emit Event.AssessmentRecorded(_studentWalletAddress, _studentScore,score,block.timestamp , msg.sender);
        return true;

    }

    function registerStudent(
        string memory _firstname,
        string memory _lastname,
        string memory _twitter,
        string memory _linkedin,
        string memory _github,
        Track _track,
        uint8 _cohort,
        address _studentAddress
    ) external onlyAdmin {

        string memory usernameConstruct = string(abi.encodePacked(_firstname, " ", _lastname));

        studentDetails memory newStudent = studentDetails ({
            firstname: _firstname,
            lastname: _lastname,
            username: usernameConstruct,
            twitter: _twitter,
            linkedin: _linkedin,
            github: _github,
            track: _track,
            cohort: _cohort,
            isActive: true,
            finalScore: 0,
            studentAddress: _studentAddress
        });

        student[_studentAddress] = newStudent;
        usernames[_studentAddress] = usernameConstruct;

        // Onboard student to a particular cohort 

        addStudentToCohort(_cohort, _studentAddress, _track);

        emit Event.StudentAddedToCohort(_studentAddress, _cohort);

    }

    // =====================================================================================
    // =========================== GETTER FUNCTIONS ========================================
    // =====================================================================================

    function getCohort(uint8 _cohortId) 
    public 
    view 
    returns (
        uint256 id,
        string[] memory tracks,
        uint256 totalStudents,
        uint256 startDate,
        uint256 endDate,
        uint256 duration,
        address[][] memory studentsByTrack
    ) 
    {
        require(_cohortId > 0 && _cohortId <= cohortCount, Error.COHORT_DOES_NOT_EXIST());

        Cohort storage cohort = cohorts[_cohortId];

        // Convert the array of `Track` enums to an array of strings
        string[] memory trackNames = new string[](cohort.cohortTracks.length);
        address[][] memory allStudents = new address[][](cohort.cohortTracks.length);

        for (uint256 i = 0; i < cohort.cohortTracks.length; i++) {
            Track track = cohort.cohortTracks[i];
            trackNames[i] = trackToString(track);
            allStudents[i] = cohort.studentsByTrack[track];
        }

        return (
            cohort.cohortId,
            trackNames,
            cohort.totalStudents,
            cohort.startDate,
            cohort.endDate,
            cohort.duration,
            allStudents
        );
    }


    function getCohortTracks(uint8 _cohortId) public view returns (Track[] memory) {
        return cohorts[_cohortId].cohortTracks;
    }

    function getStudentAssesments(address _studentWalletAddress) 
    external studentExist(_studentWalletAddress)
    view returns(int[] memory)
    {
        return studentScore[_studentWalletAddress];
    }

    function getStudentFinalScore(address _studentWalletAddress) 
    external studentExist(_studentWalletAddress) 
    view returns(int)
    {
        return student[_studentWalletAddress].finalScore;
    }

    function getStudentScoreByIndex(address _studentWalletAddress, uint index) 
    external studentExist(_studentWalletAddress) 
    view returns(int)
    {
        require(studentScore[_studentWalletAddress].length > 0, "Student not yet Scored");
        require(index < studentScore[_studentWalletAddress].length , "Index out of range");

        return studentScore[_studentWalletAddress][index];
    } 

    function getStudent(address _studentAddress) external view returns(studentDetails memory studentData) {
        studentData = student[_studentAddress];
    } 

    // =====================================================================================
    // =========================== HELPER FUNCTIONS ========================================
    // =====================================================================================

    function trackToString(Track _track) internal pure returns (string memory) {
        if (_track == Track.web2) {
            return "web2";
        } else {
            return "web3";
        }
    }
    

    function addStudentToCohort(
        uint8 _cohortId, 
        address _student, 
        Track _track
    ) public onlyAdmin {
        require(_cohortId > 0 && _cohortId <= cohortCount, Error.INVALID_COHORT_ID());
        Cohort storage cohort = cohorts[_cohortId];

        // Ensure the track exists in the cohort
        bool trackExists = false;
        for (uint256 i = 0; i < cohort.cohortTracks.length; i++) {
            if (cohort.cohortTracks[i] == _track) {
                trackExists = true;
                break;
            }
        }
        require(trackExists, Error.TRACK_DOES_NOT_EXIST_IN_COHORT());

        // Add the student to the appropriate track
        cohort.studentsByTrack[_track].push(_student);
        cohort.totalStudents++;

        emit Event.StudentAddedToTrack(_cohortId, trackToString(_track), _student);
    }

    // =====================================================================================
    // =========================== CONVERT INTERNAL FUNCTIONS FOR TEST =====================
    // =====================================================================================

    function testTrackToString(Track _track) public pure returns (string memory) {
        return trackToString(_track);
    }
}
