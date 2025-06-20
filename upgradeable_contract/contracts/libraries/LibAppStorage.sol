// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

library LibAppStorage {
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

    struct Layout {
        uint8 cohortCount; // Counter for cohort IDs (initialized as 1, so that it will start from cohort 2)
        mapping(uint8 => Cohort) cohorts; // Mapping of cohort ID to Cohort details
        mapping(address => string) usernames;
        mapping(address => studentDetails) student;
        mapping(address => int[] ) studentScore;
        mapping(address => bool) admins;
        // Mapping: Cohort ID -> Track -> Day -> Student Address -> Attendance
        mapping(uint8 => mapping(Track => mapping(uint256 => mapping(address => bool)))) attendance;
        mapping(uint8 => mapping(Track =>AttendanceRecord[])) attendanceRecords;
        mapping(address => AttendanceRecord[]) individualAttendanceRecord;
        address superAdmin;
    }

    function layout() pure internal returns (Layout storage l) {
        assembly {
            l.slot := 0
        }
    }

    function initialiazeCohortCounter() internal returns (uint8) {
        Layout storage l = layout();

        if (l.cohortCount < 2) {
            l.cohortCount = 1;
        }

        return l.cohortCount;
    }

    function trackToString(Track _track) internal pure returns (string memory) {
        if (_track == Track.web2) {
            return "web2";
        } else {
            return "web3";
        }
    }
}