// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

library Event {
    event CohortCreated(uint256 indexed cohortId);
    event CohortTrackAdded(uint256 indexed cohortId, string indexed track);
    event StudentAdded(uint256 indexed cohortId, address student);
    event StudentAddedToTrack(uint256 indexed cohortId, string indexed track, address indexed student);
    event InstructorAdded(uint256 indexed cohortId, address instructor);
    event AssessmentRecorded(
        address studentAddress, int256 studentScoreAdded, int256 totalScore, uint256 time, address instructorAddress
    );
    event AdminAdded(address adminAdded);
    event AdminRemoved(address adminRemove);
    event StudentAddedToCohort(address indexed studentAddress, uint8 indexed cohort);
    event AttendanceLogged(uint256 indexed cohortId, address indexed student, string indexed track, uint256 date);
    event StudentWalletReplaced(address indexed oldAddress, address indexed newAddress);
    event AdminReplaced(address indexed oldAdmin, address indexed newAdmin);
}
