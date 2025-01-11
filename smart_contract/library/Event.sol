// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

library Event {
    event CohortCreated(uint256 indexed cohortId);
    event CohortTrackAdded(uint256 indexed cohortId, string indexed track);
    event StudentAdded(uint256 indexed cohortId, address student);
    event StudentAddedToTrack(uint256 indexed cohortId, string indexed track, address indexed student);
    event InstructorAdded(uint256 indexed cohortId, address instructor);
    event AssessmentRecorded(address studentAddress, int studentScoreAdded, int totalScore, uint time, address instructorAddress);
    event AdminAdded(address adminAdded);
    event AdminRemoved(address adminRemove);
    event StudentAddedToCohort(address indexed studentAddress, string indexed username, uint8 indexed cohort);
}