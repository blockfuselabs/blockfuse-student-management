// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.28;

import "../libraries/Error.sol";
import "../libraries/Event.sol";
import "../libraries/LibAppStorage.sol";

contract CohortFacet {
    LibAppStorage.Layout layout;

    modifier validDates(uint256 startDate, uint256 endDate) {
        require(startDate < endDate, Error.END_DATE_MUST_BE_GREATER_THAN_START());
        _;
    }

    modifier onlySuperAdmin{
         require(msg.sender == layout.superAdmin, Error.UNAUTHORIZED_ACCESS());
         _;
    }

    function createCohort(
        uint256 _startDate, 
        uint256 _endDate
    ) public 
        validDates(_startDate, _endDate)
        onlySuperAdmin
    {
        LibAppStorage.initialiazeCohortCounter();
        layout.cohortCount++;

        LibAppStorage.Cohort storage newCohort = layout.cohorts[layout.cohortCount];
        newCohort.cohortId = layout.cohortCount;
        newCohort.startDate = _startDate;
        newCohort.endDate = _endDate;
        newCohort.duration = _endDate - _startDate;

        emit Event.CohortCreated(layout.cohortCount);
    }

    function addTrackToCohort(uint8 _cohortId, LibAppStorage.Track _track) public onlySuperAdmin {
        require(layout.cohorts[_cohortId].cohortId != 0, Error.COHORT_DOES_NOT_EXIST());
        
        layout.cohorts[_cohortId].cohortTracks.push(_track);

        emit Event.CohortTrackAdded(_cohortId, LibAppStorage.trackToString(_track));
    }

    function getCohort(uint8 _cohortId) 
    public 
    view 
    returns (
        uint256 id,
        string[] memory tracks,
        uint256 totalStudents,
        uint256 startDate,
        uint256 endDate,
        uint256 duration,
        address[][] memory studentsByTrack
    ) 
    {
        require(_cohortId > 0 && _cohortId <= layout.cohortCount, Error.COHORT_DOES_NOT_EXIST());

        LibAppStorage.Cohort storage cohort = layout.cohorts[_cohortId];

        // Convert the array of `Track` enums to an array of strings
        string[] memory trackNames = new string[](cohort.cohortTracks.length);
        address[][] memory allStudents = new address[][](cohort.cohortTracks.length);

        for (uint256 i = 0; i < cohort.cohortTracks.length; i++) {
            LibAppStorage.Track track = cohort.cohortTracks[i];
            trackNames[i] = LibAppStorage.trackToString(track);
            allStudents[i] = cohort.studentsByTrack[track];
        }

        return (
            cohort.cohortId,
            trackNames,
            cohort.totalStudents,
            cohort.startDate,
            cohort.endDate,
            cohort.duration,
            allStudents
        );
    }


    function getCohortTracks(uint8 _cohortId) public view returns (LibAppStorage.Track[] memory) {
        return layout.cohorts[_cohortId].cohortTracks;
    }
}