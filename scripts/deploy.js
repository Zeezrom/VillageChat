const hre = require("hardhat");

async function main() {
  // Get the signer accounts
  const [account0, account1, account2] = await hre.ethers.getSigners();

  // Deploy contract using Account 0 as the owner
  const VillageChat = await hre.ethers.getContractFactory("VillageChat");
  const villageChat = await VillageChat.connect(account0).deploy("VillageChat", "VC");

  await villageChat.deployed();

  console.log("VillageChat deployed to:", villageChat.address);

  // Create channels using Account 0 (owner)
  await villageChat.connect(account0).createChannel("general", ethers.utils.parseEther("1"));
  await villageChat.connect(account0).createChannel("intro", ethers.utils.parseEther("0"));
  await villageChat.connect(account0).createChannel("jobs", ethers.utils.parseEther("0.25"));

  console.log("Channels created!");

  // Account 0 is already admin (owner is automatically admin)
  console.log(`Account 0 (${account0.address}) is both owner and admin`);

  // Add allowed token for access control
  try {
    await villageChat.connect(account0).addAllowedToken("0xbefA348a88D24D4B3DD42ca90eAF32c0340f3f00");
    console.log("Added allowed token: 0xbefA348a88D24D4B3DD42ca90eAF32c0340f3f00");
  } catch (error) {
    console.log("Could not add allowed token:", error.message);
  }

  console.log("\nDeployment complete!");
  console.log("Contract address:", villageChat.address);
  console.log("Owner & Admin (Account 0):", account0.address);
  console.log("Regular User (Account 1):", account1.address);
  console.log("Regular User (Account 2):", account2.address);
  
  console.log("\nAccount Details:");
  console.log("Account 0 (Owner & Admin):", account0.address);
  console.log("Account 1 (Regular User):", account1.address);
  console.log("Account 2 (Regular User):", account2.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });