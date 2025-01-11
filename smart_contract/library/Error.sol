// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

library Error {
    // add custom errors here
    error END_DATE_MUST_BE_GREATER_THAN_START();
    error INVALID_COHORT_ID();
    error COHORT_DOES_NOT_EXIST();
    error UNAUTHORIZED_ACCESS();
    error STUDENT_DOES_NOT_EXIST();
    error INVALID_TRACK();
    error TRACK_DOES_NOT_EXIST_IN_COHORT();
}