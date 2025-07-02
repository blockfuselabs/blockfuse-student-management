// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import "../libraries/Error.sol";
import "../libraries/Event.sol";
import "../libraries/LibAppStorage.sol";

contract AdminFacet {
    modifier validDates(uint256 startDate, uint256 endDate) {
        require(startDate < endDate, Error.END_DATE_MUST_BE_GREATER_THAN_START());
        _;
    }

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

    modifier studentExist(address _studentWalletAddress) {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        require(
            _studentWalletAddress != address(0) && layout.student[_studentWalletAddress].isActive,
            Error.STUDENT_DOES_NOT_EXIST()
        );
        _;
    }

    function addAdmin(address adminAddress) external onlySuperAdmin returns (bool) {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        require(adminAddress != address(0), Error.INVALID_ADDRESS());
        require(!layout.admins[adminAddress], "Admin already exists");

        layout.admins[adminAddress] = true;
        layout.adminList.push(adminAddress);
        emit Event.AdminAdded(adminAddress);
        return true;
    }

    function removeAdmin(address adminAddress) external onlySuperAdmin returns (bool) {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        require(layout.admins[adminAddress], "Admin does not exist");

        layout.admins[adminAddress] = false;

        // Remove from adminList array
        for (uint256 i = 0; i < layout.adminList.length; i++) {
            if (layout.adminList[i] == adminAddress) {
                layout.adminList[i] = layout.adminList[layout.adminList.length - 1];
                layout.adminList.pop();
                break;
            }
        }

        emit Event.AdminRemoved(adminAddress);
        return true;
    }

    function recordStudentAssesment(address _studentWalletAddress, int256 _studentScore)
        external
        onlyAdmin
        studentExist(_studentWalletAddress)
        returns (bool)
    {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        layout.studentScore[_studentWalletAddress].push(_studentScore);
        layout.student[_studentWalletAddress].finalScore += _studentScore;
        int256 score = layout.student[_studentWalletAddress].finalScore;
        emit Event.AssessmentRecorded(_studentWalletAddress, _studentScore, score, block.timestamp, msg.sender);
        return true;
    }

    function registerStudent(LibAppStorage.studentDetails calldata newStudent) external onlyAdmin {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        require(bytes(newStudent.email).length > 0, "Email is required");
        string memory usernameConstruct = newStudent.username;

        LibAppStorage.studentDetails memory studentCopy = newStudent;
        studentCopy.isActive = true;
        studentCopy.finalScore = 0;

        layout.student[newStudent.studentAddress] = studentCopy;
        layout.usernames[newStudent.studentAddress] = usernameConstruct;

        // Onboard student to a particular cohort
        addStudentToCohort(newStudent.cohort, newStudent.studentAddress, newStudent.track);

        emit Event.StudentAddedToCohort(newStudent.studentAddress, newStudent.cohort);
    }

    function addStudentToCohort(uint8 _cohortId, address _student, LibAppStorage.Track _track) public onlyAdmin {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
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
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        layout.student[_studentAddress].isActive = false;
    }

    function enableStudent(address _studentAddress) public onlyAdmin {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        layout.student[_studentAddress].isActive = true;
    }

    function replaceStudentWallet(address oldAddress, address newAddress) external onlyAdmin {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        require(oldAddress != address(0) && newAddress != address(0), Error.INVALID_ADDRESS());
        require(layout.student[oldAddress].isActive, Error.STUDENT_DOES_NOT_EXIST());
        require(!layout.student[newAddress].isActive, Error.STUDENT_DOES_NOT_EXIST());

        uint8 cohortId = layout.student[oldAddress].cohort;
        LibAppStorage.Track track = layout.student[oldAddress].track;

        address[] storage students = layout.cohorts[cohortId].studentsByTrack[track];
        uint256 idx = students.length; // default to not found
        for (uint256 i = 0; i < students.length; i++) {
            if (students[i] == oldAddress) {
                idx = i;
                break;
            }
        }
        if (idx < students.length) {
            students[idx] = newAddress;
        }

        // --- MIGRATE ATTENDANCE ---
        LibAppStorage.Cohort storage cohort = layout.cohorts[cohortId];
        uint256 cohortStartDay = cohort.startDate / 1 days;
        uint256 cohortEndDay = cohort.endDate / 1 days;
        for (uint256 day = cohortStartDay; day <= cohortEndDay; day++) {
            if (layout.attendance[cohortId][track][day][oldAddress]) {
                layout.attendance[cohortId][track][day][newAddress] = true;
                delete layout.attendance[cohortId][track][day][oldAddress];
            }
        }

        // --- MIGRATE INDIVIDUAL ATTENDANCE RECORDS ---
        LibAppStorage.AttendanceRecord[] storage oldRecords = layout.individualAttendanceRecord[oldAddress];
        for (uint256 i = 0; i < oldRecords.length; i++) {
            LibAppStorage.AttendanceRecord memory record = oldRecords[i];
            // Update the studentAddress in the record
            record.studentAddress = newAddress;
            layout.individualAttendanceRecord[newAddress].push(record);
        }
        // Delete old records
        delete layout.individualAttendanceRecord[oldAddress];

        layout.student[newAddress] = layout.student[oldAddress];
        layout.student[newAddress].isActive = true;
        layout.student[newAddress].studentAddress = newAddress;
        // Deactivate the old address
        layout.student[oldAddress].isActive = false;

        emit Event.StudentWalletReplaced(oldAddress, newAddress);
    }

    function isStudentActive(address student) external view returns (bool) {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        return layout.student[student].isActive;
    }

    function getAllAdmins() external view returns (address[] memory) {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        return layout.adminList;
    }

    function getAttendanceDatesForStudent(address student, uint8 cohortId, LibAppStorage.Track track)
        external
        view
        onlyAdmin
        returns (uint256[] memory attendanceDates)
    {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        LibAppStorage.Cohort storage cohort = layout.cohorts[cohortId];
        require(cohort.cohortId != 0, Error.COHORT_DOES_NOT_EXIST());

        uint256 cohortStartDay = cohort.startDate / 1 days;
        uint256 cohortEndDay = cohort.endDate / 1 days;

        uint256[] memory tempDates = new uint256[](cohortEndDay - cohortStartDay + 1);
        uint256 count = 0;
        for (uint256 day = cohortStartDay; day <= cohortEndDay; day++) {
            if (layout.attendance[cohortId][track][day][student]) {
                tempDates[count] = day;
                count++;
            }
        }
        attendanceDates = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            attendanceDates[i] = tempDates[i];
        }
    }

    function superAdmin() public view returns (address) {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        return layout.superAdmin;
    }

    function replaceAdmin(address oldAdmin, address newAdmin) external onlySuperAdmin returns (bool) {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        require(oldAdmin != address(0) && newAdmin != address(0), Error.INVALID_ADDRESS());
        require(layout.admins[oldAdmin], "Old admin does not exist");
        require(!layout.admins[newAdmin], "New admin already exists");

        // Update mapping
        layout.admins[oldAdmin] = false;
        layout.admins[newAdmin] = true;

        // Replace in adminList array
        for (uint256 i = 0; i < layout.adminList.length; i++) {
            if (layout.adminList[i] == oldAdmin) {
                layout.adminList[i] = newAdmin;
                break;
            }
        }

        emit Event.AdminReplaced(oldAdmin, newAdmin);
        return true;
    }
}
