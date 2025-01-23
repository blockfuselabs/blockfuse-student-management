// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import "../libraries/Error.sol";
import "../libraries/Event.sol";
import "../libraries/LibAppStorage.sol";

contract StudentFacet {
    LibAppStorage.Layout layout;

    modifier studentExist(address _studentWalletAddress){
        require(_studentWalletAddress != address(0) && layout.student[_studentWalletAddress].isActive == true, Error.STUDENT_DOES_NOT_EXIST());
        _;
    }

    // Modifier to ensure student is active
    modifier onlyActiveStudent(address _studentAddress) {
        require(layout.student[_studentAddress].isActive, Error.STUDENT_IS_NOT_ACTIVE());
        _;
    }

    // Modifier to ensure only owner of address or any of the admins to log time for students
    modifier onlyOwnerOrAdmin(address _studentAddress) {
        require(layout.admins[msg.sender] || msg.sender == layout.superAdmin || msg.sender == _studentAddress, Error.UNAUTHORIZED_ACCESS());
        _;
    }

    function logAttendance(
        address _studentAddress,
        uint8 _cohortId,
        LibAppStorage.Track _track
    ) external onlyActiveStudent(_studentAddress) onlyOwnerOrAdmin(_studentAddress) {
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

        function getStudentAssesments(
        address _studentWalletAddress
        ) external studentExist(_studentWalletAddress) view returns(int[] memory)
    {
        return layout.studentScore[_studentWalletAddress];
    }

    function getStudentFinalScore(
        address _studentWalletAddress
        ) external studentExist(_studentWalletAddress) view returns(int)
    {
        return layout.student[_studentWalletAddress].finalScore;
    }

    function getStudentScoreByIndex(
        address _studentWalletAddress,
        uint index
        ) external studentExist(_studentWalletAddress) view returns(int)
    {
        require(layout.studentScore[_studentWalletAddress].length > 0, "Student not yet Scored");
        require(index < layout.studentScore[_studentWalletAddress].length , "Index out of range");

        return layout.studentScore[_studentWalletAddress][index];
    } 

    function getAttendanceByCohortAndTrack(
        uint8 _cohortId, 
        LibAppStorage.Track _track
    ) 
        external 
        view 
        returns (address[] memory, uint256[] memory) 
    {
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

    function hasAttendance(
        address _studentAddress,
        uint8 _cohortId,
        LibAppStorage.Track _track,
        uint256 _day
    ) external view returns (bool) {
        return layout.attendance[_cohortId][_track][_day][_studentAddress];
    }

    function getStudent(address _studentAddress) external view returns(LibAppStorage.studentDetails memory studentData) {
        studentData = layout.student[_studentAddress];
    } 
}