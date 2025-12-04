// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CampusShield
 * @notice Emergency fund platform for university students using USDC on Base
 * @dev Integrates with Circle's USDC for transparent, fast emergency aid distribution
 */
contract CampusShield is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // USDC token contract
    IERC20 public immutable usdc;

    struct University {
        string name;
        address admin;
        uint256 balance; // USDC balance (6 decimals)
        bool isActive;
    }

    struct AidRequest {
        uint256 id;
        uint256 universityId;
        address student;
        uint256 amount; // USDC amount (6 decimals)
        string reason;
        bool isProcessed;
        bool isApproved;
        uint256 timestamp;
    }

    uint256 public universityCount;
    uint256 public requestCount;
    uint256 public totalDonated;
    uint256 public totalDisbursed;

    mapping(uint256 => University) public universities;
    mapping(uint256 => AidRequest) public requests;
    mapping(address => uint256[]) public studentRequests;
    mapping(uint256 => uint256[]) public universityRequests;
    mapping(uint256 => address[]) public universityDonors;
    mapping(uint256 => mapping(address => uint256)) public donorContributions;

    // Events
    event UniversityRegistered(uint256 indexed id, string name, address admin);
    event DonationReceived(uint256 indexed universityId, address indexed donor, uint256 amount);
    event AidRequested(uint256 indexed requestId, uint256 indexed universityId, address indexed student, uint256 amount, string reason);
    event AidApproved(uint256 indexed requestId, address indexed student, uint256 amount);
    event AidRejected(uint256 indexed requestId, address indexed student);

    modifier onlyUniversityAdmin(uint256 _universityId) {
        require(universities[_universityId].admin == msg.sender, "Not university admin");
        _;
    }

    modifier universityExists(uint256 _universityId) {
        require(_universityId > 0 && _universityId <= universityCount, "University does not exist");
        require(universities[_universityId].isActive, "University not active");
        _;
    }

    /**
     * @notice Initialize contract with USDC token address
     * @param _usdcAddress Address of USDC token on Base
     */
    constructor(address _usdcAddress) {
        require(_usdcAddress != address(0), "Invalid USDC address");
        usdc = IERC20(_usdcAddress);
    }

    /**
     * @notice Register a new university emergency fund
     * @param _name Name of the university
     */
    function registerUniversity(string memory _name) external {
        require(bytes(_name).length > 0, "Name cannot be empty");
        
        universityCount++;
        universities[universityCount] = University({
            name: _name,
            admin: msg.sender,
            balance: 0,
            isActive: true
        });
        
        emit UniversityRegistered(universityCount, _name, msg.sender);
    }

    /**
     * @notice Donate USDC to a university emergency fund
     * @dev Requires prior USDC approval
     * @param _universityId ID of the university to donate to
     * @param _amount Amount of USDC to donate (6 decimals)
     */
    function donate(uint256 _universityId, uint256 _amount) 
        external 
        nonReentrant 
        universityExists(_universityId) 
    {
        require(_amount > 0, "Amount must be greater than 0");

        // Transfer USDC from donor to contract
        usdc.safeTransferFrom(msg.sender, address(this), _amount);

        // Update university balance
        universities[_universityId].balance += _amount;
        totalDonated += _amount;

        // Track donor
        if (donorContributions[_universityId][msg.sender] == 0) {
            universityDonors[_universityId].push(msg.sender);
        }
        donorContributions[_universityId][msg.sender] += _amount;

        emit DonationReceived(_universityId, msg.sender, _amount);
    }

    /**
     * @notice Request emergency aid from a university fund
     * @param _universityId ID of the university
     * @param _amount Amount of USDC requested (6 decimals)
     * @param _reason Reason for the emergency aid request
     */
    function requestAid(uint256 _universityId, uint256 _amount, string memory _reason) 
        external 
        universityExists(_universityId) 
    {
        require(_amount > 0, "Amount must be greater than 0");
        require(bytes(_reason).length > 0, "Reason cannot be empty");
        
        requestCount++;
        requests[requestCount] = AidRequest({
            id: requestCount,
            universityId: _universityId,
            student: msg.sender,
            amount: _amount,
            reason: _reason,
            isProcessed: false,
            isApproved: false,
            timestamp: block.timestamp
        });

        studentRequests[msg.sender].push(requestCount);
        universityRequests[_universityId].push(requestCount);
        
        emit AidRequested(requestCount, _universityId, msg.sender, _amount, _reason);
    }

    /**
     * @notice Approve and disburse aid to a student
     * @param _requestId ID of the aid request
     */
    function approveAid(uint256 _requestId) external nonReentrant {
        AidRequest storage req = requests[_requestId];
        require(req.id != 0, "Request does not exist");
        require(!req.isProcessed, "Request already processed");
        require(universities[req.universityId].admin == msg.sender, "Not authorized");
        require(universities[req.universityId].balance >= req.amount, "Insufficient funds");

        req.isProcessed = true;
        req.isApproved = true;
        universities[req.universityId].balance -= req.amount;
        totalDisbursed += req.amount;

        // Transfer USDC to student
        usdc.safeTransfer(req.student, req.amount);

        emit AidApproved(_requestId, req.student, req.amount);
    }

    /**
     * @notice Reject an aid request
     * @param _requestId ID of the aid request
     */
    function rejectAid(uint256 _requestId) external {
        AidRequest storage req = requests[_requestId];
        require(req.id != 0, "Request does not exist");
        require(!req.isProcessed, "Request already processed");
        require(universities[req.universityId].admin == msg.sender, "Not authorized");

        req.isProcessed = true;
        req.isApproved = false;

        emit AidRejected(_requestId, req.student);
    }

    // ============ View Functions ============

    /**
     * @notice Get all requests for a university
     */
    function getUniversityRequests(uint256 _universityId) external view returns (AidRequest[] memory) {
        uint256[] memory requestIds = universityRequests[_universityId];
        AidRequest[] memory _requests = new AidRequest[](requestIds.length);
        
        for(uint i = 0; i < requestIds.length; i++) {
            _requests[i] = requests[requestIds[i]];
        }
        return _requests;
    }

    /**
     * @notice Get all requests for a student
     */
    function getStudentRequests(address _student) external view returns (AidRequest[] memory) {
        uint256[] memory requestIds = studentRequests[_student];
        AidRequest[] memory _requests = new AidRequest[](requestIds.length);
        
        for(uint i = 0; i < requestIds.length; i++) {
            _requests[i] = requests[requestIds[i]];
        }
        return _requests;
    }

    /**
     * @notice Get pending requests for a university
     */
    function getPendingRequests(uint256 _universityId) external view returns (AidRequest[] memory) {
        uint256[] memory requestIds = universityRequests[_universityId];
        
        // First, count pending requests
        uint256 pendingCount = 0;
        for(uint i = 0; i < requestIds.length; i++) {
            if (!requests[requestIds[i]].isProcessed) {
                pendingCount++;
            }
        }
        
        // Then, populate array
        AidRequest[] memory pending = new AidRequest[](pendingCount);
        uint256 idx = 0;
        for(uint i = 0; i < requestIds.length; i++) {
            if (!requests[requestIds[i]].isProcessed) {
                pending[idx] = requests[requestIds[i]];
                idx++;
            }
        }
        return pending;
    }

    /**
     * @notice Get donor count for a university
     */
    function getDonorCount(uint256 _universityId) external view returns (uint256) {
        return universityDonors[_universityId].length;
    }

    /**
     * @notice Get university details
     */
    function getUniversity(uint256 _universityId) external view returns (
        string memory name,
        address admin,
        uint256 balance,
        bool isActive,
        uint256 donorCount,
        uint256 requestsCount
    ) {
        University storage uni = universities[_universityId];
        return (
            uni.name,
            uni.admin,
            uni.balance,
            uni.isActive,
            universityDonors[_universityId].length,
            universityRequests[_universityId].length
        );
    }

    /**
     * @notice Get platform statistics
     */
    function getStats() external view returns (
        uint256 _universityCount,
        uint256 _requestCount,
        uint256 _totalDonated,
        uint256 _totalDisbursed
    ) {
        return (universityCount, requestCount, totalDonated, totalDisbursed);
    }
}
