// SPDX-License-Identifier: MIT
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
// Map student address to their details

    mapping(address => studentDetails) student;

    // Attendance structure for storing attendance records
    struct AttendanceRecord {
        uint256 date; 
        bool present; 
     }

    
    mapping(uint256 => mapping(address => AttendanceRecord[])) private attendanceRecords; 

    // Events
    event AttendanceRegistered(uint256 cohortId, address indexed student, uint256 date, bool present);

    // Modifier to ensure student is active
    modifier onlyActiveStudent(address _student) {
        require(student[_student].isActive, "Student is not active.");
        _;
    }

    // Register attendance for a specific student
    function registerAttendance(
        address _student,
        uint256 _date,
        bool _present
    ) external {
        studentDetails storage student = student[_student];
        uint256 cohortId = student.cohort;

        AttendanceRecord memory record = AttendanceRecord({
            date: _date,
            present: _present
        });

        attendanceRecords[cohortId][_student].push(record);

         emit AttendanceRegistered(cohortId, _student, _date, _present);

    }

    // Get attendance records for a specific student
    function getStudentAttendance(address _student) external view returns (AttendanceRecord[] memory) {
        studentDetails storage student = student[_student];
        uint256 cohortId = student.cohort;

        return attendanceRecords[cohortId][_student];
    }
}
