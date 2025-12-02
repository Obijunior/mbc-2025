const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("CampusShieldModule", (m) => {
  const campusShield = m.contract("CampusShield");

  return { campusShield };
});
