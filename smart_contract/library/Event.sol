// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

library Event {
    event CohortCreated(uint256 indexed cohortId, string track);
    event StudentAdded(uint256 indexed cohortId, address student);
    event InstructorAdded(uint256 indexed cohortId, address instructor);
}