const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// USDC addresses on different networks
const USDC_ADDRESSES = {
  // Base Sepolia (Testnet) - Circle's official USDC
  baseSepolia: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  // Base Mainnet - Circle's official USDC  
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  // Hardhat local - will use a mock
  hardhat: "0x0000000000000000000000000000000000000000",
};

module.exports = buildModule("CampusShieldModule", (m) => {
  // Get USDC address from parameter or use Base Sepolia default
  const usdcAddress = m.getParameter("usdcAddress", USDC_ADDRESSES.baseSepolia);
  
  const campusShield = m.contract("CampusShield", [usdcAddress]);

  return { campusShield };
});

// Export addresses for reference
module.exports.USDC_ADDRESSES = USDC_ADDRESSES;
