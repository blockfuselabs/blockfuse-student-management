// SPDX-License-Identifier: MIT
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

    struct AttendanceRecord {
        uint256 date; 
        address studentAddress; 
    }

    uint8 public cohortCount = 1; // Counter for cohort IDs (initialized as 1, so that it will start from cohort 2)
    mapping(uint8 => Cohort) public cohorts; // Mapping of cohort ID to Cohort details
    mapping(address => string) public usernames;
    mapping(address => studentDetails) public student;
    mapping(address => int[] ) public studentScore;
    mapping(address => bool) public admins;
    mapping(address => uint256) adminIndexes;
    // Mapping: Cohort ID -> Track -> Day -> Student Address -> Attendance
    mapping(uint8 => mapping(Track => mapping(uint256 => mapping(address => bool)))) public attendance;
    mapping(uint8 => mapping(Track =>AttendanceRecord[])) public attendanceRecords;
    mapping(address => AttendanceRecord[]) public individualAttendanceRecord;
    address public superAdmin;
    address[] public adminList;
    uint256 adminCount;

    constructor () {
        superAdmin = msg.sender;
        admins[superAdmin] = true;
        adminList.push(superAdmin);
        adminIndexes[superAdmin] = adminCount++;
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

    // Modifier to ensure student is active
    modifier onlyActiveStudent(address _studentAddress) {
        require(student[_studentAddress].isActive, Error.STUDENT_IS_NOT_ACTIVE());
        _;
    }

    // Modifier to ensure only owner of address or any of the admins to log time for students
    modifier onlyOwnerOrAdmin(address _studentAddress) {
        require(admins[msg.sender] || msg.sender == superAdmin || msg.sender == _studentAddress, Error.UNAUTHORIZED_ACCESS());
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
        adminList.push(adminAddress);
        adminIndexes[adminAddress] = adminCount++;

        emit Event.AdminAdded(adminAddress);
        return true;
    }

    function  removeAdmin(address adminAddress) external onlySuperAdmin returns (bool){
        admins[adminAddress] = false;
        uint256 index = adminIndexes[adminAddress];

        uint256 lastIndex = adminList.length - 1;
        if (index != lastIndex) {
            address lastAdmin = adminList[lastIndex];
            adminList[index] = lastAdmin;
            adminIndexes[lastAdmin] = index;
        }

        adminList.pop();

        delete adminIndexes[adminAddress];

        emit Event.AdminRemoved(adminAddress);
        return true;
    }

    function recordStudentAssesment(
        address _studentWalletAddress,
        int _studentScore
        ) external 
            onlyAdmin studentExist(_studentWalletAddress) 
            returns(bool)
        {
        studentScore[_studentWalletAddress].push(_studentScore);
        student[_studentWalletAddress].finalScore += _studentScore;
        int score = student[_studentWalletAddress].finalScore;
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

    function logAttendance(
        address _studentAddress,
        uint8 _cohortId,
        Track _track
    ) external onlyActiveStudent(_studentAddress) onlyOwnerOrAdmin(_studentAddress) {
        require(student[_studentAddress].cohort == _cohortId, Error.INVALID_COHORT_ID());
        require(student[_studentAddress].track == _track, Error.INVALID_TRACK());

        // Get the current day in UTC
        uint256 currentDay = block.timestamp / 1 days;

        // Check if attendance for this cohort, track, and day already exists
        require(!attendance[_cohortId][_track][currentDay][_studentAddress], Error.ALREADY_MARKED_ATTENDANCE());

        // Mark attendance
        attendance[_cohortId][_track][currentDay][_studentAddress] = true;

        AttendanceRecord memory record = AttendanceRecord({
            date: currentDay,
            studentAddress: _studentAddress
        });

        attendanceRecords[_cohortId][_track].push(record);

        individualAttendanceRecord[_studentAddress].push(record);

        emit Event.AttendanceLogged(_cohortId, _studentAddress, trackToString(_track), currentDay);
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

    function getAllCohorts()
    public
    view
    returns (
        uint8[] memory ids,
        uint256[] memory totalStudents,
        uint256[] memory startDates,
        uint256[] memory endDates,
        uint256[] memory durations,
        Track[][] memory tracks
    )
    {

        ids = new uint8[](cohortCount);
        totalStudents = new uint256[](cohortCount);
        startDates = new uint256[](cohortCount);
        endDates = new uint256[](cohortCount);
        durations = new uint256[](cohortCount);
        tracks = new Track[][](cohortCount);

        for (uint8 i = 2; i <= cohortCount; i++) {
            Cohort storage cohort = cohorts[i];
            ids[i - 2] = cohort.cohortId;
            totalStudents[i - 2] = cohort.totalStudents;
            startDates[i - 2] = cohort.startDate;
            endDates[i - 2] = cohort.endDate;
            durations[i - 2] = cohort.duration;
            tracks[i - 2] = cohort.cohortTracks;
        }

        return (ids, totalStudents, startDates, endDates, durations, tracks);
    }

    function getCohortTracks(uint8 _cohortId) public view returns (Track[] memory) {
        return cohorts[_cohortId].cohortTracks;
    }

    function getStudentAssesments(
        address _studentWalletAddress
        ) external studentExist(_studentWalletAddress) view returns(int[] memory)
    {
        return studentScore[_studentWalletAddress];
    }

    function getStudentFinalScore(
        address _studentWalletAddress
        ) external studentExist(_studentWalletAddress) view returns(int)
    {
        return student[_studentWalletAddress].finalScore;
    }

    function getStudentScoreByIndex(
        address _studentWalletAddress,
        uint index
        ) external studentExist(_studentWalletAddress) view returns(int)
    {
        require(studentScore[_studentWalletAddress].length > 0, "Student not yet Scored");
        require(index < studentScore[_studentWalletAddress].length , "Index out of range");

        return studentScore[_studentWalletAddress][index];
    } 

    function getStudentsByCohortAndTrack(
        uint8 _cohortId, 
        Track _track
    ) public view returns (studentDetails[] memory) {
        require(_cohortId > 0 && _cohortId <= cohortCount, Error.INVALID_COHORT_ID());
        
        Cohort storage cohort = cohorts[_cohortId];
        address[] memory studentAddresses = cohort.studentsByTrack[_track];
        
        studentDetails[] memory studentDetailsList = new studentDetails[](studentAddresses.length);
        
        for (uint256 i = 0; i < studentAddresses.length; i++) {
            studentDetailsList[i] = student[studentAddresses[i]];
        }
        
        return studentDetailsList;
    }

    function getAttendanceByCohortAndTrack(
        uint8 _cohortId, 
        Track _track
    ) 
        external 
        view 
        returns (address[] memory, uint256[] memory) 
    {
        Cohort storage cohort = cohorts[_cohortId];
        require(cohort.cohortId != 0, Error.COHORT_DOES_NOT_EXIST());

        uint256 cohortStartDay = cohort.startDate / 1 days;
        uint256 cohortEndDay = cohort.endDate / 1 days;

        address[] memory students = cohort.studentsByTrack[_track];
        uint256[] memory attendanceCounts = new uint256[](students.length);

        for (uint256 i = 0; i < students.length; i++) {
            address studentAddress = students[i];
            uint256 count = 0;

            for (uint256 day = cohortStartDay; day <= cohortEndDay; day++) {
                if (attendance[_cohortId][_track][day][studentAddress]) {
                    count++;
                }
            }
            attendanceCounts[i] = count;
        }

        return (students, attendanceCounts);
    }

    function hasAttendance(
        address _studentAddress,
        uint8 _cohortId,
        Track _track,
        uint256 _day
    ) external view returns (bool) {
        return attendance[_cohortId][_track][_day][_studentAddress];
    }

    function getStudent(address _studentAddress) external view returns(studentDetails memory studentData) {
        studentData = student[_studentAddress];
    } 

    // function getAllAdmins() public view returns (admins memory) {
    //     Cohort[] memory allCohorts = new Cohort[](cohortCount);
    //     for (uint8 i = 1; i <= cohortCount; i++) {
    //         Cohort storage cohort = cohorts[i];
    //         allCohorts[i - 1] = cohort;
    //     }
    //     return allCohorts;
    // }

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

    function disableStudent(address _studentAddress) public onlyAdmin {
        student[_studentAddress].isActive = false;
    }

    function enableStudent(address _studentAddress) public onlyAdmin {
        student[_studentAddress].isActive = true;
    }

    // =====================================================================================
    // =========================== CONVERT INTERNAL FUNCTIONS FOR TEST =====================
    // =====================================================================================

    function testTrackToString(Track _track) public pure returns (string memory) {
        return trackToString(_track);
    }
}
