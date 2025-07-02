// Force redeploy for selector update
// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import "../libraries/Error.sol";
import "../libraries/Event.sol";
import "../libraries/LibAppStorage.sol";

contract StudentFacet {
    modifier studentExist(address _studentWalletAddress) {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        require(layout.student[_studentWalletAddress].isActive, Error.STUDENT_DOES_NOT_EXIST());
        _;
    }

    // Modifier to ensure student is active
    modifier onlyActiveStudent(address _studentAddress) {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        require(layout.student[_studentAddress].isActive, Error.STUDENT_IS_NOT_ACTIVE());
        _;
    }

    // Modifier to ensure only owner of address or any of the admins to log time for students
    modifier onlyOwnerOrAdmin(address _studentAddress) {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        require(
            layout.admins[msg.sender] || msg.sender == layout.superAdmin || msg.sender == _studentAddress,
            Error.UNAUTHORIZED_ACCESS()
        );
        _;
    }

    function logAttendance(address _studentAddress, uint8 _cohortId, LibAppStorage.Track _track)
        external
        onlyActiveStudent(_studentAddress)
        onlyOwnerOrAdmin(_studentAddress)
    {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        require(layout.student[_studentAddress].cohort == _cohortId, Error.INVALID_COHORT_ID());
        require(layout.student[_studentAddress].track == _track, Error.INVALID_TRACK());

        // Get the current day in UTC
        uint256 currentDay = block.timestamp / 1 days;

        // Check if attendance for this cohort, track, and day already exists
        require(!layout.attendance[_cohortId][_track][currentDay][_studentAddress], Error.ALREADY_MARKED_ATTENDANCE());

        // Mark attendance
        layout.attendance[_cohortId][_track][currentDay][_studentAddress] = true;

        LibAppStorage.AttendanceRecord memory record;
        record.date = currentDay;
        record.studentAddress = _studentAddress;

        layout.attendanceRecords[_cohortId][_track].push(record);

        layout.individualAttendanceRecord[_studentAddress].push(record);

        emit Event.AttendanceLogged(_cohortId, _studentAddress, LibAppStorage.trackToString(_track), currentDay);
    }

    function getStudentAssesments(address _studentWalletAddress)
        external
        view
        studentExist(_studentWalletAddress)
        returns (int256[] memory)
    {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        return layout.studentScore[_studentWalletAddress];
    }

    function getStudentFinalScore(address _studentWalletAddress)
        external
        view
        studentExist(_studentWalletAddress)
        returns (int256)
    {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        return layout.student[_studentWalletAddress].finalScore;
    }

    function getStudentScoreByIndex(address _studentWalletAddress, uint256 index)
        external
        view
        studentExist(_studentWalletAddress)
        returns (int256)
    {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        require(layout.studentScore[_studentWalletAddress].length > 0, "Student not yet Scored");
        require(index < layout.studentScore[_studentWalletAddress].length, "Index out of range");
        return layout.studentScore[_studentWalletAddress][index];
    }

    function getAttendanceByCohortAndTrack(uint8 _cohortId, LibAppStorage.Track _track)
        external
        view
        returns (address[] memory, uint256[] memory)
    {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        LibAppStorage.Cohort storage cohort = layout.cohorts[_cohortId];
        require(cohort.cohortId != 0, Error.COHORT_DOES_NOT_EXIST());
        uint256 cohortStartDay = cohort.startDate / 1 days;
        uint256 cohortEndDay = cohort.endDate / 1 days;
        address[] memory students = cohort.studentsByTrack[_track];
        uint256[] memory attendanceCounts = new uint256[](students.length);
        for (uint256 i = 0; i < students.length; i++) {
            address studentAddress = students[i];
            uint256 count = 0;
            for (uint256 day = cohortStartDay; day <= cohortEndDay; day++) {
                if (layout.attendance[_cohortId][_track][day][studentAddress]) {
                    count++;
                }
            }
            attendanceCounts[i] = count;
        }
        return (students, attendanceCounts);
    }

    function hasAttendance(address _studentAddress, uint8 _cohortId, LibAppStorage.Track _track, uint256 _day)
        external
        view
        returns (bool)
    {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        return layout.attendance[_cohortId][_track][_day][_studentAddress];
    }

    function getStudent(address _studentAddress)
        external
        view
        returns (LibAppStorage.studentDetails memory studentData)
    {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        studentData = layout.student[_studentAddress];
    }

    function getStudentsByCohortAndTrack(uint8 _cohortId, LibAppStorage.Track _track)
        public
        view
        returns (LibAppStorage.studentDetails[] memory)
    {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        LibAppStorage.Cohort storage cohort = layout.cohorts[_cohortId];
        address[] memory studentAddresses = cohort.studentsByTrack[_track];
        LibAppStorage.studentDetails[] memory studentDetailsList =
            new LibAppStorage.studentDetails[](studentAddresses.length);
        for (uint256 i = 0; i < studentAddresses.length; i++) {
            studentDetailsList[i] = layout.student[studentAddresses[i]];
        }
        return studentDetailsList;
    }

    function getStudentsByCohortTrackAndDay(uint8 _cohortId, LibAppStorage.Track _track, uint256 _day)
        public
        view
        returns (LibAppStorage.studentDetails[] memory, bool[] memory)
    {
        LibAppStorage.Layout storage appLayout = LibAppStorage.layout();
        LibAppStorage.Cohort storage cohort = appLayout.cohorts[_cohortId];
        address[] memory studentAddresses = cohort.studentsByTrack[_track];
        LibAppStorage.studentDetails[] memory studentDetailsList =
            new LibAppStorage.studentDetails[](studentAddresses.length);
        bool[] memory attendanceList = new bool[](studentAddresses.length);
        for (uint256 i = 0; i < studentAddresses.length; i++) {
            address studentAddr = studentAddresses[i];
            studentDetailsList[i] = appLayout.student[studentAddr];
            attendanceList[i] = appLayout.attendance[_cohortId][_track][_day][studentAddr];
        }
        return (studentDetailsList, attendanceList);
    }

    function getIndividualAttendanceRecord(address student)
        external
        view
        returns (LibAppStorage.AttendanceRecord[] memory)
    {
        LibAppStorage.Layout storage layout = LibAppStorage.layout();
        return layout.individualAttendanceRecord[student];
    }
}
