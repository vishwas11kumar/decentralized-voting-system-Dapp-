// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22;

contract Election {
    uint public candidateApplied;

    struct Candidate {
        uint id;
        string name;
        uint votes;
    }

    mapping(address => bool) public voters;
    mapping(uint => Candidate) public candidateDetails;

    event CandidateAdded(
        uint id,
        string name
    );
    
    event VoteConducted(
        uint indexed candidateId
    );

    function addCandidate(string memory _name, uint _vote) public {
        candidateApplied++;
        candidateDetails[candidateApplied] = Candidate(candidateApplied, _name, 0);
        emit CandidateAdded(candidateApplied, _name);
    }

    constructor () public {
        //addCandidate("testing", 123);
    }
    
    function vote(uint _candidateId) public {
        require(!voters[msg.sender], "You have already voted.");
        require(_candidateId > 0 && _candidateId <= candidateApplied, "Invalid candidate ID.");

        voters[msg.sender] = true;
        candidateDetails[_candidateId].votes++;

        emit VoteConducted(_candidateId);
    }
}
