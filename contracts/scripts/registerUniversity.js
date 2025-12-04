const hre = require("hardhat");

async function main() {
  const contractAddress = "0x874EF5d547CF952D6903458099547Ee085D7182d";
  
  const CampusShield = await hre.ethers.getContractAt("CampusShield", contractAddress);
  
  console.log("Registering University of Kansas...");
  const tx = await CampusShield.registerUniversity("University of Kansas");
  await tx.wait();
  
  console.log("University registered successfully!");
  console.log("Transaction hash:", tx.hash);
  
  // Check if it was registered
  const count = await CampusShield.universityCount();
  console.log("Total universities:", count.toString());
  
  if (count > 0n) {
    const uni = await CampusShield.getUniversity(1);
    console.log("\nUniversity 1:");
    console.log("  Name:", uni[0]);
    console.log("  Admin:", uni[1]);
    console.log("  Balance:", uni[2].toString());
    console.log("  Active:", uni[3]);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
