const hre = require("hardhat");

async function main() {
  // Get the signer accounts
  const [account0, account1, account2] = await hre.ethers.getSigners();

  // Deploy contract using Account 1 as the owner
  const VillageChat = await hre.ethers.getContractFactory("VillageChat");
  const villageChat = await VillageChat.connect(account1).deploy("VillageChat", "VC");

  await villageChat.deployed();

  console.log("VillageChat deployed to:", villageChat.address);

  // Create channels using Account 1 (owner)
  await villageChat.connect(account1).createChannel("general", ethers.utils.parseEther("1"));
  await villageChat.connect(account1).createChannel("intro", ethers.utils.parseEther("0"));
  await villageChat.connect(account1).createChannel("jobs", ethers.utils.parseEther("0.25"));

  console.log("Channels created!");

  // Add Account 0 as admin using Account 1 (owner)
  try {
    await villageChat.connect(account1).addAdmin(account0.address);
    console.log(`Added ${account0.address} as admin`);
  } catch (error) {
    console.log("Could not add admin:", error.message);
  }

  console.log("\nDeployment complete!");
  console.log("Contract address:", villageChat.address);
  console.log("Owner (Account 1):", account1.address);
  console.log("Admin (Account 0):", account0.address);
  console.log("Regular User (Account 2):", account2.address);
  
  console.log("\nAccount Details:");
  console.log("Account 0 (Admin):", account0.address);
  console.log("Account 1 (Owner):", account1.address);
  console.log("Account 2 (Regular User):", account2.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });