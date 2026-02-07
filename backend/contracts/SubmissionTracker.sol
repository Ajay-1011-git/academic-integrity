// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SubmissionTracker {
    struct Submission {
        string assignmentId;
        string studentId;
        string contentHash;
        uint256 timestamp;
        uint256 version;
        bool isFinal;
        address submittedBy;
    }
    
    mapping(string => Submission[]) public submissions;
    mapping(string => uint256) public versionCount;
    
    event SubmissionRecorded(
        string indexed assignmentId,
        string indexed studentId,
        string contentHash,
        uint256 version,
        bool isFinal,
        uint256 timestamp,
        address submittedBy
    );
    
    function recordSubmission(
        string memory assignmentId,
        string memory studentId,
        string memory contentHash,
        bool isFinal
    ) public returns (uint256) {
        string memory key = string(abi.encodePacked(assignmentId, "-", studentId));
        uint256 version = versionCount[key] + 1;
        versionCount[key] = version;
        
        Submission memory newSubmission = Submission({
            assignmentId: assignmentId,
            studentId: studentId,
            contentHash: contentHash,
            timestamp: block.timestamp,
            version: version,
            isFinal: isFinal,
            submittedBy: msg.sender
        });
        
        submissions[key].push(newSubmission);
        
        emit SubmissionRecorded(
            assignmentId,
            studentId,
            contentHash,
            version,
            isFinal,
            block.timestamp,
            msg.sender
        );
        
        return version;
    }
    
    function getSubmissionHistory(
        string memory assignmentId,
        string memory studentId
    ) public view returns (Submission[] memory) {
        string memory key = string(abi.encodePacked(assignmentId, "-", studentId));
        return submissions[key];
    }
    
    function getSubmissionCount(
        string memory assignmentId,
        string memory studentId
    ) public view returns (uint256) {
        string memory key = string(abi.encodePacked(assignmentId, "-", studentId));
        return submissions[key].length;
    }
    
    function verifySubmission(
        string memory assignmentId,
        string memory studentId,
        string memory contentHash,
        uint256 version
    ) public view returns (bool) {
        string memory key = string(abi.encodePacked(assignmentId, "-", studentId));
        Submission[] memory history = submissions[key];
        
        if (version == 0 || version > history.length) return false;
        
        return keccak256(bytes(history[version - 1].contentHash)) == keccak256(bytes(contentHash));
    }
}