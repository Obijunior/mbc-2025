// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract CampusShield {
    struct University {
        string name;
        address admin;
        uint256 balance;
        bool isActive;
    }

    struct AidRequest {
        uint256 id;
        uint256 universityId;
        address student;
        uint256 amount;
        string reason;
        bool isProcessed;
        bool isApproved;
    }

    uint256 public universityCount;
    uint256 public requestCount;

    mapping(uint256 => University) public universities;
    mapping(uint256 => AidRequest) public requests;
    mapping(address => uint256[]) public studentRequests;
    mapping(uint256 => uint256[]) public universityRequests;

    event UniversityRegistered(uint256 indexed id, string name, address admin);
    event DonationReceived(uint256 indexed universityId, address donor, uint256 amount);
    event AidRequested(uint256 indexed requestId, uint256 indexed universityId, address student, uint256 amount);
    event AidDistributed(uint256 indexed requestId, address student, uint256 amount);

    modifier onlyUniversityAdmin(uint256 _universityId) {
        require(universities[_universityId].admin == msg.sender, "Not university admin");
        _;
    }

    function registerUniversity(string memory _name) external {
        universityCount++;
        universities[universityCount] = University({
            name: _name,
            admin: msg.sender,
            balance: 0,
            isActive: true
        });
        emit UniversityRegistered(universityCount, _name, msg.sender);
    }

    function donate(uint256 _universityId) external payable {
        require(universities[_universityId].isActive, "University not active");
        require(msg.value > 0, "Donation must be greater than 0");

        universities[_universityId].balance += msg.value;
        emit DonationReceived(_universityId, msg.sender, msg.value);
    }

    function requestAid(uint256 _universityId, uint256 _amount, string memory _reason) external {
        require(universities[_universityId].isActive, "University not active");
        
        requestCount++;
        requests[requestCount] = AidRequest({
            id: requestCount,
            universityId: _universityId,
            student: msg.sender,
            amount: _amount,
            reason: _reason,
            isProcessed: false,
            isApproved: false
        });

        studentRequests[msg.sender].push(requestCount);
        universityRequests[_universityId].push(requestCount);
        
        emit AidRequested(requestCount, _universityId, msg.sender, _amount);
    }

    function approveAid(uint256 _requestId) external {
        AidRequest storage req = requests[_requestId];
        require(!req.isProcessed, "Request already processed");
        
        // Check admin permissions
        require(universities[req.universityId].admin == msg.sender, "Not authorized");
        require(universities[req.universityId].balance >= req.amount, "Insufficient funds");

        req.isProcessed = true;
        req.isApproved = true;
        universities[req.universityId].balance -= req.amount;

        (bool sent, ) = req.student.call{value: req.amount}("");
        require(sent, "Failed to send Ether");

        emit AidDistributed(_requestId, req.student, req.amount);
    }

    function rejectAid(uint256 _requestId) external {
        AidRequest storage req = requests[_requestId];
        require(!req.isProcessed, "Request already processed");
        require(universities[req.universityId].admin == msg.sender, "Not authorized");

        req.isProcessed = true;
        req.isApproved = false;
    }

    function getUniversityRequests(uint256 _universityId) external view returns (AidRequest[] memory) {
        uint256[] memory requestIds = universityRequests[_universityId];
        AidRequest[] memory _requests = new AidRequest[](requestIds.length);
        
        for(uint i = 0; i < requestIds.length; i++) {
            _requests[i] = requests[requestIds[i]];
        }
        return _requests;
    }
}
