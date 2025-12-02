# CampusShield Smart Contracts

USDC-powered emergency fund smart contracts for university students on Base.

## Overview

The CampusShield contract enables:
- Universities to register emergency funds
- Donors to contribute USDC to university pools
- Students to request emergency aid
- Admins to approve/reject and disburse funds

## Contract Details

### CampusShield.sol

A non-custodial emergency fund contract that uses Circle's USDC for all transactions.

**Key Features:**
- Uses OpenZeppelin's SafeERC20 for secure token transfers
- ReentrancyGuard protection
- Full USDC (6 decimal) support
- Event logging for all actions

### Network Addresses

| Network | USDC Address |
|---------|--------------|
| Base Sepolia | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| Base Mainnet | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` |

## Development

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Compile

```bash
npm run compile
```

### Test

```bash
npm test
```

### Deploy

1. Create `.env` file:
```env
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
BASESCAN_API_KEY=optional
```

2. Deploy to Base Sepolia:
```bash
npm run deploy:sepolia
```

3. Deploy to Base Mainnet:
```bash
npm run deploy:mainnet
```

### Verify Contract

```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS> <USDC_ADDRESS>
```

## Contract Interface

### Write Functions

```solidity
// Register a new university fund
function registerUniversity(string memory _name) external

// Donate USDC to a university fund (requires prior approval)
function donate(uint256 _universityId, uint256 _amount) external

// Request emergency aid
function requestAid(uint256 _universityId, uint256 _amount, string memory _reason) external

// Approve and disburse aid (admin only)
function approveAid(uint256 _requestId) external

// Reject aid request (admin only)
function rejectAid(uint256 _requestId) external
```

### Read Functions

```solidity
// Get platform statistics
function getStats() external view returns (uint256 universityCount, uint256 requestCount, uint256 totalDonated, uint256 totalDisbursed)

// Get university details
function getUniversity(uint256 _universityId) external view returns (string name, address admin, uint256 balance, bool isActive, uint256 donorCount, uint256 requestsCount)

// Get pending requests for a university
function getPendingRequests(uint256 _universityId) external view returns (AidRequest[] memory)

// Get student's request history
function getStudentRequests(address _student) external view returns (AidRequest[] memory)
```

## Events

```solidity
event UniversityRegistered(uint256 indexed id, string name, address admin)
event DonationReceived(uint256 indexed universityId, address indexed donor, uint256 amount)
event AidRequested(uint256 indexed requestId, uint256 indexed universityId, address indexed student, uint256 amount, string reason)
event AidApproved(uint256 indexed requestId, address indexed student, uint256 amount)
event AidRejected(uint256 indexed requestId, address indexed student)
```

## Security

- **ReentrancyGuard**: Protects against reentrancy attacks on donate and approveAid
- **SafeERC20**: Safe token transfer handling
- **Access Control**: Only university admins can approve/reject requests
- **Input Validation**: All inputs are validated before processing

## License

MIT
