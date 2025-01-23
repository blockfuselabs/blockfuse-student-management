// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import "../libraries/Error.sol";
import "../libraries/Event.sol";
import "../libraries/LibAppStorage.sol";

contract AdminFacet {
    LibAppStorage.Layout layout;

    modifier validDates(uint256 startDate, uint256 endDate) {
        require(startDate < endDate, Error.END_DATE_MUST_BE_GREATER_THAN_START());
        _;
    }

    modifier onlyAdmin{
        require(layout.admins[msg.sender] || msg.sender == layout.superAdmin, Error.UNAUTHORIZED_ACCESS());
        _;
    }

    modifier onlySuperAdmin{
         require(msg.sender == layout.superAdmin, Error.UNAUTHORIZED_ACCESS());
         _;
    }

    modifier studentExist(address _studentWalletAddress){
        require(_studentWalletAddress != address(0) && layout.student[_studentWalletAddress].isActive == true, Error.STUDENT_DOES_NOT_EXIST());
        _;
    }

    function addAdmin( address adminAddress) external onlySuperAdmin returns(bool) {
        layout.admins[adminAddress] = true;
        emit Event.AdminAdded(adminAddress);
        return true;
    }

    function  removeAdmin(address adminAddress) external onlySuperAdmin returns (bool){
        layout.admins[adminAddress] = false;
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
        layout.studentScore[_studentWalletAddress].push(_studentScore);
        layout.student[_studentWalletAddress].finalScore += _studentScore;
        int score = layout.student[_studentWalletAddress].finalScore;
        emit Event.AssessmentRecorded(_studentWalletAddress, _studentScore,score,block.timestamp , msg.sender);
        return true;

    }

    function registerStudent(
        string memory _firstname,
        string memory _lastname,
        string memory _twitter,
        string memory _linkedin,
        string memory _github,
        LibAppStorage.Track _track,
        uint8 _cohort,
        address _studentAddress
    ) external onlyAdmin {

        string memory usernameConstruct = string(abi.encodePacked(_firstname, " ", _lastname));

        LibAppStorage.studentDetails memory newStudent;
        newStudent.firstname = _firstname;
        newStudent.lastname = _lastname;
        newStudent.username = usernameConstruct;
        newStudent.twitter = _twitter;
        newStudent.linkedin = _linkedin;
        newStudent.github = _github;
        newStudent.track = _track;
        newStudent.cohort = _cohort;
        newStudent.isActive = true;
        newStudent.finalScore = 0;
        newStudent.studentAddress = _studentAddress;

        layout.student[_studentAddress] = newStudent;
        layout.usernames[_studentAddress] = usernameConstruct;

        // Onboard student to a particular cohort 
        addStudentToCohort(_cohort, _studentAddress, _track);

        emit Event.StudentAddedToCohort(_studentAddress, _cohort);

    }


    function addStudentToCohort(
        uint8 _cohortId, 
        address _student, 
        LibAppStorage.Track _track
    ) public onlyAdmin {
        require(_cohortId > 0 && _cohortId <= layout.cohortCount, Error.INVALID_COHORT_ID());
        LibAppStorage.Cohort storage cohort = layout.cohorts[_cohortId];

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

        emit Event.StudentAddedToTrack(_cohortId, LibAppStorage.trackToString(_track), _student);
    }

    function disableStudent(address _studentAddress) public onlyAdmin {
        layout.student[_studentAddress].isActive = false;
    }

    function enableStudent(address _studentAddress) public onlyAdmin {
        layout.student[_studentAddress].isActive = true;
    }
}