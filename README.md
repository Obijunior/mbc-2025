# CampusShield 🛡️

> **Onchain emergency fund for university students, powered by USDC on Base**

CampusShield transforms university emergency aid into a transparent, instant, blockchain-powered safety net for students in crisis. Built for the Base Track and Circle Bounty at the hackathon.

![Base](https://img.shields.io/badge/Built%20on-Base-0052FF?style=flat-square&logo=coinbase)
![USDC](https://img.shields.io/badge/Powered%20by-USDC-2775CA?style=flat-square)
![Farcaster](https://img.shields.io/badge/MiniApp-Farcaster-8A63D2?style=flat-square)

## Hackathon Tracks

### Base Track 
- **Network**: Deployed on Base Sepolia (Testnet)
- **Smart Contract**: Full EVM-compatible Solidity contract
- **MiniKit Integration**: Farcaster MiniApp SDK for social distribution
- **Wallet Connect**: Reown AppKit for seamless wallet connections

### Circle Bounty 
- **USDC Integration**: All donations and disbursements in USDC
- **On-chain Payments**: Direct wallet-to-wallet USDC transfers
- **Transparent Treasury**: Real-time fund tracking on Base

##  Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CampusShield                              │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js + React)                                      │
│  ├── Wallet Connection (Reown AppKit)                           │
│  ├── Farcaster MiniApp SDK                                      │
│  └── Contract Interactions (wagmi + viem)                       │
├─────────────────────────────────────────────────────────────────┤
│  Smart Contract (Solidity)                                       │
│  ├── University Registration                                    │
│  ├── USDC Donations (ERC20 transferFrom)                        │
│  ├── Aid Requests                                               │
│  └── Aid Approval/Disbursement (ERC20 transfer)                 │
├─────────────────────────────────────────────────────────────────┤
│  Base Sepolia (Ethereum L2)                                      │
│  └── USDC: 0x036CbD53842c5426634e7929541eC2318f3dCF7e           │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A wallet with Base Sepolia ETH for gas
- USDC on Base Sepolia (get from [Circle Faucet](https://faucet.circle.com/))

### 1. Clone and Install

```bash
git clone <repo-url>
cd mbc-2025

# Install contract dependencies
cd contracts
npm install

# Install web dependencies
cd ../web
npm install
```

### 2. Configure Environment

**Contracts (`contracts/.env`):**
```env
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_without_0x
```

**Web (`web/.env.local`):**
```env
NEXT_PUBLIC_PROJECT_ID=your_reown_project_id
```

### 3. Deploy Contract

```bash
cd contracts
npm run deploy:sepolia
```

After deployment, update the contract address in `web/src/lib/contracts.ts`:
```typescript
export const CAMPUS_SHIELD_ADDRESSES = {
  baseSepolia: '0xYOUR_DEPLOYED_ADDRESS' as Address,
  // ...
};
```

### 4. Run Frontend

```bash
cd web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📋 Features

### For Universities (Admins)
-  Register university emergency fund
-  View pending aid requests
-  Approve or reject requests
-  Track fund balance and donor count

### For Donors
-  Browse university funds
-  Donate USDC directly to funds
-  One-click approve + donate flow
-  View fund health and impact

### For Students
-  Request emergency aid (up to $250)
-  Provide reason for request
-  Track request status
-  Receive USDC directly to wallet

##  Smart Contract

### Key Functions

| Function | Description |
|----------|-------------|
| `registerUniversity(name)` | Create a new university fund |
| `donate(universityId, amount)` | Donate USDC to a fund |
| `requestAid(universityId, amount, reason)` | Request emergency aid |
| `approveAid(requestId)` | Approve and disburse aid |
| `rejectAid(requestId)` | Reject an aid request |

### Contract Addresses

| Network | USDC | CampusShield |
|---------|------|--------------|
| Base Sepolia | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | *Deploy yours* |
| Base Mainnet | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | *Coming soon* |

##  Testing

```bash
cd contracts
npm test
```

##  Project Structure

```
mbc-2025/
├── contracts/                 # Hardhat + Solidity
│   ├── contracts/
│   │   └── CampusShield.sol  # Main contract (USDC-powered)
│   ├── ignition/modules/     # Deployment scripts
│   └── hardhat.config.js     # Network config
│
└── web/                       # Next.js frontend
    ├── src/
    │   ├── app/              # Pages (Home, Donor, Student, Admin)
    │   ├── components/       # Navbar, MiniAppInit
    │   ├── hooks/            # Contract interaction hooks
    │   └── lib/              # Contract ABIs, utilities
    └── public/               # Static assets
```

##  Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Wallet**: Reown AppKit, wagmi, viem
- **Blockchain**: Base Sepolia, Hardhat, OpenZeppelin
- **Social**: Farcaster MiniApp SDK
- **Payments**: Circle USDC (ERC20)

##  Security

- ReentrancyGuard on all state-changing functions
- SafeERC20 for token transfers
- Admin-only access for aid approval
- Input validation on all parameters

## 📄 License

MIT

---

Built with ❤️ for MBC 2025 by Henry and Jahnvi | [Base](https://base.org) | [Circle](https://circle.com)
